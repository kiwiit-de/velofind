/**
 * VeloFind Catalog Data Quality & Automated Validation Service
 * Scans catalog offers and database records for discrepancies:
 * - Bikes marked 'MUSCULAR' (Non-Electric) with motor_brand, torque_nm, battery_wh, or engine_type
 * - Misclassified propulsion types (Bio vs E-Bike) based on authentic title signals
 * - Frame type / size contradictions (e.g. Wave marked as DIAMOND)
 * - Wheel size contradictions
 * - Invalid price / data corruption
 *
 * Automatically resets invalid fields to null/undefined to prevent misleading search results
 * and flags unresolvable discrepancies for manual administrative review.
 */

import { PARTNER_OFFERS_DATA } from '../db/dealer-registry.ts';
import type { Offer, PropulsionType, FrameType, BikeCategory } from '../../types.ts';
import {
  isElectricBike,
  inferBioCategory,
  inferEbikeCategory,
  enrichBikeSpecs,
  resolveAuthenticBikeWeight,
  extractFrameType,
  extractFrameSize,
  extractWheelSize,
  generateBikeDescription,
  extractModelYear
} from './spec-enricher.service.ts';
import { auditEventsRepository } from '../db/repositories/index.ts';
import { isDatabaseAvailable } from '../db/pool.ts';
import { getKysely } from '../db/kysely.ts';
import { sql } from 'kysely';

export type DiscrepancySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type DiscrepancyRule =
  | 'MUSCULAR_WITH_MOTOR_SPECS'
  | 'EBIKE_MISCLASSIFIED_AS_MUSCULAR'
  | 'BIO_MISCLASSIFIED_AS_EBIKE'
  | 'SUSPICIOUS_WEIGHT'
  | 'FRAME_TYPE_CONTRADICTION'
  | 'WHEEL_SIZE_CONTRADICTION'
  | 'INVALID_PRICE'
  | 'MISSING_MANDATORY_FIELDS';

export interface DiscrepancyItem {
  offerId: string;
  externalId: string;
  title: string;
  dealerName: string;
  ruleViolated: DiscrepancyRule;
  severity: DiscrepancySeverity;
  details: string;
  autoFixed: boolean;
  actionTaken: string;
  before: Record<string, any>;
  after?: Record<string, any>;
}

export interface DataValidationReport {
  timestamp: string;
  totalOffersScanned: number;
  cleanOffersCount: number;
  discrepanciesFound: number;
  discrepanciesAutoFixed: number;
  flaggedForManualReviewCount: number;
  flaggedForManualReview: DiscrepancyItem[];
  allDiscrepancies: DiscrepancyItem[];
  breakdown: {
    muscularWithMotorSpecs: number;
    ebikeMisclassifiedAsMuscular: number;
    bioMisclassifiedAsEbike: number;
    suspiciousWeights: number;
    frameTypeContradictions: number;
    wheelSizeContradictions: number;
    invalidPrices: number;
    other: number;
  };
  durationMs: number;
}

export interface ValidationOptions {
  autoFix?: boolean;
  offers?: Offer[];
  saveToAuditLog?: boolean;
}

export class DataValidatorService {
  private lastReport: DataValidationReport | null = null;

  /**
   * Returns the most recent validation report.
   */
  getLastReport(): DataValidationReport | null {
    return this.lastReport;
  }

  /**
   * Scans a single offer and returns all detected discrepancies,
   * optionally applying in-place fixes to reset invalid fields to null/undefined.
   */
  validateOffer(offer: Offer, autoFix: boolean = true): DiscrepancyItem[] {
    const discrepancies: DiscrepancyItem[] = [];
    const vd = offer.variant_details || ({} as any);
    const titleLower = (offer.title || '').toLowerCase();
    const brandLower = (offer.brand_name || '').toLowerCase();

    // -------------------------------------------------------------------------
    // RULE 1: Non-Electric (MUSCULAR) bike with Motor or Torque or Battery values
    // -------------------------------------------------------------------------
    const isMuscular = offer.propulsion === 'MUSCULAR';
    const hasMotorBrand = Boolean(vd.motor_brand && vd.motor_brand.trim() !== '' && !vd.motor_brand.toLowerCase().includes('ohne motor'));
    const hasTorque = Boolean(vd.torque_nm && vd.torque_nm > 0);
    const hasBattery = Boolean(vd.battery_wh && vd.battery_wh > 0);
    const hasEngineType = Boolean(vd.engine_type && vd.engine_type.trim() !== '' && !vd.engine_type.toLowerCase().includes('reiner pedalantrieb'));

    if (isMuscular && (hasMotorBrand || hasTorque || hasBattery || hasEngineType)) {
      const beforeState = {
        propulsion: offer.propulsion,
        motor_brand: vd.motor_brand,
        motor_model: vd.motor_model,
        torque_nm: vd.torque_nm,
        battery_wh: vd.battery_wh,
        engine_type: vd.engine_type
      };

      let actionTaken = 'Flagged for manual review';
      if (autoFix) {
        // Reset misleading electric fields to null / undefined
        delete vd.motor_brand;
        delete vd.motor_model;
        delete vd.torque_nm;
        delete vd.battery_wh;
        delete vd.engine_type;

        // Ensure category is never E_BIKE for muscular bikes
        if (offer.category === 'E_BIKE') {
          offer.category = inferBioCategory(offer.title, offer.brand_name, 'TREKKING');
        }

        // Regenerate clean description without fake motor mentions
        vd.description = generateBikeDescription({
          title: offer.title,
          brand_name: offer.brand_name,
          model_name: offer.model_name || offer.title,
          category: offer.category,
          propulsion: 'MUSCULAR',
          model_year: offer.model_year || 2025,
          specs: vd
        });
        offer.description = vd.description;

        actionTaken = 'Reset motor_brand, motor_model, torque_nm, battery_wh, and engine_type to null/undefined; regenerated authentic bio description';
      }

      discrepancies.push({
        offerId: offer.id,
        externalId: offer.external_id,
        title: offer.title,
        dealerName: offer.dealer_name,
        ruleViolated: 'MUSCULAR_WITH_MOTOR_SPECS',
        severity: 'HIGH',
        details: `Non-electric bike had motor/battery specs assigned: ${[
          hasMotorBrand ? `motor_brand="${beforeState.motor_brand}"` : '',
          hasTorque ? `torque_nm=${beforeState.torque_nm}` : '',
          hasBattery ? `battery_wh=${beforeState.battery_wh}` : '',
          hasEngineType ? `engine_type="${beforeState.engine_type}"` : ''
        ].filter(Boolean).join(', ')}`,
        autoFixed: autoFix,
        actionTaken,
        before: beforeState,
        after: autoFix ? {
          propulsion: offer.propulsion,
          motor_brand: undefined,
          torque_nm: undefined,
          battery_wh: undefined,
          engine_type: undefined
        } : undefined
      });
    }

    // -------------------------------------------------------------------------
    // RULE 2: Title unambiguously proves E-Bike (e.g. 750 Wh / Hybrid / Rail / 625) but marked MUSCULAR
    // -------------------------------------------------------------------------
    const detectedAsElectric = isElectricBike(offer.title, offer.brand_name, offer.category, 'PEDELEC');
    const hasExplicitBatteryInTitle = /\b(\d{3,4})\s*(?:wh|wattstunde)\b/i.test(offer.title);
    const hasStandaloneBatteryNumber = /\b(545|625|725|750|756|800|900)\b/.test(offer.title);

    if (isMuscular && (hasExplicitBatteryInTitle || hasStandaloneBatteryNumber || (detectedAsElectric && !titleLower.includes('ohne motor')))) {
      const beforeState = { propulsion: offer.propulsion, category: offer.category, weight_kg: vd.weight_kg };
      let actionTaken = 'Flagged for manual review';

      if (autoFix) {
        offer.propulsion = 'PEDELEC';
        offer.category = inferEbikeCategory(offer.title, offer.brand_name, offer.category);
        const enrichedVd = enrichBikeSpecs({
          title: offer.title,
          brand_name: offer.brand_name,
          category: offer.category,
          propulsion: 'PEDELEC',
          price_cents: offer.price_cents,
          existing: offer.variant_details
        });
        offer.variant_details = enrichedVd;
        offer.description = enrichedVd.description;
        actionTaken = `Reclassified propulsion to PEDELEC (${offer.category}), enriched motor/battery specs, and updated weight to authentic ${enrichedVd.weight_kg} kg`;
      }

      discrepancies.push({
        offerId: offer.id,
        externalId: offer.external_id,
        title: offer.title,
        dealerName: offer.dealer_name,
        ruleViolated: 'EBIKE_MISCLASSIFIED_AS_MUSCULAR',
        severity: 'HIGH',
        details: `Title contains explicit e-bike/battery indicators but offer was categorized as MUSCULAR: "${offer.title}"`,
        autoFixed: autoFix,
        actionTaken,
        before: beforeState,
        after: autoFix ? { propulsion: offer.propulsion, category: offer.category, weight_kg: offer.variant_details?.weight_kg } : undefined
      });
    }

    // -------------------------------------------------------------------------
    // RULE 3: Title proves Bio-Bike (e.g. "ohne Motor", "Bio-Bike") but marked PEDELEC
    // -------------------------------------------------------------------------
    const isExplicitlyBioTitle =
      titleLower.includes('ohne motor') ||
      titleLower.includes('bio-bike') ||
      titleLower.includes('muskelkraft') ||
      titleLower.includes('reiner pedalantrieb');

    if (!isMuscular && isExplicitlyBioTitle) {
      const beforeState = {
        propulsion: offer.propulsion,
        motor_brand: vd.motor_brand,
        torque_nm: vd.torque_nm
      };

      let actionTaken = 'Flagged for manual review';
      if (autoFix) {
        offer.propulsion = 'MUSCULAR';
        offer.category = inferBioCategory(offer.title, offer.brand_name, 'TREKKING');
        delete vd.motor_brand;
        delete vd.motor_model;
        delete vd.torque_nm;
        delete vd.battery_wh;
        delete vd.engine_type;
        actionTaken = 'Reclassified propulsion to MUSCULAR and removed electric specs';
      }

      discrepancies.push({
        offerId: offer.id,
        externalId: offer.external_id,
        title: offer.title,
        dealerName: offer.dealer_name,
        ruleViolated: 'BIO_MISCLASSIFIED_AS_EBIKE',
        severity: 'HIGH',
        details: `Title explicitly indicates muscular bicycle ("${offer.title}"), but was marked as ${offer.propulsion}`,
        autoFixed: autoFix,
        actionTaken,
        before: beforeState,
        after: autoFix ? { propulsion: 'MUSCULAR', motor_brand: undefined } : undefined
      });
    }

    // -------------------------------------------------------------------------
    // RULE 3B: Suspicious Weight Discrepancy (e.g. 25kg E-Bike marked as 14.2kg bio-bike)
    // -------------------------------------------------------------------------
    if (offer.propulsion !== 'MUSCULAR' && vd.weight_kg) {
      const isCargo = offer.category === 'CARGO' || titleLower.includes('cargo') || titleLower.includes('family') || titleLower.includes('load');
      const isLightEbike = titleLower.includes('sl') || titleLower.includes('light') || titleLower.includes('sx') || titleLower.includes('fazua') || titleLower.includes('mahle') || titleLower.includes('tq');
      const minPlausibleWeight = isLightEbike ? 13.0 : isCargo ? 30.0 : 18.0;

      if (vd.weight_kg < minPlausibleWeight) {
        const beforeWeight = vd.weight_kg;
        let actionTaken = 'Flagged for manual review';
        let newWeight = beforeWeight;

        if (autoFix) {
          newWeight = resolveAuthenticBikeWeight({
            title: offer.title,
            brand: offer.brand_name,
            category: offer.category,
            propulsion: offer.propulsion,
            battery_wh: vd.battery_wh,
            existingWeight: undefined // Force authentic architecture weight
          });
          vd.weight_kg = newWeight;
          vd.description = generateBikeDescription({
            title: offer.title,
            brand_name: offer.brand_name,
            model_name: offer.model_name || offer.title,
            category: offer.category,
            propulsion: offer.propulsion,
            model_year: offer.model_year || 2025,
            specs: vd
          });
          offer.description = vd.description;
          actionTaken = `Corrected suspicious e-bike weight from ${beforeWeight} kg to authentic ${newWeight} kg`;
        }

        discrepancies.push({
          offerId: offer.id,
          externalId: offer.external_id,
          title: offer.title,
          dealerName: offer.dealer_name,
          ruleViolated: 'SUSPICIOUS_WEIGHT',
          severity: 'HIGH',
          details: `E-Bike had an implausibly low bio-bike weight of ${beforeWeight} kg (corrected to authentic ~${newWeight} kg)`,
          autoFixed: autoFix,
          actionTaken,
          before: { weight_kg: beforeWeight },
          after: autoFix ? { weight_kg: newWeight } : undefined
        });
      }
    }

    // -------------------------------------------------------------------------
    // RULE 4: Frame Type Contradiction (Wave / Tiefeinsteiger or Trapez vs DIAMOND)
    // -------------------------------------------------------------------------
    const isWaveInTitle = titleLower.includes('wave') || titleLower.includes('tiefeinsteiger') || titleLower.includes('easy entry');
    const isTrapezInTitle = titleLower.includes('trapez') || titleLower.includes('trapeze');

    if (isWaveInTitle && vd.frame_type === 'DIAMOND') {
      const beforeState = { frame_type: vd.frame_type, frame_size: vd.frame_size };
      let actionTaken = 'Flagged for manual review';

      if (autoFix) {
        vd.frame_type = 'STEP_THROUGH';
        vd.frame_size = extractFrameSize(offer.title, 'STEP_THROUGH', vd.frame_size);
        actionTaken = 'Corrected frame_type to STEP_THROUGH (Wave) and updated frame_size label';
      }

      discrepancies.push({
        offerId: offer.id,
        externalId: offer.external_id,
        title: offer.title,
        dealerName: offer.dealer_name,
        ruleViolated: 'FRAME_TYPE_CONTRADICTION',
        severity: 'MEDIUM',
        details: `Title indicates Wave/Tiefeinsteiger frame, but frame_type was DIAMOND`,
        autoFixed: autoFix,
        actionTaken,
        before: beforeState,
        after: autoFix ? { frame_type: vd.frame_type, frame_size: vd.frame_size } : undefined
      });
    } else if (isTrapezInTitle && vd.frame_type === 'DIAMOND') {
      const beforeState = { frame_type: vd.frame_type, frame_size: vd.frame_size };
      let actionTaken = 'Flagged for manual review';

      if (autoFix) {
        vd.frame_type = 'TRAPEZE';
        vd.frame_size = extractFrameSize(offer.title, 'TRAPEZE', vd.frame_size);
        actionTaken = 'Corrected frame_type to TRAPEZE (Damen) and updated frame_size label';
      }

      discrepancies.push({
        offerId: offer.id,
        externalId: offer.external_id,
        title: offer.title,
        dealerName: offer.dealer_name,
        ruleViolated: 'FRAME_TYPE_CONTRADICTION',
        severity: 'MEDIUM',
        details: `Title indicates Trapez frame, but frame_type was DIAMOND`,
        autoFixed: autoFix,
        actionTaken,
        before: beforeState,
        after: autoFix ? { frame_type: vd.frame_type, frame_size: vd.frame_size } : undefined
      });
    }

    // -------------------------------------------------------------------------
    // RULE 5: Wheel Size Contradiction (e.g. 28 Zoll in title vs 29 in specs)
    // -------------------------------------------------------------------------
    const wheelMatch = offer.title.match(/\b(20|24|26|27[,.]5|28|29)\s*zoll\b/i);
    if (wheelMatch) {
      const expectedSize = parseFloat(wheelMatch[1].replace(',', '.'));
      if (vd.wheel_size_in && vd.wheel_size_in !== expectedSize) {
        const beforeState = { wheel_size_in: vd.wheel_size_in };
        let actionTaken = 'Flagged for manual review';

        if (autoFix) {
          vd.wheel_size_in = expectedSize;
          actionTaken = `Updated wheel_size_in from ${beforeState.wheel_size_in}" to match title (${expectedSize}")`;
        }

        discrepancies.push({
          offerId: offer.id,
          externalId: offer.external_id,
          title: offer.title,
          dealerName: offer.dealer_name,
          ruleViolated: 'WHEEL_SIZE_CONTRADICTION',
          severity: 'MEDIUM',
          details: `Title explicitly states ${expectedSize} Zoll, but spec wheel_size_in was ${beforeState.wheel_size_in}`,
          autoFixed: autoFix,
          actionTaken,
          before: beforeState,
          after: autoFix ? { wheel_size_in: vd.wheel_size_in } : undefined
        });
      }
    }

    // -------------------------------------------------------------------------
    // RULE 6: Invalid Price
    // -------------------------------------------------------------------------
    if (!offer.price_cents || offer.price_cents <= 0 || isNaN(offer.price_cents)) {
      discrepancies.push({
        offerId: offer.id,
        externalId: offer.external_id,
        title: offer.title,
        dealerName: offer.dealer_name,
        ruleViolated: 'INVALID_PRICE',
        severity: 'CRITICAL',
        details: `Invalid or missing price_cents: ${offer.price_cents}`,
        autoFixed: false,
        actionTaken: 'Flagged for manual review; offer marked inactive',
        before: { price_cents: offer.price_cents }
      });
      if (autoFix) {
        offer.is_active = false;
      }
    }

    return discrepancies;
  }

  /**
   * Scans all offers in the catalog and database, resets discrepancies or flags them.
   */
  async validateAndCleanCatalog(options: ValidationOptions = {}): Promise<DataValidationReport> {
    const startTime = Date.now();
    const autoFix = options.autoFix ?? true;
    const offersToScan = options.offers || PARTNER_OFFERS_DATA;
    const saveToAuditLog = options.saveToAuditLog ?? true;

    const allDiscrepancies: DiscrepancyItem[] = [];
    const flaggedForManualReview: DiscrepancyItem[] = [];

    const breakdown = {
      muscularWithMotorSpecs: 0,
      ebikeMisclassifiedAsMuscular: 0,
      bioMisclassifiedAsEbike: 0,
      suspiciousWeights: 0,
      frameTypeContradictions: 0,
      wheelSizeContradictions: 0,
      invalidPrices: 0,
      other: 0
    };

    let fixedCount = 0;

    for (const offer of offersToScan) {
      const items = this.validateOffer(offer, autoFix);
      for (const item of items) {
        allDiscrepancies.push(item);
        if (item.autoFixed) {
          fixedCount++;
        } else {
          flaggedForManualReview.push(item);
        }

        switch (item.ruleViolated) {
          case 'MUSCULAR_WITH_MOTOR_SPECS':
            breakdown.muscularWithMotorSpecs++;
            break;
          case 'EBIKE_MISCLASSIFIED_AS_MUSCULAR':
            breakdown.ebikeMisclassifiedAsMuscular++;
            break;
          case 'BIO_MISCLASSIFIED_AS_EBIKE':
            breakdown.bioMisclassifiedAsEbike++;
            break;
          case 'SUSPICIOUS_WEIGHT':
            breakdown.suspiciousWeights++;
            break;
          case 'FRAME_TYPE_CONTRADICTION':
            breakdown.frameTypeContradictions++;
            break;
          case 'WHEEL_SIZE_CONTRADICTION':
            breakdown.wheelSizeContradictions++;
            break;
          case 'INVALID_PRICE':
            breakdown.invalidPrices++;
            break;
          default:
            breakdown.other++;
        }
      }
    }

    // If PostgreSQL database is available, also sanitize database records directly
    if (autoFix) {
      await this.sanitizeDatabaseIfAvailable();
    }

    const durationMs = Date.now() - startTime;
    const report: DataValidationReport = {
      timestamp: new Date().toISOString(),
      totalOffersScanned: offersToScan.length,
      cleanOffersCount: offersToScan.length - allDiscrepancies.length,
      discrepanciesFound: allDiscrepancies.length,
      discrepanciesAutoFixed: fixedCount,
      flaggedForManualReviewCount: flaggedForManualReview.length,
      flaggedForManualReview,
      allDiscrepancies,
      breakdown,
      durationMs
    };

    this.lastReport = report;

    // Persist to audit log if enabled
    if (saveToAuditLog && allDiscrepancies.length > 0) {
      try {
        await auditEventsRepository.recordEvent({
          actor_id: 'system:daily-sync',
          actor_role: 'system',
          event_type: 'CATALOG_VALIDATION_SCAN',
          entity_type: 'CATALOG',
          entity_id: 'offers_catalog',
          metadata: {
            totalScanned: report.totalOffersScanned,
            discrepanciesFound: report.discrepanciesFound,
            autoFixed: report.discrepanciesAutoFixed,
            flaggedCount: report.flaggedForManualReviewCount,
            breakdown: report.breakdown
          }
        });
      } catch (err) {
        console.warn('[DataValidatorService] Failed to record audit event:', err);
      }
    }

    console.log(
      `[DataValidatorService] Validation completed in ${durationMs}ms: ` +
      `${report.totalOffersScanned} scanned, ${report.discrepanciesFound} issues found, ` +
      `${report.discrepanciesAutoFixed} auto-fixed, ${report.flaggedForManualReviewCount} flagged for review.`
    );

    return report;
  }

  /**
   * Directly sanitizes PostgreSQL database tables (bike_variants & offers) if available.
   * Resets motor_brand, torque_nm, battery_wh, and engine_type to NULL on muscular bikes.
   */
  private async sanitizeDatabaseIfAvailable(): Promise<void> {
    try {
      const isAvailable = await isDatabaseAvailable();
      if (!isAvailable) return;

      const db = getKysely();

      // Reset electric fields on bike_variants linked to muscular bike models
      await sql`
        UPDATE bike_variants bv
        SET 
          motor_brand = NULL,
          motor_model = NULL,
          torque_nm = NULL,
          battery_wh = NULL,
          engine_type = NULL,
          updated_at = NOW()
        FROM bike_models bm
        WHERE bv.model_id = bm.id
          AND bm.propulsion = 'MUSCULAR'
          AND (bv.motor_brand IS NOT NULL OR bv.torque_nm IS NOT NULL OR bv.battery_wh IS NOT NULL);
      `.execute(db);

      console.log('[DataValidatorService] PostgreSQL database records validated and sanitized.');
    } catch (err: any) {
      console.warn('[DataValidatorService] Note: Direct SQL database cleanup skipped or failed:', err.message);
    }
  }
}

export const dataValidatorService = new DataValidatorService();
