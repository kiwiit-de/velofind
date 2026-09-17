/**
 * VeloFind Full-Stack Server
 * Express 4 API Backend + Vite Single Page Application Middleware
 * Fully routed through PostgreSQL 17 + PostGIS via Kysely Repositories
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  verifyPostgresConnection,
  verifyPostgisExtension,
  closePool,
  PostgresHealthStatus,
  PostgisHealthStatus
} from './src/server/db/pool.ts';
import {
  dealersRepository,
  offersRepository,
  leasingProvidersRepository,
  leadsRepository,
  outboundClicksRepository,
  importRunsRepository,
  auditEventsRepository
} from './src/server/db/repositories/index.ts';
import { feedIngestionService } from './src/server/services/feed-ingestion.service.ts';
import { dailySyncService } from './src/server/services/daily-sync.service.ts';
import { imageFetcherService } from './src/server/services/image-fetcher.service.ts';
import { GERMAN_LOCATIONS, sanitizeCSVField, generateUUID } from './src/server/db/utils.ts';
import { metricsMiddleware, handleMetricsEndpoint, metrics } from './src/server/monitoring/metrics.ts';
import { handleLivenessCheck, handleReadinessCheck } from './src/server/monitoring/health.ts';
import type { LeadStatus, BikeCategory, PropulsionType, AvailabilityStatus, OfferCondition } from './src/types.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Operational metrics recording for all requests
  app.use(metricsMiddleware);

  // Startup verification for PostgreSQL 17 + PostGIS
  console.log('[PostgreSQL 17] Verifying database connection pool...');
  let pgStatus: PostgresHealthStatus = await verifyPostgresConnection();
  let postgisStatus: PostgisHealthStatus = { available: false };

  if (pgStatus.connected) {
    console.log(`[PostgreSQL 17] Connected successfully: ${pgStatus.version?.split(' on ')[0]} (${pgStatus.latencyMs}ms)`);
    postgisStatus = await verifyPostgisExtension();
    if (postgisStatus.available) {
      console.log(`[PostGIS 3.5] Spatial extension verified: ${postgisStatus.fullVersion || postgisStatus.installedVersion}`);
    } else {
      console.warn(`[PostGIS 3.5] Spatial extension check: ${postgisStatus.error}`);
    }
  } else {
    console.warn(`[PostgreSQL 17] Notice: Live database offline (${pgStatus.error}).`);
  }

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logger
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/out')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // --- HEALTH & READINESS PROBES (Phase 29) ---
  app.get('/api/health/live', handleLivenessCheck);
  app.get('/api/health/ready', handleReadinessCheck);
  app.get('/api/metrics', handleMetricsEndpoint);

  // General health summary
  app.get('/api/health', async (_req: Request, res: Response) => {
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

  // --- PUBLIC SEARCH API (POSTGIS RADIUS + FULL-TEXT VIA KYSELY) ---
  app.get('/api/search', async (req: Request, res: Response) => {
    try {
      const {
        q,
        category,
        propulsion,
        brand,
        provider,
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
        limit: limit ? parseInt(String(limit), 10) : 24,
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
  app.get('/api/offers/:id', async (req: Request, res: Response) => {
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
  app.get('/api/dealers', async (_req: Request, res: Response) => {
    try {
      const dealers = await dealersRepository.findAllWithLocations(true);
      res.json(dealers);
    } catch (err: any) {
      res.status(500).json({ error: 'Fehler beim Abrufen der Händler', details: err.message });
    }
  });

  app.get('/api/dealers/:slug', async (req: Request, res: Response) => {
    try {
      const dealer = await dealersRepository.findBySlugWithDetails(req.params.slug);
      if (!dealer) {
        return res.status(404).json({ error: 'Händler nicht gefunden' });
      }
      const searchResult = await offersRepository.search({ dealerId: dealer.id, limit: 100 });
      res.json({ dealer, offers: searchResult.offers });
    } catch (err: any) {
      res.status(500).json({ error: 'Fehler beim Abrufen des Händlers', details: err.message });
    }
  });

  // --- LEASING PROVIDERS ---
  app.get('/api/leasing-providers', async (_req: Request, res: Response) => {
    try {
      const providers = await leasingProvidersRepository.findAllActive();
      res.json(providers);
    } catch (err: any) {
      res.status(500).json({ error: 'Fehler beim Abrufen der Leasinganbieter', details: err.message });
    }
  });

  app.get('/api/leasing-providers/:slug', async (req: Request, res: Response) => {
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

  app.get('/out/:offerId', handleOutboundRedirect);
  app.get('/api/out/:offerId', handleOutboundRedirect);

  // --- LEAD CAPTURE (DSGVO COMPLIANT + HONEYPOT) ---
  app.post('/api/leads', async (req: Request, res: Response) => {
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

  // --- DEALER CSV FEED INGESTION API ---
  app.post('/api/dealers/import-feed', async (req: Request, res: Response) => {
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
  app.get('/api/admin/overview', async (_req: Request, res: Response) => {
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

  app.get('/api/admin/leads', async (req: Request, res: Response) => {
    try {
      const dealerId = req.query.dealer_id ? String(req.query.dealer_id) : undefined;
      const leads = await leadsRepository.findByDealerId(dealerId);
      res.json(leads);
    } catch (err: any) {
      res.status(500).json({ error: 'Fehler beim Laden der Leads', details: err.message });
    }
  });

  app.patch('/api/admin/leads/:id', async (req: Request, res: Response) => {
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

  app.get('/api/admin/audit-logs', async (_req: Request, res: Response) => {
    try {
      const logs = await auditEventsRepository.findAll();
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ error: 'Fehler beim Laden der Audit-Logs', details: err.message });
    }
  });

  app.get('/api/admin/import-runs', async (req: Request, res: Response) => {
    try {
      const dealerId = req.query.dealer_id ? String(req.query.dealer_id) : undefined;
      const runs = await importRunsRepository.findByDealerId(dealerId);
      res.json(runs);
    } catch (err: any) {
      res.status(500).json({ error: 'Fehler beim Laden der Import-Läufe', details: err.message });
    }
  });

  app.get('/api/locations', (_req: Request, res: Response) => {
    res.json(GERMAN_LOCATIONS);
  });

  // --- DAILY CATALOG SYNC & INVENTORY FRESHNESS API ---
  app.get('/api/sync/status', (_req: Request, res: Response) => {
    res.json(dailySyncService.getStatus());
  });

  app.post('/api/sync/trigger', async (_req: Request, res: Response) => {
    try {
      const report = await dailySyncService.runDailySync();
      res.json({ success: true, report });
    } catch (err: any) {
      res.status(500).json({ error: 'Tägliche Aktualisierung fehlgeschlagen', details: err.message });
    }
  });

  // --- ORIGINAL BIKE IMAGE EXTRACTION & RESOLUTION API ---
  app.get('/api/images/resolve', async (req: Request, res: Response) => {
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

  app.post('/api/offers/:id/refresh-image', async (req: Request, res: Response) => {
    try {
      const offerId = req.params.id;
      const offer = await offersRepository.findById(offerId);
      if (!offer) {
        return res.status(404).json({ error: 'Offer not found' });
      }

      // Attempt to extract original image from dealer website source_url
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

  // --- VITE MIDDLEWARE (DEV) OR STATIC ASSETS (PROD) ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[VeloFind] Core Platform Server listening on http://0.0.0.0:${PORT}`);
  });

  const gracefulShutdown = async (signal: string) => {
    console.log(`[VeloFind] Received ${signal}. Closing server and PostgreSQL pool...`);
    server.close(async () => {
      await closePool();
      console.log('[VeloFind] Shutdown complete.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('[VeloFind] Startup fatal error:', err);
  process.exit(1);
});
