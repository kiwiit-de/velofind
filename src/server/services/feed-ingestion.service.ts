/**
 * VeloFind Authorized CSV Feed Ingestion Engine
 * Fully routed through PostgreSQL 17 + Kysely repository layer.
 * Implements formula injection defense, idempotency, price change history,
 * and automated error quarantining.
 */

import { getKysely } from '../db/kysely.ts';
import {
  dealersRepository,
  offersRepository,
  offerPriceHistoryRepository,
  importRunsRepository,
  auditEventsRepository,
  leasingProvidersRepository
} from '../db/repositories/index.ts';
import { sanitizeCSVField, generateUUID } from '../db/utils.ts';
import type { ImportStatus, AvailabilityStatus, OfferCondition } from '../db/schema.ts';
import type { Offer } from '../../types.ts';
import { PARTNER_OFFERS_DATA, PARTNER_DEALERS_DATA } from '../db/dealer-registry.ts';
import { enrichBikeSpecs } from './spec-enricher.service.ts';
import { imageFetcherService } from './image-fetcher.service.ts';
import { priceAlertService } from './price-alert.service.ts';


export interface FeedImportError {
  line: number;
  error: string;
  raw: string;
}

export interface FeedImportReport {
  runId: string;
  totalRows: number;
  importedRows: number;
  failedRows: number;
  errors: FeedImportError[];
}

export class FeedIngestionService {
  private get db() {
    return getKysely();
  }

  async importCSVFeed(dealerId: string, csvContent: string): Promise<FeedImportReport> {
    const dealer = await dealersRepository.findById(dealerId);
    if (!dealer) {
      throw new Error(`Dealer with ID "${dealerId}" not found in database`);
    }

    // Ensure dealer has an active data source record
    let dataSource = await this.db
      .selectFrom('data_sources')
      .selectAll()
      .where('dealer_id', '=', dealerId)
      .where('source_type', '=', 'CSV')
      .executeTakeFirst();

    if (!dataSource) {
      dataSource = await this.db
        .insertInto('data_sources')
        .values({
          dealer_id: dealerId,
          name: `${dealer.name} CSV Feed`,
          source_type: 'CSV',
          is_active: true
        })
        .returningAll()
        .executeTakeFirstOrThrow();
    }

    const runId = generateUUID();
    const lines = csvContent.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);

    if (lines.length <= 1) {
      const emptyRun = await importRunsRepository.createRun({
        id: runId,
        source_id: dataSource.id,
        status: 'COMPLETED',
        total_rows: 0,
        imported_rows: 0,
        failed_rows: 0,
        finished_at: new Date(),
        error_summary: 'Leere Feed-Datei übermittelt'
      });
      return { runId: emptyRun.id, totalRows: 0, importedRows: 0, failedRows: 0, errors: [] };
    }

    const header = lines[0].split(',').map((h) => h.trim());
    const dataLines = lines.slice(1);
    const errors: FeedImportError[] = [];
    let importedCount = 0;

    // Fetch dealer's participating leasing providers for auto-compatibility
    const participations = await leasingProvidersRepository.findByDealerId(dealerId);

    // Create Initial Import Run
    await importRunsRepository.createRun({
      id: runId,
      source_id: dataSource.id,
      status: 'RUNNING',
      total_rows: dataLines.length,
      imported_rows: 0,
      failed_rows: 0
    });

    for (let idx = 0; idx < dataLines.length; idx++) {
      const line = dataLines[idx];
      const lineNum = idx + 2;
      const values = this.parseCSVRow(line);

      if (values.length < 10) {
        const errorMsg = 'Unvollständige Zeile: Mindestens 10 Kernspalten erforderlich';
        errors.push({ line: lineNum, error: errorMsg, raw: line });
        await importRunsRepository.recordRow({
          import_run_id: runId,
          row_number: lineNum,
          raw_payload: line,
          error_message: errorMsg,
          status: 'REJECTED'
        });
        continue;
      }

      const row: Record<string, string> = {};
      header.forEach((h, i) => {
        row[h] = values[i] !== undefined ? values[i].trim() : '';
      });

      // Defensive validation & Formula Injection Defense
      const externalId = sanitizeCSVField(row.external_id);
      const brand = sanitizeCSVField(row.brand);
      const model = sanitizeCSVField(row.model);
      const title = sanitizeCSVField(row.title || `${brand} ${model}`);
      const priceRaw = parseFloat(row.price);
      const sourceUrl = row.source_url;

      if (!externalId) {
        const errorMsg = 'external_id fehlt';
        errors.push({ line: lineNum, error: errorMsg, raw: line });
        await importRunsRepository.recordRow({
          import_run_id: runId,
          row_number: lineNum,
          raw_payload: line,
          error_message: errorMsg,
          status: 'REJECTED'
        });
        continue;
      }
      if (!brand || !model) {
        const errorMsg = 'Marke oder Modellname fehlt';
        errors.push({ line: lineNum, error: errorMsg, raw: line });
        await importRunsRepository.recordRow({
          import_run_id: runId,
          row_number: lineNum,
          raw_payload: line,
          error_message: errorMsg,
          status: 'REJECTED'
        });
        continue;
      }
      if (isNaN(priceRaw) || priceRaw <= 648) {
        const errorMsg = isNaN(priceRaw) || priceRaw <= 0
          ? `Ungültiger Preis: "${row.price}"`
          : `Preis liegt nicht über Mindestgrenze von 648 €: "${row.price} €" (Mindestanforderung für Dienstrad-Leasing / Bikes)`;
        errors.push({ line: lineNum, error: errorMsg, raw: line });
        await importRunsRepository.recordRow({
          import_run_id: runId,
          row_number: lineNum,
          raw_payload: line,
          error_message: errorMsg,
          status: 'REJECTED'
        });
        continue;
      }
      if (!sourceUrl || !sourceUrl.startsWith('http')) {
        const errorMsg = 'Gültige source_url (http/https) erforderlich';
        errors.push({ line: lineNum, error: errorMsg, raw: line });
        await importRunsRepository.recordRow({
          import_run_id: runId,
          row_number: lineNum,
          raw_payload: line,
          error_message: errorMsg,
          status: 'REJECTED'
        });
        continue;
      }

      const priceCents = Math.round(priceRaw * 100);
      const compareAtPriceCents = row.compare_at_price ? Math.round(parseFloat(row.compare_at_price) * 100) : null;
      const availability = (row.availability as AvailabilityStatus) || 'IN_STOCK';
      const condition = (row.condition as OfferCondition) || 'NEW';
      const quantity = parseInt(row.quantity, 10) || 1;

      // Check existing offer for price change recording
      const existingOffer = await offersRepository.findBySourceAndExternalId(dataSource.id, externalId);

      if (existingOffer && existingOffer.price_cents !== priceCents) {
        await offerPriceHistoryRepository.recordChange({
          offer_id: existingOffer.id,
          old_price_cents: existingOffer.price_cents,
          new_price_cents: priceCents
        });

        // If price dropped, trigger UserAlerts notifications
        if (priceCents < existingOffer.price_cents) {
          priceAlertService
            .checkAndTriggerAlertsForPriceDrop(existingOffer.id, existingOffer.price_cents, priceCents)
            .catch((err) => console.error('[FeedIngestionService] Price drop notification error:', err));
        }
      }

      // Extract technical specifications (weight, max weight, engine type, engine brand, torque/strength)
      const weightRaw = parseFloat(row.weight || row.weight_kg || row.gewicht || '');
      const maxWeightRaw = parseFloat(row.max_weight || row.max_weight_kg || row.zuladung || row.systemgewicht || row.max_system_weight || '');
      const torqueRaw = parseFloat(row.torque || row.torque_nm || row.engine_strength || row.drehmoment || row.nm || '');
      const batteryRaw = parseFloat(row.battery || row.battery_wh || row.akku || '');
      const engineType = row.engine_type || row.motortyp || row.motor_type || undefined;
      const motorBrand = row.motor_brand || row.engine_marke || row.motor_hersteller || undefined;
      const motorModel = row.motor_model || row.motor || undefined;

      const variantDetails = enrichBikeSpecs({
        title,
        brand_name: brand,
        category: (row.category as any) || 'E_BIKE',
        propulsion: (row.propulsion as any) || 'PEDELEC',
        price_cents: priceCents,
        existing: {
          weight_kg: isNaN(weightRaw) ? undefined : weightRaw,
          max_weight_kg: isNaN(maxWeightRaw) ? undefined : maxWeightRaw,
          torque_nm: isNaN(torqueRaw) ? undefined : torqueRaw,
          battery_wh: isNaN(batteryRaw) ? undefined : batteryRaw,
          engine_type: engineType,
          motor_brand: motorBrand,
          motor_model: motorModel,
          frame_size: row.frame_size,
          color: row.color,
          sku: externalId
        }
      });

      // Upsert offer directly into PostgreSQL
      const savedOffer = await offersRepository.upsertBySourceAndExternalId({
        id: existingOffer ? existingOffer.id : generateUUID(),
        dealer_id: dealerId,
        source_id: dataSource.id,
        external_id: externalId,
        title,
        price_cents: priceCents,
        compare_at_price_cents: compareAtPriceCents,
        currency: row.currency || 'EUR',
        availability,
        quantity,
        condition,
        source_url: sourceUrl,
        image_url: row.image_url || imageFetcherService.getVerifiedModelImage(brand, row.model || row.title, row.category),
        content_hash: 'hash-' + generateUUID().slice(0, 10),
        is_active: true
      });

      // Sync into in-memory PARTNER_OFFERS_DATA for instant catalog visibility
      const dealerObj = PARTNER_DEALERS_DATA.find((d) => d.id === dealerId);
      const memoryOffer: Offer = {
        id: savedOffer.id,
        dealer_id: dealerId,
        dealer_name: dealerObj?.name || 'Partner Fachhändler',
        dealer_slug: dealerObj?.slug || 'partner-fachhaendler',
        dealer_verified: true,
        dealer_locations: dealerObj?.locations || [],
        source_id: dataSource.id,
        external_id: externalId,
        title,
        brand_name: brand,
        model_name: model,
        model_year: 2025,
        category: (row.category as any) || 'E_BIKE',
        propulsion: (row.propulsion as any) || 'PEDELEC',
        price_cents: priceCents,
        compare_at_price_cents: compareAtPriceCents || Math.round(priceCents * 1.1),
        currency: row.currency || 'EUR',
        availability,
        quantity,
        condition,
        source_url: sourceUrl,
        image_url: savedOffer.image_url || undefined,
        content_hash: savedOffer.content_hash,
        first_seen_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
        is_active: true,
        variant_details: variantDetails,
        leasing_compatibilities: (dealerObj?.supported_providers || []).map((p) => ({
          provider_id: p.provider_id,
          provider_slug: p.provider_slug,
          provider_name: p.provider_name,
          status: p.status,
          evidence_reason: 'Importiert über autorisierten Händler-Bestand'
        }))
      };

      const existingMemIdx = PARTNER_OFFERS_DATA.findIndex((o) => o.dealer_id === dealerId && o.external_id === externalId);
      if (existingMemIdx >= 0) {
        PARTNER_OFFERS_DATA[existingMemIdx] = memoryOffer;
      } else {
        PARTNER_OFFERS_DATA.unshift(memoryOffer);
      }

      // Synchronize provider eligibility for participating leasing providers
      for (const part of participations) {
        await this.db
          .insertInto('offer_provider_eligibility')
          .values({
            offer_id: savedOffer.id,
            provider_id: part.id,
            status: part.participation_status,
            evidence_reason: 'Importiert über autorisierten Händler-Bestand'
          })
          .onConflict((oc) =>
            oc.columns(['offer_id', 'provider_id']).doUpdateSet({
              status: part.participation_status,
              calculated_at: new Date()
            })
          )
          .execute();
      }

      await importRunsRepository.recordRow({
        import_run_id: runId,
        row_number: lineNum,
        raw_payload: line,
        error_message: null,
        status: 'IMPORTED'
      });

      importedCount++;
    }

    const finalStatus: ImportStatus =
      errors.length === 0 ? 'COMPLETED' : importedCount > 0 ? 'PARTIAL' : 'FAILED';
    const summary =
      errors.length > 0 ? `${errors.length} Zeilen fehlerhaft isoliert` : 'Fehlerfrei abgeschlossen';

    await importRunsRepository.updateRun(runId, {
      status: finalStatus,
      imported_rows: importedCount,
      failed_rows: errors.length,
      finished_at: new Date(),
      error_summary: summary
    });

    await auditEventsRepository.recordEvent({
      actor_role: 'DEALER',
      event_type: 'IMPORT_RUN_FINISHED',
      entity_type: 'IMPORT_RUN',
      entity_id: runId,
      metadata: {
        dealer_id: dealerId,
        imported_rows: importedCount,
        failed_rows: errors.length,
        status: finalStatus
      }
    });

    return {
      runId,
      totalRows: dataLines.length,
      importedRows: importedCount,
      failedRows: errors.length,
      errors
    };
  }

  private parseCSVRow(text: string): string[] {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        if (inQuotes && text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        result.push(cur);
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur);
    return result;
  }
}

export const feedIngestionService = new FeedIngestionService();
