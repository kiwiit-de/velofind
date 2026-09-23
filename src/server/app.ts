/**
 * VeloFind Express API Application Factory
 * Provides all API endpoints, middleware, and CORS configuration.
 * Used by server.ts (Node/Docker) and api/index.ts (Vercel Serverless).
 */

import express, { Request, Response, Application } from 'express';
import {
  verifyPostgresConnection,
  verifyPostgisExtension,
  PostgresHealthStatus,
  PostgisHealthStatus
} from './db/pool.ts';
import {
  dealersRepository,
  offersRepository,
  leasingProvidersRepository,
  leadsRepository,
  outboundClicksRepository,
  importRunsRepository,
  auditEventsRepository,
  userAlertsRepository
} from './db/repositories/index.ts';
import { feedIngestionService } from './services/feed-ingestion.service.ts';
import { dailySyncService } from './services/daily-sync.service.ts';
import { imageFetcherService } from './services/image-fetcher.service.ts';
import { marketTrendsService } from './services/market-trends.service.ts';
import { priceAlertService } from './services/price-alert.service.ts';

import { GERMAN_LOCATIONS, sanitizeCSVField, generateUUID } from './db/utils.ts';
import { metricsMiddleware, handleMetricsEndpoint, metrics } from './monitoring/metrics.ts';
import { handleLivenessCheck, handleReadinessCheck } from './monitoring/health.ts';
import type { LeadStatus, BikeCategory, PropulsionType, AvailabilityStatus, OfferCondition } from '../types.ts';

let isDbCheckInitiated = false;

export async function createApp(): Promise<Application> {
  const app = express();

  // Permissive CORS for Vercel, external preview, and third-party frontend callers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Operational metrics recording for all requests
  app.use(metricsMiddleware);

  // Non-blocking database connection check on initial boot
  if (!isDbCheckInitiated) {
    isDbCheckInitiated = true;
    verifyPostgresConnection()
      .then(async (pgStatus: PostgresHealthStatus) => {
        if (pgStatus.connected) {
          console.log(`[PostgreSQL 17] Connected: ${pgStatus.version?.split(' on ')[0]} (${pgStatus.latencyMs}ms)`);
          const postgisStatus = await verifyPostgisExtension();
          if (postgisStatus.available) {
            console.log(`[PostGIS 3.5] Spatial extension: ${postgisStatus.fullVersion || postgisStatus.installedVersion}`);
          }
        } else {
          console.warn(`[PostgreSQL 17] Running with in-memory catalog fallback (${pgStatus.error || 'No DB'})`);
        }
      })
      .catch((err) => {
        console.warn('[PostgreSQL 17] Non-blocking DB check:', err.message);
      });
  }

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API router to mount under both /api and root (guarantees compatibility with all Vercel/proxy rewrites)
  const apiRouter = express.Router();

  // --- HEALTH & READINESS PROBES ---
  apiRouter.get('/health/live', handleLivenessCheck);
  apiRouter.get('/health/ready', handleReadinessCheck);
  apiRouter.get('/metrics', handleMetricsEndpoint);

  // General health summary
  apiRouter.get('/health', async (_req: Request, res: Response) => {
    const currentPg = await verifyPostgresConnection();
    const currentPostgis = currentPg.connected
      ? await verifyPostgisExtension()
      : { available: false, error: 'Database disconnected' };

    res.json({
      status: 'healthy',
      service: 'velofind-core',
      timestamp: new Date().toISOString(),
      version: '1.0.0-mvp',
      database: currentPg.connected ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'development',
      postgres: {
        connected: currentPg.connected,
        version: currentPg.version,
        database: currentPg.database,
        latency_ms: currentPg.latencyMs,
        pool_size: currentPg.poolSize,
        error: currentPg.error
      },
      postgis: {
        available: currentPostgis.available,
        version: currentPostgis.installedVersion || currentPostgis.fullVersion,
        error: currentPostgis.error
      }
    });
  });

  // --- PUBLIC SEARCH API ---
  apiRouter.get('/search', async (req: Request, res: Response) => {
    try {
      const {
        q,
        category,
        propulsion,
        brand,
        provider,
        dealer,
        dealerId,
        dealerSlug,
        minPrice,
        maxPrice,
        availability,
        condition,
        postalCode,
        city,
        lat,
        lng,
        radius,
        sort,
        limit,
        offset
      } = req.query;

      const filters = {
        query: q ? String(q) : undefined,
        category: category ? (String(category) as BikeCategory) : undefined,
        propulsion: propulsion ? (String(propulsion) as PropulsionType) : undefined,
        brand: brand ? String(brand) : undefined,
        leasingProvider: provider ? String(provider) : undefined,
        dealerId: dealerId ? String(dealerId) : undefined,
        dealerSlug: dealerSlug ? String(dealerSlug) : undefined,
        dealerName: dealer ? String(dealer) : undefined,
        minPrice: minPrice ? parseFloat(String(minPrice)) : undefined,
        maxPrice: maxPrice ? parseFloat(String(maxPrice)) : undefined,
        availability: availability ? (String(availability) as AvailabilityStatus) : undefined,
        condition: condition ? (String(condition) as OfferCondition) : undefined,
        postalCode: postalCode ? String(postalCode) : undefined,
        city: city ? String(city) : undefined,
        latitude: lat ? parseFloat(String(lat)) : undefined,
        longitude: lng ? parseFloat(String(lng)) : undefined,
        radiusKm: radius ? parseFloat(String(radius)) : undefined,
        sort: sort ? (String(sort) as any) : undefined,
        limit: limit ? parseInt(String(limit), 10) : 48,
        offset: offset ? parseInt(String(offset), 10) : 0
      };

      const result = await offersRepository.search(filters);
      res.json(result);
    } catch (err: any) {
      console.error('Search error:', err);
      res.status(500).json({ error: 'Fehler bei der Angebotssuche', details: err.message });
    }
  });

  // --- GET SINGLE OFFER DETAILS ---
  apiRouter.get('/offers/:id', async (req: Request, res: Response) => {
    try {
      const offer = await offersRepository.findById(req.params.id);
      if (!offer) {
        return res.status(404).json({ error: 'Angebot nicht gefunden' });
      }
      res.json(offer);
    } catch (err: any) {
      res.status(500).json({ error: 'Fehler beim Laden des Angebots', details: err.message });
    }
  });

  // --- DEALERS LIST & DETAIL ---
  apiRouter.get('/dealers', async (_req: Request, res: Response) => {
    try {
      const dealers = await dealersRepository.findAllWithLocations(true);
      res.json(dealers);
    } catch (err: any) {
      res.status(500).json({ error: 'Fehler beim Abrufen der Händler', details: err.message });
    }
  });

  apiRouter.get('/dealers/:slug', async (req: Request, res: Response) => {
    try {
      const dealer = await dealersRepository.findBySlugWithDetails(req.params.slug);
      if (!dealer) {
        return res.status(404).json({ error: 'Händler nicht gefunden' });
      }
      const searchResult = await offersRepository.search({ dealerSlug: dealer.slug, limit: 100 });
      res.json({ dealer, offers: searchResult.offers });
    } catch (err: any) {
      res.status(500).json({ error: 'Fehler beim Abrufen des Händlers', details: err.message });
    }
  });

  // --- LEASING PROVIDERS ---
  apiRouter.get('/leasing-providers', async (_req: Request, res: Response) => {
    try {
      const providers = await leasingProvidersRepository.findAllActive();
      res.json(providers);
    } catch (err: any) {
      res.status(500).json({ error: 'Fehler beim Abrufen der Leasinganbieter', details: err.message });
    }
  });

  apiRouter.get('/leasing-providers/:slug', async (req: Request, res: Response) => {
    try {
      const provider = await leasingProvidersRepository.findBySlug(req.params.slug);
      if (!provider) {
        return res.status(404).json({ error: 'Leasinganbieter nicht gefunden' });
      }

      const allDealers = await dealersRepository.findAllWithLocations(true);
      const participatingDealers = allDealers.filter((d) =>
        d.supported_providers?.some((sp) => sp.provider_slug === provider.slug)
      );

      const searchResult = await offersRepository.search({ leasingProvider: provider.slug, limit: 50 });

      res.json({
        provider,
        dealers: participatingDealers,
        offers: searchResult.offers
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Fehler beim Abrufen des Leasinganbieters', details: err.message });
    }
  });

  // --- OUTBOUND CLICK ATTRIBUTION ---
  const handleOutboundRedirect = async (req: Request, res: Response) => {
    try {
      const { offerId } = req.params;
      const referer = req.get('Referer') || '';
      const offer = await offersRepository.findById(offerId);

      if (!offer) {
        return res.status(400).json({ error: 'Angebot nicht gefunden' });
      }

      if (!offer.source_url.startsWith('https://')) {
        return res.status(400).json({ error: 'Ungültiges Weiterleitungsziel' });
      }

      const sessionHash = 'anon-' + generateUUID().slice(0, 12);
      await outboundClicksRepository.recordClick({
        id: generateUUID(),
        offer_id: offer.id,
        dealer_id: offer.dealer_id,
        destination_url: offer.source_url,
        session_hash: sessionHash,
        referer: referer || null
      });

      await auditEventsRepository.recordEvent({
        actor_role: 'ANONYMOUS',
        event_type: 'CLICK_ATTRIBUTED',
        entity_type: 'OFFER',
        entity_id: offer.id,
        metadata: { destination: offer.source_url }
      });

      metrics.recordOutboundClick();

      if (req.query.json === 'true') {
        return res.json({ redirectUrl: offer.source_url });
      }
      res.redirect(302, offer.source_url);
    } catch (err: any) {
      res.status(500).json({ error: 'Fehler bei der Weiterleitung', details: err.message });
    }
  };

  apiRouter.get('/out/:offerId', handleOutboundRedirect);

  // --- LEAD CAPTURE ---
  apiRouter.post('/leads', async (req: Request, res: Response) => {
    try {
      const {
        offer_id,
        customer_name,
        customer_email,
        customer_phone,
        message,
        enquiry_type,
        consent_given,
        honeypot
      } = req.body;

      if (honeypot && String(honeypot).trim() !== '') {
        return res.status(400).json({ error: 'Spam detected' });
      }

      if (!consent_given) {
        return res.status(400).json({ error: 'Die Einwilligung zur Kontaktaufnahme ist erforderlich.' });
      }

      if (!offer_id || !customer_name || !customer_email) {
        return res.status(400).json({ error: 'Pflichtfelder fehlen (offer_id, Name, E-Mail)' });
      }

      const offer = await offersRepository.findById(offer_id);
      if (!offer) {
        return res.status(400).json({ error: 'Zugehöriges Angebot nicht gefunden' });
      }

      const lead = await leadsRepository.create({
        id: generateUUID(),
        offer_id: offer.id,
        dealer_id: offer.dealer_id,
        customer_name: sanitizeCSVField(customer_name),
        customer_email: String(customer_email).trim().toLowerCase(),
        customer_phone: customer_phone ? sanitizeCSVField(customer_phone) : null,
        message: message ? sanitizeCSVField(message) : null,
        enquiry_type: enquiry_type || 'TEST_RIDE',
        status: 'NEW'
      });

      await auditEventsRepository.recordEvent({
        actor_role: 'CUSTOMER',
        event_type: 'LEAD_CREATED',
        entity_type: 'LEAD',
        entity_id: lead.id,
        metadata: { dealer_id: lead.dealer_id, offer_id: lead.offer_id }
      });

      metrics.recordLeadCreated();

      res.status(201).json({
        success: true,
        message: 'Anfrage erfolgreich an den Händler übermittelt',
        leadId: lead.id
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Fehler beim Senden der Anfrage', details: err.message });
    }
  });

  // --- USER ALERTS (PRICE DROP NOTIFICATIONS) ---
  apiRouter.post('/alerts', async (req: Request, res: Response) => {
    try {
      const { offer_id, offerId, email, target_price_cents, targetPriceCents, user_id, userId } = req.body;
      const targetOfferId = offer_id || offerId;
      const userEmail = email ? String(email).trim().toLowerCase() : '';
      const targetPrice = target_price_cents ?? targetPriceCents ?? null;

      if (!targetOfferId || !userEmail) {
        return res.status(400).json({ error: 'Pflichtangaben fehlen (offer_id und email erforderlich)' });
      }

      // Email format check
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
        return res.status(400).json({ error: 'Ungültige E-Mail-Adresse angegeben' });
      }

      const result = await priceAlertService.subscribe({
        offerId: targetOfferId,
        email: userEmail,
        targetPriceCents: targetPrice ? Math.round(Number(targetPrice)) : null,
        userId: user_id || userId || null
      });

      res.status(201).json({
        success: true,
        isNew: result.isNew,
        alert: result.alert,
        offerTitle: result.offerTitle,
        currentPriceCents: result.currentPriceCents,
        message: result.isNew
          ? `Preisalarm erfolgreich scharfgeschaltet! Wir benachrichtigen dich an ${userEmail}, sobald der Preis fällt.`
          : `Du beobachtest dieses Fahrrad bereits unter ${userEmail}.`
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Fehler beim Erstellen des Preisalarms', details: err.message });
    }
  });

  apiRouter.get('/alerts/count/:offerId', async (req: Request, res: Response) => {
    try {
      const { offerId } = req.params;
      const count = await userAlertsRepository.countActiveByOfferId(offerId);
      res.json({ offerId, count });
    } catch (err: any) {
      res.status(500).json({ error: 'Fehler beim Abrufen der Beobachter-Anzahl', details: err.message });
    }
  });

  apiRouter.get('/alerts', async (req: Request, res: Response) => {
    try {
      const email = req.query.email ? String(req.query.email) : undefined;
      const offerId = req.query.offerId ? String(req.query.offerId) : undefined;

      if (email) {
        const alerts = await userAlertsRepository.findByEmail(email);
        return res.json({ alerts, count: alerts.length });
      }

      if (offerId) {
        const alerts = await userAlertsRepository.findActiveByOfferId(offerId);
        return res.json({ alerts, count: alerts.length });
      }

      res.status(400).json({ error: 'Parameter email oder offerId erforderlich' });
    } catch (err: any) {
      res.status(500).json({ error: 'Fehler beim Abrufen der Preisalarme', details: err.message });
    }
  });

  apiRouter.delete('/alerts/:id', async (req: Request, res: Response) => {
    try {
      const deleted = await userAlertsRepository.delete(req.params.id);
      res.json({ success: deleted });
    } catch (err: any) {
      res.status(500).json({ error: 'Fehler beim Löschen des Preisalarms', details: err.message });
    }
  });

  apiRouter.post('/alerts/simulate-drop', async (req: Request, res: Response) => {
    try {
      const { offerId, dropPercent } = req.body;
      if (!offerId) {
        return res.status(400).json({ error: 'offerId ist erforderlich' });
      }
      const result = await priceAlertService.simulatePriceDrop(offerId, dropPercent ? Number(dropPercent) : 10);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(500).json({ error: 'Fehler bei Preissenkungssimulation', details: err.message });
    }
  });


  // --- DEALER CSV FEED INGESTION API ---
  apiRouter.post('/dealers/import-feed', async (req: Request, res: Response) => {
    try {
      const { dealer_id, csv_content } = req.body;

      if (!dealer_id || !csv_content) {
        return res.status(400).json({ error: 'dealer_id und csv_content sind erforderlich' });
      }

      const report = await feedIngestionService.importCSVFeed(dealer_id, csv_content);

      metrics.recordFeedImportRun({
        success: report.failedRows === 0,
        importedRows: report.importedRows,
        quarantinedRows: report.failedRows
      });

      res.status(200).json({
        success: true,
        report
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Import fehlgeschlagen', details: err.message });
    }
  });

  // --- ADMIN & STATS API ---
  apiRouter.get('/admin/overview', async (_req: Request, res: Response) => {
    try {
      const [activeOffers, dealers, leads, clicks, providers, importRuns] = await Promise.all([
        offersRepository.countActive(),
        dealersRepository.count(),
        leadsRepository.count(),
        outboundClicksRepository.count(),
        leasingProvidersRepository.count(),
        importRunsRepository.count()
      ]);

      res.json({
        activeOffersCount: activeOffers,
        dealersCount: dealers,
        leadsCount: leads,
        clicksCount: clicks,
        providersCount: providers,
        importRunsCount: importRuns
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Fehler beim Laden der Admin-Statistiken', details: err.message });
    }
  });

  apiRouter.get('/admin/leads', async (req: Request, res: Response) => {
    try {
      const dealerId = req.query.dealer_id ? String(req.query.dealer_id) : undefined;
      const leads = await leadsRepository.findByDealerId(dealerId);
      res.json(leads);
    } catch (err: any) {
      res.status(500).json({ error: 'Fehler beim Laden der Leads', details: err.message });
    }
  });

  apiRouter.patch('/admin/leads/:id', async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      if (!status) return res.status(400).json({ error: 'Status erforderlich' });

      const updated = await leadsRepository.updateStatus(req.params.id, status as LeadStatus);
      if (!updated) return res.status(404).json({ error: 'Lead nicht gefunden' });

      await auditEventsRepository.recordEvent({
        actor_role: 'ADMIN',
        event_type: 'LEAD_STATUS_UPDATED',
        entity_type: 'LEAD',
        entity_id: req.params.id,
        metadata: { new_status: status }
      });

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: 'Fehler beim Aktualisieren des Leads', details: err.message });
    }
  });

  apiRouter.get('/admin/audit-logs', async (_req: Request, res: Response) => {
    try {
      const logs = await auditEventsRepository.findAll();
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ error: 'Fehler beim Laden der Audit-Logs', details: err.message });
    }
  });

  apiRouter.get('/admin/import-runs', async (req: Request, res: Response) => {
    try {
      const dealerId = req.query.dealer_id ? String(req.query.dealer_id) : undefined;
      const runs = await importRunsRepository.findByDealerId(dealerId);
      res.json(runs);
    } catch (err: any) {
      res.status(500).json({ error: 'Fehler beim Laden der Import-Läufe', details: err.message });
    }
  });

  apiRouter.get('/locations', (_req: Request, res: Response) => {
    res.json(GERMAN_LOCATIONS);
  });

  // --- DAILY CATALOG SYNC ---
  apiRouter.get('/sync/status', (_req: Request, res: Response) => {
    res.json(dailySyncService.getStatus());
  });

  apiRouter.post('/sync/trigger', async (_req: Request, res: Response) => {
    try {
      const report = await dailySyncService.runDailySync();
      res.json({ success: true, report });
    } catch (err: any) {
      res.status(500).json({ error: 'Fehler beim Bestandsabgleich', details: err.message });
    }
  });

  apiRouter.post('/admin/reseed', async (_req: Request, res: Response) => {
    try {
      const report = await dailySyncService.runDailySync();
      res.json({ success: true, message: 'Datenbestand erfolgreich neu eingelesen', report });
    } catch (err: any) {
      res.status(500).json({ error: 'Fehler beim Reseed', details: err.message });
    }
  });

  // --- GEMINI AI MARKET TRENDS & REGIONAL INSIGHTS API ---
  apiRouter.post('/market-trends', async (req: Request, res: Response) => {
    try {
      const {
        postalCode,
        radiusKm,
        category,
        propulsion,
        brand,
        provider,
        dealerSlug,
        query
      } = req.body || {};

      const result = await marketTrendsService.getMarketTrends({
        postalCode: postalCode ? String(postalCode) : undefined,
        radiusKm: radiusKm ? Number(radiusKm) : undefined,
        category: category ? String(category) : undefined,
        propulsion: propulsion ? String(propulsion) : undefined,
        brand: brand ? String(brand) : undefined,
        provider: provider ? String(provider) : undefined,
        dealerSlug: dealerSlug ? String(dealerSlug) : undefined,
        query: query ? String(query) : undefined
      });

      res.json(result);
    } catch (err: any) {
      console.error('Market trends API error:', err);
      res.status(500).json({ error: 'Marktanalyse konnte nicht geladen werden', details: err.message });
    }
  });

  // --- ORIGINAL BIKE IMAGE EXTRACTION & RESOLUTION API ---
  apiRouter.get('/images/resolve', async (req: Request, res: Response) => {
    try {
      const targetUrl = req.query.url ? String(req.query.url) : '';
      if (!targetUrl) {
        return res.status(400).json({ error: 'url query parameter is required' });
      }
      const extractedImage = await imageFetcherService.extractOriginalImageFromUrl(targetUrl);
      res.json({
        url: targetUrl,
        extractedImage,
        resolved: !!extractedImage
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Image extraction failed', details: err.message });
    }
  });

  apiRouter.post('/offers/:id/refresh-image', async (req: Request, res: Response) => {
    try {
      const offerId = req.params.id;
      const offer = await offersRepository.findById(offerId);
      if (!offer) {
        return res.status(404).json({ error: 'Offer not found' });
      }

      let newImage = await imageFetcherService.extractOriginalImageFromUrl(offer.source_url);
      if (!newImage) {
        newImage = imageFetcherService.getVerifiedModelImage(offer.brand_name, offer.title, offer.category);
      }

      await offersRepository.update(offerId, { image_url: newImage });
      res.json({ success: true, offerId, image_url: newImage });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to refresh offer image', details: err.message });
    }
  });

  // Mount API router under both /api AND root (for maximal flexibility with proxies and serverless rewrites)
  app.use('/api', apiRouter);
  app.use('/', apiRouter);

  return app;
}
