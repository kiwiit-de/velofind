/**
 * Automated Data Validation Test Suite
 * Verifies catalog discrepancy detection, resetting of motor/torque on non-electric bikes,
 * and integration with the daily synchronization pipeline.
 */

import { dataValidatorService } from '../src/server/services/data-validator.service.ts';
import { dailySyncService } from '../src/server/services/daily-sync.service.ts';
import { PARTNER_OFFERS_DATA } from '../src/server/db/dealer-registry.ts';
import type { Offer } from '../src/types.ts';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    throw new Error(msg);
  } else {
    console.log(`  ✓ ${msg}`);
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🔍 Verifying Automated Data Validation Engine');
  console.log('======================================================\n');

  // TEST 1: Detect and reset motor_brand & torque_nm on Non-Electric (MUSCULAR) bikes
  console.log('TEST 1: Non-Electric (MUSCULAR) bike with illegal Motor & Torque specs');
  const mockMuscularBikeWithMotor: Offer = {
    id: 'test-bio-corrupted-1',
    dealer_id: 'test-dealer-1',
    dealer_name: 'Fahrradhaus Test',
    dealer_slug: 'fahrradhaus-test',
    dealer_verified: true,
    dealer_locations: [],
    source_id: 'test-src',
    external_id: 'EXT-CORRUPT-1',
    title: 'VSF Fahrradmanufaktur T-300 Cues 28 Zoll Diamant',
    brand_name: 'VSF FAHRRADMANUFAKTUR',
    model_name: 'T-300',
    model_year: 2025,
    category: 'TREKKING',
    propulsion: 'MUSCULAR',
    price_cents: 120000,
    currency: 'EUR',
    availability: 'IN_STOCK',
    quantity: 2,
    condition: 'NEW',
    source_url: 'https://example.com/t300',
    content_hash: 'hash-corrupt-1',
    first_seen_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString(),
    is_active: true,
    leasing_compatibilities: [],
    variant_details: {
      frame_size: 'Diamant 54 cm (L)',
      frame_type: 'DIAMOND',
      color: 'Ebony Matt',
      wheel_size_in: 28,
      weight_kg: 14.5,
      max_weight_kg: 140,
      motor_brand: 'Bosch',
      motor_model: 'Performance Line CX',
      torque_nm: 85,
      battery_wh: 750,
      engine_type: 'Mittelmotor'
    }
  };

  const detectedIssues = dataValidatorService.validateOffer(mockMuscularBikeWithMotor, true);
  assert(detectedIssues.length > 0, 'Detected discrepancy on corrupted muscular bike');
  assert(detectedIssues.some(i => i.ruleViolated === 'MUSCULAR_WITH_MOTOR_SPECS'), 'Identified MUSCULAR_WITH_MOTOR_SPECS rule violation');
  assert(mockMuscularBikeWithMotor.variant_details?.motor_brand === undefined, 'Reset motor_brand to undefined/null');
  assert(mockMuscularBikeWithMotor.variant_details?.torque_nm === undefined, 'Reset torque_nm to undefined/null');
  assert(mockMuscularBikeWithMotor.variant_details?.battery_wh === undefined, 'Reset battery_wh to undefined/null');
  assert(mockMuscularBikeWithMotor.variant_details?.engine_type === undefined, 'Reset engine_type to undefined/null');
  assert(Boolean(mockMuscularBikeWithMotor.variant_details?.description?.includes('ohne Akku, Motor')), 'Regenerated authentic bio-bike description');

  // TEST 2: Genuine E-Bikes must NOT have motor or torque values stripped
  console.log('\nTEST 2: Genuine E-Bike (PEDELEC) preserves legitimate motor specs');
  const mockValidEbike: Offer = {
    id: 'test-ebike-valid-1',
    dealer_id: 'test-dealer-1',
    dealer_name: 'Fahrradhaus Test',
    dealer_slug: 'fahrradhaus-test',
    dealer_verified: true,
    dealer_locations: [],
    source_id: 'test-src',
    external_id: 'EXT-EBIKE-1',
    title: 'Cube Kathmandu Hybrid EXC 800 Wave 2026',
    brand_name: 'CUBE',
    model_name: 'Kathmandu Hybrid EXC 800',
    model_year: 2026,
    category: 'E_BIKE',
    propulsion: 'PEDELEC',
    price_cents: 369900,
    currency: 'EUR',
    availability: 'IN_STOCK',
    quantity: 1,
    condition: 'NEW',
    source_url: 'https://example.com/cube-kathmandu',
    content_hash: 'hash-ebike-1',
    first_seen_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString(),
    is_active: true,
    leasing_compatibilities: [],
    variant_details: {
      frame_size: 'Wave (Tiefeinsteiger) 50 cm (M)',
      frame_type: 'STEP_THROUGH',
      color: 'Teak´n´Glossy',
      wheel_size_in: 28,
      weight_kg: 26.2,
      max_weight_kg: 150,
      motor_brand: 'Bosch',
      motor_model: 'Performance Line CX',
      torque_nm: 85,
      battery_wh: 800,
      engine_type: 'Mittelmotor'
    }
  };

  const ebikeIssues = dataValidatorService.validateOffer(mockValidEbike, true);
  assert(ebikeIssues.length === 0, 'No false-positive discrepancies on genuine e-bike');
  assert(mockValidEbike.variant_details?.motor_brand === 'Bosch', 'Retained authentic motor_brand');
  assert(mockValidEbike.variant_details?.torque_nm === 85, 'Retained authentic torque_nm');
  assert(mockValidEbike.variant_details?.battery_wh === 800, 'Retained authentic battery_wh');

  // TEST 3: Wave / Tiefeinsteiger frame type contradiction auto-repair
  console.log('\nTEST 3: Frame type contradiction detection and repair');
  const mockWaveContradiction: Offer = {
    ...mockValidEbike,
    id: 'test-wave-contra-1',
    title: 'Kalkhoff Image 3.B Move Wave Tiefeinsteiger',
    variant_details: {
      ...mockValidEbike.variant_details!,
      frame_type: 'DIAMOND',
      frame_size: 'Diamant 54cm (L)'
    }
  };
  const frameIssues = dataValidatorService.validateOffer(mockWaveContradiction, true);
  assert(frameIssues.some(i => i.ruleViolated === 'FRAME_TYPE_CONTRADICTION'), 'Detected FRAME_TYPE_CONTRADICTION');
  assert(mockWaveContradiction.variant_details?.frame_type === 'STEP_THROUGH', 'Corrected frame_type to STEP_THROUGH (Wave)');
  assert(!mockWaveContradiction.variant_details?.frame_size.includes('Diamant'), 'Frame size label no longer mentions Diamant');

  // TEST 4: Wheel size contradiction auto-repair
  console.log('\nTEST 4: Wheel size contradiction detection');
  const mockWheelContradiction: Offer = {
    ...mockValidEbike,
    id: 'test-wheel-contra-1',
    title: 'Cube Stereo Hybrid 140 HPC 29 Zoll - Diamant',
    variant_details: {
      ...mockValidEbike.variant_details!,
      wheel_size_in: 27.5
    }
  };
  const wheelIssues = dataValidatorService.validateOffer(mockWheelContradiction, true);
  assert(wheelIssues.some(i => i.ruleViolated === 'WHEEL_SIZE_CONTRADICTION'), 'Detected WHEEL_SIZE_CONTRADICTION');
  assert(mockWheelContradiction.variant_details?.wheel_size_in === 29, 'Auto-fixed wheel_size_in to 29 Zoll matching title');

  // TEST 5: Trek Rail 5 625 E-MTB & Authentic 24.9 kg Weight Repair
  console.log('\nTEST 5: Trek Rail 5 625 E-MTB classification & authentic 24.9 kg weight repair');
  const mockMisclassifiedTrekRail: Offer = {
    id: 'test-trek-rail-corrupt',
    dealer_id: 'test-dealer-1',
    dealer_name: 'Lucky Bike Bochum',
    dealer_slug: 'lucky-bike-bochum',
    dealer_verified: true,
    dealer_locations: [],
    source_id: 'test-src',
    external_id: 'LUCKY-TREK-RAIL-5',
    title: 'Trek Rail 5 625',
    brand_name: 'Trek',
    model_name: 'Rail 5 625',
    model_year: 2025,
    category: 'TREKKING',
    propulsion: 'MUSCULAR', // Previously misclassified
    price_cents: 499900,
    currency: 'EUR',
    availability: 'IN_STOCK',
    quantity: 1,
    condition: 'NEW',
    source_url: 'https://example.com/trek-rail-5',
    content_hash: 'hash-trek-rail',
    first_seen_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString(),
    is_active: true,
    leasing_compatibilities: [],
    variant_details: {
      frame_size: 'Diamant 54 cm (L)',
      frame_type: 'DIAMOND',
      color: 'Olive Grey',
      wheel_size_in: 29,
      weight_kg: 14.2, // Corrupt bio-bike weight
      max_weight_kg: 140
    }
  };

  const railIssues = dataValidatorService.validateOffer(mockMisclassifiedTrekRail, true);
  assert(railIssues.some(i => i.ruleViolated === 'EBIKE_MISCLASSIFIED_AS_MUSCULAR'), 'Caught Trek Rail 5 misclassified as muscular');
  assert(mockMisclassifiedTrekRail.propulsion === 'PEDELEC', 'Reclassified Trek Rail 5 to PEDELEC');
  assert(mockMisclassifiedTrekRail.category === 'MTB', 'Corrected Trek Rail 5 category from TREKKING to MTB');
  assert(mockMisclassifiedTrekRail.variant_details?.motor_brand === 'Bosch', 'Assigned Bosch motor to Trek Rail 5');
  assert(mockMisclassifiedTrekRail.variant_details?.torque_nm === 85, 'Assigned 85 Nm torque to Trek Rail 5');
  assert(mockMisclassifiedTrekRail.variant_details?.battery_wh === 625, 'Assigned 625 Wh battery to Trek Rail 5');
  assert(mockMisclassifiedTrekRail.variant_details?.weight_kg === 24.9, 'Assigned authentic manufacturer weight 24.9 kg (never bio 14.2 kg)');

  // TEST 6: Suspicious Weight Detection on E-Bikes
  console.log('\nTEST 6: Suspicious weight discrepancy detection on E-Bikes');
  const mockSuspiciousWeightEbike: Offer = {
    ...mockValidEbike,
    id: 'test-suspicious-weight-1',
    variant_details: {
      ...mockValidEbike.variant_details!,
      weight_kg: 14.2 // Corrupt bio weight on e-bike
    }
  };
  const weightIssues = dataValidatorService.validateOffer(mockSuspiciousWeightEbike, true);
  assert(weightIssues.some(i => i.ruleViolated === 'SUSPICIOUS_WEIGHT'), 'Detected SUSPICIOUS_WEIGHT rule violation');
  assert(mockSuspiciousWeightEbike.variant_details?.weight_kg! >= 24.0, 'Auto-fixed suspicious weight to authentic e-bike weight >= 24 kg');

  // TEST 7: Integration with DailySyncService pipeline
  console.log('\nTEST 7: Daily Sync Pipeline Integration');
  const syncStatus = dailySyncService.getStatus();
  assert(syncStatus.automatedDailySync === true, 'dailySyncService has automatedDailySync enabled');
  assert(typeof syncStatus.scheduleInterval === 'string', 'dailySyncService provides human-readable schedule interval');
  assert('lastValidationReport' in syncStatus, 'dailySyncService exposes lastValidationReport');

  // TEST 8: Live Catalog Health Verification
  console.log('\nTEST 8: Full Live Catalog Discrepancy Scan');
  const catalogReport = await dataValidatorService.validateAndCleanCatalog({
    autoFix: true,
    offers: PARTNER_OFFERS_DATA,
    saveToAuditLog: false
  });
  console.log(`  Scanned ${catalogReport.totalOffersScanned} real dealer offers.`);
  assert(catalogReport.totalOffersScanned > 2000, 'Catalog contains realistic offer volume (>2000 offers)');
  assert(catalogReport.breakdown.muscularWithMotorSpecs === 0, 'Zero muscular bikes with motor specs in sanitized catalog');

  // Additional sanity check on all catalog offers
  let muscularWithMotorCount = 0;
  for (const o of PARTNER_OFFERS_DATA) {
    if (o.propulsion === 'MUSCULAR') {
      const vd = o.variant_details;
      if (vd?.motor_brand || vd?.torque_nm || vd?.battery_wh) {
        muscularWithMotorCount++;
      }
    }
  }
  assert(muscularWithMotorCount === 0, 'Strict verification: 0 muscular bikes in catalog have motor/torque/battery values');

  console.log('\n======================================================');
  console.log('🎉 ALL DATA VALIDATION SUITES PASSED');
  console.log('======================================================\n');
  process.exit(0);
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
