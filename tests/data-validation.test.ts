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

  // TEST 6: Suspicious Weight Detection on E-Bikes (< 15kg & higher than range)
  console.log('\nTEST 6: Comprehensive Weight Sanity Check & Manual Review Flags');
  const mockSuspiciousLowEbike: Offer = {
    ...mockValidEbike,
    id: 'test-suspicious-weight-low',
    variant_details: {
      ...mockValidEbike.variant_details!,
      weight_kg: 14.2 // Corrupt bio weight on standard e-trekking (< 15kg)
    }
  };
  const weightLowIssues = dataValidatorService.validateOffer(mockSuspiciousLowEbike, true);
  assert(weightLowIssues.some(i => i.ruleViolated === 'SUSPICIOUS_WEIGHT'), 'Detected SUSPICIOUS_WEIGHT for e-bike < 15 kg');
  assert(mockSuspiciousLowEbike.manual_review_required === true, 'Set manual_review_required = true on offer');
  assert(Boolean(mockSuspiciousLowEbike.review_flags?.includes('SUSPICIOUS_WEIGHT')), 'Added SUSPICIOUS_WEIGHT to review_flags');
  assert(mockSuspiciousLowEbike.variant_details?.manual_review_required === true, 'Set manual_review_required on variant_details');
  assert(mockSuspiciousLowEbike.variant_details?.weight_kg! >= 24.0, 'Auto-fixed suspicious weight to authentic e-bike weight >= 24 kg');

  // Test suspiciously high weight
  const mockSuspiciousHighEbike: Offer = {
    ...mockValidEbike,
    id: 'test-suspicious-weight-high',
    variant_details: {
      ...mockValidEbike.variant_details!,
      weight_kg: 48.0 // Implausibly high for standard e-trekking
    }
  };
  const weightHighIssues = dataValidatorService.validateOffer(mockSuspiciousHighEbike, true);
  assert(weightHighIssues.some(i => i.ruleViolated === 'SUSPICIOUS_WEIGHT'), 'Detected SUSPICIOUS_WEIGHT for implausibly heavy e-bike');
  assert(mockSuspiciousHighEbike.manual_review_required === true, 'Flagged heavy e-bike for manual review');

  // TEST 7: Torque and Battery Sanity Checks
  console.log('\nTEST 7: Torque & Battery Sanity Checks');
  const mockBadTorqueEbike: Offer = {
    ...mockValidEbike,
    id: 'test-bad-torque',
    variant_details: {
      ...mockValidEbike.variant_details!,
      torque_nm: 10 // Implausibly low torque for e-bike (< 25 Nm)
    }
  };
  const torqueIssues = dataValidatorService.validateOffer(mockBadTorqueEbike, true);
  assert(torqueIssues.some(i => i.ruleViolated === 'TORQUE_OUT_OF_BOUNDS'), 'Detected TORQUE_OUT_OF_BOUNDS');
  assert(mockBadTorqueEbike.manual_review_required === true, 'Flagged bad torque offer for manual review');
  assert(mockBadTorqueEbike.variant_details?.torque_nm! >= 50, 'Auto-corrected torque to plausible value');

  const mockBadBatteryEbike: Offer = {
    ...mockValidEbike,
    id: 'test-bad-battery',
    variant_details: {
      ...mockValidEbike.variant_details!,
      battery_wh: 50 // Implausibly low battery for e-bike (< 150 Wh)
    }
  };
  const batteryIssues = dataValidatorService.validateOffer(mockBadBatteryEbike, true);
  assert(batteryIssues.some(i => i.ruleViolated === 'BATTERY_OUT_OF_BOUNDS'), 'Detected BATTERY_OUT_OF_BOUNDS');
  assert(mockBadBatteryEbike.manual_review_required === true, 'Flagged bad battery offer for manual review');

  // TEST 8: Max Permissible Weight Sanity (Zul. Gesamtgewicht)
  console.log('\nTEST 8: Max Permissible Weight Sanity Check');
  const mockInvalidMaxWeight: Offer = {
    ...mockValidEbike,
    id: 'test-invalid-max-weight',
    variant_details: {
      ...mockValidEbike.variant_details!,
      weight_kg: 26.5,
      max_weight_kg: 20 // Impossible: max weight less than bike's own weight
    }
  };
  const maxWeightIssues = dataValidatorService.validateOffer(mockInvalidMaxWeight, true);
  assert(maxWeightIssues.some(i => i.ruleViolated === 'MAX_WEIGHT_SANITY'), 'Detected MAX_WEIGHT_SANITY violation (max_weight <= weight_kg)');
  assert(mockInvalidMaxWeight.manual_review_required === true, 'Flagged max weight contradiction for manual review');
  assert(mockInvalidMaxWeight.variant_details?.max_weight_kg! > mockInvalidMaxWeight.variant_details?.weight_kg!, 'Corrected max_weight_kg exceeds bike own weight');

  // TEST 9: Winora TRIA R5 Low Classification & Authentic 28.0 kg Weight
  console.log('\nTEST 9: Winora TRIA R5 Low E-Bike Classification & 28.0 kg Weight');
  const mockWinoraTria: Offer = {
    id: 'test-winora-tria-corrupt',
    dealer_id: 'test-dealer-1',
    dealer_name: 'B.O.C. Bochum',
    dealer_slug: 'boc-bochum',
    dealer_verified: true,
    dealer_locations: [],
    source_id: 'test-src',
    external_id: 'BOC-15516403106057',
    title: 'Winora TRIA R5 Low',
    brand_name: 'WINORA',
    model_name: 'TRIA R5 Low',
    model_year: 2025,
    category: 'TREKKING',
    propulsion: 'MUSCULAR', // Previously misclassified as muscular
    price_cents: 359900,
    currency: 'EUR',
    availability: 'IN_STOCK',
    quantity: 1,
    condition: 'NEW',
    source_url: 'https://example.com/winora-tria-r5',
    content_hash: 'hash-winora-tria',
    first_seen_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString(),
    is_active: true,
    leasing_compatibilities: [],
    variant_details: {
      frame_size: 'CAVALRY / 41 CM',
      frame_type: 'DIAMOND', // Incorrectly marked as DIAMOND
      color: 'Graphite Anthrazit',
      wheel_size_in: 28,
      weight_kg: 14.2, // Corrupt 14.2 kg bio weight
      max_weight_kg: 140
    }
  };

  const winoraIssues = dataValidatorService.validateOffer(mockWinoraTria, true);
  assert(winoraIssues.some(i => i.ruleViolated === 'EBIKE_MISCLASSIFIED_AS_MUSCULAR'), 'Caught Winora TRIA R5 misclassified as muscular');
  assert(mockWinoraTria.propulsion === 'PEDELEC', 'Reclassified Winora TRIA R5 to PEDELEC');
  assert(mockWinoraTria.variant_details?.frame_type === 'STEP_THROUGH', 'Corrected frame_type to STEP_THROUGH (Wave/Low)');
  assert(mockWinoraTria.variant_details?.motor_brand === 'Bosch', 'Assigned Bosch motor to Winora TRIA R5');
  assert(mockWinoraTria.variant_details?.torque_nm === 75, 'Assigned 75 Nm torque to Winora TRIA R5');
  assert(mockWinoraTria.variant_details?.battery_wh === 625, 'Assigned 625 Wh battery to Winora TRIA R5');
  assert(mockWinoraTria.variant_details?.weight_kg === 28.0, 'Assigned authentic manufacturer weight 28.0 kg (never 14.2 kg)');
  assert(mockWinoraTria.variant_details?.max_weight_kg === 130, 'Assigned authentic Winora max weight 130 kg');

  // TEST 10: Integration with DailySyncService pipeline
  console.log('\nTEST 10: Daily Sync Pipeline Integration');
  const syncStatus = dailySyncService.getStatus();
  assert(syncStatus.automatedDailySync === true, 'dailySyncService has automatedDailySync enabled');
  assert(typeof syncStatus.scheduleInterval === 'string', 'dailySyncService provides human-readable schedule interval');
  assert('lastValidationReport' in syncStatus, 'dailySyncService exposes lastValidationReport');

  // TEST 11: Live Catalog Health Verification
  console.log('\nTEST 11: Full Live Catalog Discrepancy Scan');
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
