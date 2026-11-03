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
  | 'TORQUE_OUT_OF_BOUNDS'
  | 'BATTERY_OUT_OF_BOUNDS'
  | 'MAX_WEIGHT_SANITY'
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

export interface WeightBoundary {
  min: number;
  max: number;
  typical: number;
}

export const CATEGORY_WEIGHT_BOUNDS: Record<PropulsionType, Record<BikeCategory, WeightBoundary>> = {
  PEDELEC: {
    E_BIKE: { min: 15.0, max: 34.0, typical: 25.5 },
    TREKKING: { min: 18.0, max: 32.5, typical: 26.5 },
    CITY: { min: 18.0, max: 32.5, typical: 26.5 },
    MTB: { min: 16.5, max: 30.0, typical: 24.5 },
    CARGO: { min: 28.0, max: 68.0, typical: 49.5 },
    GRAVEL: { min: 11.5, max: 19.5, typical: 14.5 },
    ROAD: { min: 11.0, max: 18.5, typical: 13.8 }
  },
  S_PEDELEC: {
    E_BIKE: { min: 20.0, max: 35.0, typical: 27.5 },
    TREKKING: { min: 22.0, max: 34.0, typical: 28.0 },
    CITY: { min: 22.0, max: 34.0, typical: 28.0 },
    MTB: { min: 20.0, max: 32.0, typical: 26.0 },
    CARGO: { min: 32.0, max: 70.0, typical: 52.0 },
    GRAVEL: { min: 13.0, max: 21.0, typical: 15.5 },
    ROAD: { min: 12.5, max: 20.0, typical: 14.5 }
  },
  MUSCULAR: {
    ROAD: { min: 6.0, max: 11.5, typical: 8.5 },
    GRAVEL: { min: 7.5, max: 13.0, typical: 9.8 },
    MTB: { min: 8.5, max: 17.0, typical: 13.2 },
    TREKKING: { min: 10.5, max: 18.5, typical: 14.2 },
    CITY: { min: 10.5, max: 18.5, typical: 14.5 },
    CARGO: { min: 16.0, max: 40.0, typical: 24.5 },
    E_BIKE: { min: 10.5, max: 18.5, typical: 14.2 }
  }
};

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
    torqueOutOfBounds: number;
    batteryOutOfBounds: number;
    maxWeightSanity: number;
    invalidPrices: number;
    missingMandatoryFields: number;
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

    // Helper to add manual review flag to offer and variant_details
    const flagForManualReview = (rule: DiscrepancyRule, reason: string) => {
      offer.manual_review_required = true;
      offer.review_flags = offer.review_flags || [];
      if (!offer.review_flags.includes(rule)) {
        offer.review_flags.push(rule);
      }
      offer.review_reason = reason;
      if (offer.variant_details) {
        offer.variant_details.manual_review_required = true;
        offer.variant_details.review_flag = reason;
      }
    };

    // -------------------------------------------------------------------------
    // RULE 3B: Weight Sanity Check (e-bike < 15kg or out of bounds for category)
    // -------------------------------------------------------------------------
    if (vd.weight_kg !== undefined && vd.weight_kg !== null && !isNaN(vd.weight_kg)) {
      const isElectric = offer.propulsion !== 'MUSCULAR';
      const isCargo = offer.category === 'CARGO' || titleLower.includes('cargo') || titleLower.includes('family') || titleLower.includes('load') || titleLower.includes('f.u.b.');
      const isLightEbike = isElectric && (
        (/\b(sl|sx)\b/i.test(offer.title) && !/\bslx\b/i.test(offer.title)) ||
        titleLower.includes('light') ||
        titleLower.includes('fazua') ||
        titleLower.includes('mahle') ||
        titleLower.includes('tq') ||
        titleLower.includes('hpr50') ||
        titleLower.includes('dual sport+') ||
        titleLower.includes('fx+') ||
        (offer.category === 'ROAD' && isElectric) ||
        (offer.category === 'GRAVEL' && isElectric && vd.weight_kg < 16.0)
      );

      // Determine expected category boundaries
      let minExpectedWeight = 11.0;
      let maxExpectedWeight = 18.0;

      if (isElectric) {
        if (isCargo) {
          minExpectedWeight = 28.0;
          maxExpectedWeight = 68.0;
        } else if (isLightEbike) {
          minExpectedWeight = 11.5;
          maxExpectedWeight = 21.0;
        } else if (offer.category === 'MTB') {
          minExpectedWeight = 16.5;
          maxExpectedWeight = 30.0;
        } else if (offer.category === 'ROAD' || offer.category === 'GRAVEL') {
          minExpectedWeight = 11.0;
          maxExpectedWeight = 19.5;
        } else {
          // Standard E-Trekking, E-City, E-Bike:
          // Strictly must NOT be < 15kg for standard e-bikes
          minExpectedWeight = 18.0;
          maxExpectedWeight = 32.5;
        }
      } else {
        // Muscular (Bio-Bikes)
        if (isCargo) {
          minExpectedWeight = 16.0;
          maxExpectedWeight = 38.0;
        } else if (offer.category === 'ROAD') {
          minExpectedWeight = 6.0;
          maxExpectedWeight = 11.5;
        } else if (offer.category === 'GRAVEL') {
          minExpectedWeight = 7.5;
          maxExpectedWeight = 13.0;
        } else if (offer.category === 'MTB') {
          minExpectedWeight = 8.5;
          maxExpectedWeight = 17.0;
        } else {
          // Trekking & City
          minExpectedWeight = 10.5;
          maxExpectedWeight = 18.5;
        }
      }

      // Check if significantly lower or significantly higher
      const isSignificantlyLower = isElectric 
        ? (!isLightEbike && vd.weight_kg < 15.0) || vd.weight_kg < minExpectedWeight
        : vd.weight_kg < (minExpectedWeight - 1.5);

      const isSignificantlyHigher = isElectric
        ? vd.weight_kg > (maxExpectedWeight + 2.0)
        : vd.weight_kg > (maxExpectedWeight + 2.0);

      if (isSignificantlyLower || isSignificantlyHigher) {
        const beforeWeight = vd.weight_kg;
        const direction = isSignificantlyLower ? 'significantly lower' : 'significantly higher';
        const discrepancyReason = `Weight ${beforeWeight} kg is ${direction} than expected range [${minExpectedWeight}kg - ${maxExpectedWeight}kg] for ${offer.propulsion} ${offer.category}`;

        // Add manual review flag
        flagForManualReview('SUSPICIOUS_WEIGHT', discrepancyReason);

        let actionTaken = 'Flagged for manual review with manual_review_required flag';
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
          actionTaken = `Auto-corrected weight from ${beforeWeight} kg to authentic ${newWeight} kg; added manual review flag`;
        }

        discrepancies.push({
          offerId: offer.id,
          externalId: offer.external_id,
          title: offer.title,
          dealerName: offer.dealer_name,
          ruleViolated: 'SUSPICIOUS_WEIGHT',
          severity: 'HIGH',
          details: discrepancyReason,
          autoFixed: autoFix,
          actionTaken,
          before: { weight_kg: beforeWeight },
          after: autoFix ? { weight_kg: newWeight } : undefined
        });
      }
    }

    // -------------------------------------------------------------------------
    // RULE 4: Frame Type Contradiction (Wave / Tiefeinsteiger / Low or Trapez vs DIAMOND)
    // -------------------------------------------------------------------------
    const isWaveInTitle = titleLower.includes('wave') || titleLower.includes('tiefeinsteiger') || titleLower.includes('easy entry') || /\blow\b/i.test(offer.title) || /\bwa\b/i.test(offer.title);
    const isTrapezInTitle = titleLower.includes('trapez') || titleLower.includes('trapeze') || titleLower.includes('damen') || titleLower.includes('lady');
    const isDiamantInTitle = titleLower.includes('diamant') || titleLower.includes('herren') || /\bhigh\b/i.test(offer.title);

    if (isWaveInTitle && !isDiamantInTitle && vd.frame_type === 'DIAMOND') {
      const beforeState = { frame_type: vd.frame_type, frame_size: vd.frame_size };
      const reason = `Title indicates Wave/Tiefeinsteiger/Low frame, but frame_type was DIAMOND`;
      flagForManualReview('FRAME_TYPE_CONTRADICTION', reason);
      let actionTaken = 'Flagged for manual review';

      if (autoFix) {
        vd.frame_type = 'STEP_THROUGH';
        vd.frame_size = extractFrameSize(offer.title, 'STEP_THROUGH', vd.frame_size);
        actionTaken = 'Corrected frame_type to STEP_THROUGH (Wave/Low) and updated frame_size label';
      }

      discrepancies.push({
        offerId: offer.id,
        externalId: offer.external_id,
        title: offer.title,
        dealerName: offer.dealer_name,
        ruleViolated: 'FRAME_TYPE_CONTRADICTION',
        severity: 'MEDIUM',
        details: reason,
        autoFixed: autoFix,
        actionTaken,
        before: beforeState,
        after: autoFix ? { frame_type: vd.frame_type, frame_size: vd.frame_size } : undefined
      });
    } else if (isTrapezInTitle && !isDiamantInTitle && vd.frame_type === 'DIAMOND') {
      const beforeState = { frame_type: vd.frame_type, frame_size: vd.frame_size };
      const reason = `Title indicates Trapez frame, but frame_type was DIAMOND`;
      flagForManualReview('FRAME_TYPE_CONTRADICTION', reason);
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
        details: reason,
        autoFixed: autoFix,
        actionTaken,
        before: beforeState,
        after: autoFix ? { frame_type: vd.frame_type, frame_size: vd.frame_size } : undefined
      });
    } else if (isDiamantInTitle && vd.frame_type === 'STEP_THROUGH') {
      const beforeState = { frame_type: vd.frame_type, frame_size: vd.frame_size };
      const reason = `Title indicates Diamant/High frame, but frame_type was STEP_THROUGH`;
      flagForManualReview('FRAME_TYPE_CONTRADICTION', reason);
      let actionTaken = 'Flagged for manual review';

      if (autoFix) {
        vd.frame_type = 'DIAMOND';
        vd.frame_size = extractFrameSize(offer.title, 'DIAMOND', vd.frame_size);
        actionTaken = 'Corrected frame_type to DIAMOND (Herren/High) and updated frame_size label';
      }

      discrepancies.push({
        offerId: offer.id,
        externalId: offer.external_id,
        title: offer.title,
        dealerName: offer.dealer_name,
        ruleViolated: 'FRAME_TYPE_CONTRADICTION',
        severity: 'MEDIUM',
        details: reason,
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
        const reason = `Title explicitly states ${expectedSize} Zoll, but spec wheel_size_in was ${beforeState.wheel_size_in}`;
        flagForManualReview('WHEEL_SIZE_CONTRADICTION', reason);
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
          details: reason,
          autoFixed: autoFix,
          actionTaken,
          before: beforeState,
          after: autoFix ? { wheel_size_in: vd.wheel_size_in } : undefined
        });
      }
    } else if (vd.wheel_size_in && (vd.wheel_size_in < 12 || vd.wheel_size_in > 29)) {
      const beforeState = { wheel_size_in: vd.wheel_size_in };
      const reason = `Wheel size ${vd.wheel_size_in}" is outside plausible bicycle range [12" - 29"]`;
      flagForManualReview('WHEEL_SIZE_CONTRADICTION', reason);
      let actionTaken = 'Flagged for manual review';

      if (autoFix) {
        vd.wheel_size_in = extractWheelSize(offer.title, offer.category);
        actionTaken = `Auto-corrected wheel_size_in from ${beforeState.wheel_size_in}" to standard ${vd.wheel_size_in}"`;
      }

      discrepancies.push({
        offerId: offer.id,
        externalId: offer.external_id,
        title: offer.title,
        dealerName: offer.dealer_name,
        ruleViolated: 'WHEEL_SIZE_CONTRADICTION',
        severity: 'MEDIUM',
        details: reason,
        autoFixed: autoFix,
        actionTaken,
        before: beforeState,
        after: autoFix ? { wheel_size_in: vd.wheel_size_in } : undefined
      });
    }

    // -------------------------------------------------------------------------
    // RULE 6: Torque Sanity Check (E-Bikes: 25 Nm <= torque <= 130 Nm)
    // -------------------------------------------------------------------------
    if (offer.propulsion !== 'MUSCULAR' && vd.torque_nm !== undefined && vd.torque_nm !== null) {
      if (vd.torque_nm < 25 || vd.torque_nm > 130) {
        const beforeTorque = vd.torque_nm;
        const reason = `Torque ${beforeTorque} Nm is outside plausible range [25 - 130 Nm] for an E-Bike`;
        flagForManualReview('TORQUE_OUT_OF_BOUNDS', reason);

        let actionTaken = 'Flagged for manual review';
        let correctedTorque = beforeTorque;
        if (autoFix) {
          correctedTorque = offer.category === 'CARGO' ? 85 : 75;
          vd.torque_nm = correctedTorque;
          actionTaken = `Auto-corrected torque from ${beforeTorque} Nm to authentic ${correctedTorque} Nm; flagged for manual review`;
        }

        discrepancies.push({
          offerId: offer.id,
          externalId: offer.external_id,
          title: offer.title,
          dealerName: offer.dealer_name,
          ruleViolated: 'TORQUE_OUT_OF_BOUNDS',
          severity: 'HIGH',
          details: reason,
          autoFixed: autoFix,
          actionTaken,
          before: { torque_nm: beforeTorque },
          after: autoFix ? { torque_nm: correctedTorque } : undefined
        });
      }
    }

    // -------------------------------------------------------------------------
    // RULE 7: Battery Capacity Sanity Check (E-Bikes: 150 Wh <= battery <= 1800 Wh)
    // -------------------------------------------------------------------------
    if (offer.propulsion !== 'MUSCULAR' && vd.battery_wh !== undefined && vd.battery_wh !== null) {
      if (vd.battery_wh < 150 || vd.battery_wh > 1800) {
        const beforeBattery = vd.battery_wh;
        const reason = `Battery capacity ${beforeBattery} Wh is outside plausible range [150 - 1800 Wh] for an E-Bike`;
        flagForManualReview('BATTERY_OUT_OF_BOUNDS', reason);

        let actionTaken = 'Flagged for manual review';
        let correctedBattery = beforeBattery;
        if (autoFix) {
          correctedBattery = 625;
          vd.battery_wh = correctedBattery;
          actionTaken = `Auto-corrected battery capacity from ${beforeBattery} Wh to standard 625 Wh; flagged for manual review`;
        }

        discrepancies.push({
          offerId: offer.id,
          externalId: offer.external_id,
          title: offer.title,
          dealerName: offer.dealer_name,
          ruleViolated: 'BATTERY_OUT_OF_BOUNDS',
          severity: 'HIGH',
          details: reason,
          autoFixed: autoFix,
          actionTaken,
          before: { battery_wh: beforeBattery },
          after: autoFix ? { battery_wh: correctedBattery } : undefined
        });
      }
    }

    // -------------------------------------------------------------------------
    // RULE 8: Max Permissible Weight Sanity (Zul. Gesamtgewicht)
    // -------------------------------------------------------------------------
    if (vd.max_weight_kg !== undefined && vd.max_weight_kg !== null) {
      const isWeightExceedingMax = vd.weight_kg && vd.max_weight_kg <= vd.weight_kg;
      const isOutOfRange = vd.max_weight_kg < 90 || vd.max_weight_kg > 300;

      if (isWeightExceedingMax || isOutOfRange) {
        const beforeMax = vd.max_weight_kg;
        const reason = isWeightExceedingMax
          ? `Max permissible weight (${beforeMax} kg) cannot be less than or equal to bike's own weight (${vd.weight_kg} kg)`
          : `Max permissible weight ${beforeMax} kg is outside plausible range [90 - 300 kg]`;
        flagForManualReview('MAX_WEIGHT_SANITY', reason);

        let actionTaken = 'Flagged for manual review';
        let correctedMax = beforeMax;
        if (autoFix) {
          correctedMax = offer.category === 'CARGO' ? 250 : 140;
          vd.max_weight_kg = correctedMax;
          actionTaken = `Auto-corrected max_weight_kg from ${beforeMax} kg to ${correctedMax} kg; flagged for manual review`;
        }

        discrepancies.push({
          offerId: offer.id,
          externalId: offer.external_id,
          title: offer.title,
          dealerName: offer.dealer_name,
          ruleViolated: 'MAX_WEIGHT_SANITY',
          severity: 'MEDIUM',
          details: reason,
          autoFixed: autoFix,
          actionTaken,
          before: { max_weight_kg: beforeMax },
          after: autoFix ? { max_weight_kg: correctedMax } : undefined
        });
      }
    }

    // -------------------------------------------------------------------------
    // RULE 9: Invalid Price Check
    // -------------------------------------------------------------------------
    if (!offer.price_cents || offer.price_cents <= 0 || isNaN(offer.price_cents) || offer.price_cents < 10000 || offer.price_cents > 3500000) {
      const reason = `Invalid or suspicious price_cents: ${offer.price_cents}`;
      flagForManualReview('INVALID_PRICE', reason);

      discrepancies.push({
        offerId: offer.id,
        externalId: offer.external_id,
        title: offer.title,
        dealerName: offer.dealer_name,
        ruleViolated: 'INVALID_PRICE',
        severity: 'CRITICAL',
        details: reason,
        autoFixed: false,
        actionTaken: 'Flagged for manual review; offer marked inactive',
        before: { price_cents: offer.price_cents }
      });
      if (autoFix) {
        offer.is_active = false;
      }
    }

    if (offer.compare_at_price_cents && offer.compare_at_price_cents < offer.price_cents) {
      // compare_at_price cannot be lower than selling price
      offer.compare_at_price_cents = undefined;
    }

    // -------------------------------------------------------------------------
    // RULE 10: Missing Mandatory Fields
    // -------------------------------------------------------------------------
    const missingFields: string[] = [];
    if (!offer.title || offer.title.trim() === '') missingFields.push('title');
    if (!offer.brand_name || offer.brand_name.trim() === '') missingFields.push('brand_name');
    if (!offer.dealer_name || offer.dealer_name.trim() === '') missingFields.push('dealer_name');
    if (!offer.source_url || offer.source_url.trim() === '') missingFields.push('source_url');

    if (missingFields.length > 0) {
      const reason = `Offer is missing mandatory fields: ${missingFields.join(', ')}`;
      flagForManualReview('MISSING_MANDATORY_FIELDS', reason);

      discrepancies.push({
        offerId: offer.id,
        externalId: offer.external_id,
        title: offer.title || 'UNKNOWN',
        dealerName: offer.dealer_name || 'UNKNOWN',
        ruleViolated: 'MISSING_MANDATORY_FIELDS',
        severity: 'CRITICAL',
        details: reason,
        autoFixed: false,
        actionTaken: 'Flagged for administrative manual review; offer deactivated',
        before: { missingFields }
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
      torqueOutOfBounds: 0,
      batteryOutOfBounds: 0,
      maxWeightSanity: 0,
      invalidPrices: 0,
      missingMandatoryFields: 0,
      other: 0
    };

    let fixedCount = 0;

    for (const offer of offersToScan) {
      const items = this.validateOffer(offer, autoFix);
      for (const item of items) {
        allDiscrepancies.push(item);
        if (item.autoFixed) {
          fixedCount++;
        }
        if (!item.autoFixed || offer.manual_review_required) {
          if (!flaggedForManualReview.some(f => f.offerId === item.offerId && f.ruleViolated === item.ruleViolated)) {
            flaggedForManualReview.push(item);
          }
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
          case 'TORQUE_OUT_OF_BOUNDS':
            breakdown.torqueOutOfBounds++;
            break;
          case 'BATTERY_OUT_OF_BOUNDS':
            breakdown.batteryOutOfBounds++;
            break;
          case 'MAX_WEIGHT_SANITY':
            breakdown.maxWeightSanity++;
            break;
          case 'INVALID_PRICE':
            breakdown.invalidPrices++;
            break;
          case 'MISSING_MANDATORY_FIELDS':
            breakdown.missingMandatoryFields++;
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
