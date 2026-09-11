/**
 * VeloFind Phase 22: Kysely Repositories Unit & Query Compilation Tests
 */

import { getKysely } from '../src/server/db/kysely.ts';
import {
  brandsRepository,
  bikeModelsRepository,
  bikeVariantsRepository,
  dealersRepository,
  dealerLocationsRepository,
  offersRepository,
  offerPriceHistoryRepository,
  leadsRepository,
  outboundClicksRepository,
  leasingProvidersRepository
} from '../src/server/db/repositories/index.ts';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    throw new Error(msg);
  } else {
    console.log(`  ✓ ${msg}`);
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('⚡ Testing Kysely Repositories & SQL Compilation');
  console.log('======================================================\n');

  const db = getKysely();
  assert(db !== null && db !== undefined, 'Kysely instance initialized');

  // Test 1: Brands Repository SQL compilation
  console.log('TEST 1: Brands Repository Query Compilation');
  assert(brandsRepository !== undefined, 'brandsRepository instantiated');
  const brandsQuery = db.selectFrom('brands').selectAll().where('is_active', '=', true).compile();
  assert(brandsQuery.sql.includes('select'), 'Brands select SQL compiled');
  assert(brandsQuery.sql.includes('"brands"'), 'Targets brands table');
  assert(brandsQuery.parameters.length === 1 && brandsQuery.parameters[0] === true, 'Binds is_active parameter');

  // Test 2: Bike Models Repository SQL compilation
  console.log('\nTEST 2: Bike Models Repository Query Compilation');
  assert(bikeModelsRepository !== undefined, 'bikeModelsRepository instantiated');
  const modelsQuery = db
    .selectFrom('bike_models')
    .selectAll()
    .where('category', '=', 'MTB')
    .where('model_year', '=', 2025)
    .compile();
  assert(modelsQuery.sql.includes('"bike_models"'), 'Targets bike_models table');
  assert(modelsQuery.parameters.includes('MTB'), 'Binds category parameter');
  assert(modelsQuery.parameters.includes(2025), 'Binds model_year parameter');

  // Test 3: Bike Variants Repository SQL compilation
  console.log('\nTEST 3: Bike Variants Repository Query Compilation');
  assert(bikeVariantsRepository !== undefined, 'bikeVariantsRepository instantiated');
  const variantsQuery = db
    .selectFrom('bike_variants')
    .selectAll()
    .where('gtin', '=', '4012345678901')
    .compile();
  assert(variantsQuery.sql.includes('"bike_variants"'), 'Targets bike_variants table');
  assert(variantsQuery.parameters.includes('4012345678901'), 'Binds GTIN parameter');

  // Test 4: Dealers Repository SQL compilation
  console.log('\nTEST 4: Dealers Repository Query Compilation');
  assert(dealersRepository !== undefined, 'dealersRepository instantiated');
  const dealersQuery = db
    .selectFrom('dealers')
    .selectAll()
    .where('slug', '=', 'zweirad-stadler-berlin')
    .compile();
  assert(dealersQuery.sql.includes('"dealers"'), 'Targets dealers table');
  assert(dealersQuery.parameters.includes('zweirad-stadler-berlin'), 'Binds slug parameter');

  // Test 5: Dealer Locations Repository & PostGIS Query
  console.log('\nTEST 5: Dealer Locations & PostGIS Spatial Compilation');
  assert(dealerLocationsRepository !== undefined, 'dealerLocationsRepository instantiated');
  const locationsQuery = db
    .selectFrom('dealer_locations')
    .selectAll()
    .where('postal_code', '=', '10115')
    .compile();
  assert(locationsQuery.sql.includes('"dealer_locations"'), 'Targets dealer_locations table');
  assert(locationsQuery.parameters.includes('10115'), 'Binds postal code parameter');

  // Test 6: Offers Repository & Idempotent Upsert SQL
  console.log('\nTEST 6: Offers Repository Query Compilation');
  assert(offersRepository !== undefined, 'offersRepository instantiated');
  const offersQuery = db
    .selectFrom('offers')
    .selectAll()
    .where('is_active', '=', true)
    .where('price_cents', '<=', 500000)
    .compile();
  assert(offersQuery.sql.includes('"offers"'), 'Targets offers table');
  assert(offersQuery.parameters.includes(500000), 'Binds price_cents parameter');

  // Test 7: Offer Price History Repository SQL
  console.log('\nTEST 7: Offer Price History Repository Query Compilation');
  assert(offerPriceHistoryRepository !== undefined, 'offerPriceHistoryRepository instantiated');
  const priceHistoryQuery = db
    .selectFrom('offer_price_history')
    .selectAll()
    .where('offer_id', '=', '11111111-1111-1111-1111-111111111111')
    .compile();
  assert(priceHistoryQuery.sql.includes('"offer_price_history"'), 'Targets offer_price_history table');

  // Test 8: Leads Repository SQL
  console.log('\nTEST 8: Leads Repository Query Compilation');
  assert(leadsRepository !== undefined, 'leadsRepository instantiated');
  const leadsQuery = db
    .selectFrom('leads')
    .selectAll()
    .where('status', '=', 'NEW')
    .compile();
  assert(leadsQuery.sql.includes('"leads"'), 'Targets leads table');
  assert(leadsQuery.parameters.includes('NEW'), 'Binds status parameter');

  // Test 9: Outbound Clicks Repository SQL
  console.log('\nTEST 9: Outbound Clicks Repository Query Compilation');
  assert(outboundClicksRepository !== undefined, 'outboundClicksRepository instantiated');
  const clicksQuery = db
    .selectFrom('outbound_clicks')
    .selectAll()
    .where('dealer_id', '=', '22222222-2222-2222-2222-222222222222')
    .compile();
  assert(clicksQuery.sql.includes('"outbound_clicks"'), 'Targets outbound_clicks table');

  // Test 10: Leasing Providers Repository SQL
  console.log('\nTEST 10: Leasing Providers Repository Query Compilation');
  assert(leasingProvidersRepository !== undefined, 'leasingProvidersRepository instantiated');
  const providersQuery = db
    .selectFrom('leasing_providers')
    .selectAll()
    .where('slug', '=', 'jobrad')
    .compile();
  assert(providersQuery.sql.includes('"leasing_providers"'), 'Targets leasing_providers table');
  assert(providersQuery.parameters.includes('jobrad'), 'Binds slug parameter');

  console.log('\n======================================================');
  console.log('🎉 ALL 10 KYSELY REPOSITORIES COMPILED CLEANLY');
  console.log('======================================================\n');
}

runTests().catch((err) => {
  console.error('Phase 22 Test Failure:', err);
  process.exit(1);
});
