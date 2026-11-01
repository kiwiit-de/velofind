#!/usr/bin/env node
/**
 * VeloFind Catalog Data Quality & Automated Validation CLI Script
 * Scans catalog offers and database records for discrepancies:
 * - Bikes marked 'MUSCULAR' (Non-Electric) with motor_brand, torque_nm, battery_wh, or engine_type
 * - Misclassified propulsion types (Bio vs E-Bike) based on authentic title signals
 * - Frame type / size contradictions (e.g. Wave marked as DIAMOND)
 * - Wheel size contradictions
 * - Invalid price / data corruption
 *
 * Usage:
 *   npx tsx scripts/validate-catalog-data.ts [--dry-run] [--save] [--json]
 */

import fs from 'fs';
import path from 'path';
import { PARTNER_DEALERS_DATA, PARTNER_OFFERS_DATA, LEASING_PROVIDERS_DATA } from '../src/server/db/dealer-registry.ts';
import { dataValidatorService } from '../src/server/services/data-validator.service.ts';

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isJson = args.includes('--json');
const shouldSave = args.includes('--save') || (!isDryRun && !args.includes('--no-save'));

async function main() {
  console.log('======================================================');
  console.log('🚲 VeloFind Automated Catalog Data Validator');
  console.log('======================================================');
  console.log(`Scanning ${PARTNER_OFFERS_DATA.length} partner offers...`);
  console.log(`Mode: ${isDryRun ? 'DRY RUN (Report Only)' : 'AUTO-FIX (Reset invalid fields)'}`);

  const report = await dataValidatorService.validateAndCleanCatalog({
    autoFix: !isDryRun,
    offers: PARTNER_OFFERS_DATA,
    saveToAuditLog: true
  });

  if (isJson) {
    console.log(JSON.stringify(report, null, 2));
    process.exit(report.flaggedForManualReviewCount > 0 ? 1 : 0);
  }

  console.log('\n--- SCAN SUMMARY ---');
  console.log(`Total Offers Scanned:       ${report.totalOffersScanned}`);
  console.log(`Clean Offers:               ${report.cleanOffersCount}`);
  console.log(`Discrepancies Found:        ${report.discrepanciesFound}`);
  console.log(`Discrepancies Auto-Fixed:   ${report.discrepanciesAutoFixed}`);
  console.log(`Flagged for Manual Review:  ${report.flaggedForManualReviewCount}`);
  console.log(`Scan Duration:              ${report.durationMs}ms`);

  console.log('\n--- DISCREPANCY BREAKDOWN ---');
  console.log(`- Muscular with Motor/Battery: ${report.breakdown.muscularWithMotorSpecs}`);
  console.log(`- E-Bike Marked Muscular:      ${report.breakdown.ebikeMisclassifiedAsMuscular}`);
  console.log(`- Bio-Bike Marked E-Bike:      ${report.breakdown.bioMisclassifiedAsEbike}`);
  console.log(`- Frame Type Contradictions:   ${report.breakdown.frameTypeContradictions}`);
  console.log(`- Wheel Size Contradictions:   ${report.breakdown.wheelSizeContradictions}`);
  console.log(`- Invalid Prices:              ${report.breakdown.invalidPrices}`);

  if (report.flaggedForManualReview.length > 0) {
    console.log('\n⚠️ FLAGGED FOR MANUAL REVIEW:');
    report.flaggedForManualReview.slice(0, 10).forEach((item, idx) => {
      console.log(`  [${idx + 1}] [${item.severity}] ${item.title} (${item.dealerName})`);
      console.log(`      Rule: ${item.ruleViolated} | Details: ${item.details}`);
    });
    if (report.flaggedForManualReview.length > 10) {
      console.log(`  ... and ${report.flaggedForManualReview.length - 10} more items.`);
    }
  }

  // Save cleaned catalog to dealer-registry.ts if auto-fixed and changes occurred
  if (shouldSave && !isDryRun && report.discrepanciesAutoFixed > 0) {
    const registryPath = path.resolve(process.cwd(), 'src/server/db/dealer-registry.ts');
    console.log(`\nWriting ${PARTNER_OFFERS_DATA.length} sanitized offers to ${registryPath}...`);

    const outputCode = `// @ts-nocheck
/**
 * VeloFind Partner Dealers Registry Database
 * Synchronized catalog including all Bochum bicycle dealerships & authentic partner stock.
 * Only bikes and e-bikes with price over 648€ are included.
 * Fully enriched and validated: Non-electric bikes have no motor or battery values.
 */

import type { Dealer, Offer, LeasingProvider } from "../../types.ts";

export const LEASING_PROVIDERS_DATA: LeasingProvider[] = ${JSON.stringify(LEASING_PROVIDERS_DATA, null, 2)};

export const PARTNER_DEALERS_DATA: Dealer[] = ${JSON.stringify(PARTNER_DEALERS_DATA, null, 2)};

const RAW_OFFERS: any[] = ${JSON.stringify(PARTNER_OFFERS_DATA, null, 2)};

// Strictly keep only bikes and ebikes with price over 648€ (> 64800 cents)
export const PARTNER_OFFERS_DATA: Offer[] = RAW_OFFERS.filter((o: any) => o.price_cents > 64800) as Offer[];
`;
    fs.writeFileSync(registryPath, outputCode, 'utf8');
    console.log(`✓ Successfully updated ${registryPath}.`);
  }

  console.log('\n======================================================');
  if (report.discrepanciesFound === 0) {
    console.log('✅ ALL OFFERS VALIDATED: 0 discrepancies detected.');
  } else if (report.discrepanciesAutoFixed === report.discrepanciesFound) {
    console.log(`✅ ALL ${report.discrepanciesAutoFixed} DISCREPANCIES SUCCESSFULLY AUTO-FIXED & RESET.`);
  } else {
    console.log(`⚠️ VALIDATION COMPLETE: ${report.flaggedForManualReviewCount} items require manual review.`);
  }
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('Fatal error during validation script:', err);
  process.exit(1);
});
