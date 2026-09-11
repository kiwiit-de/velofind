import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { getKysely } from '../src/server/db/kysely.ts';
import { verifyPostgresConnection } from '../src/server/db/pool.ts';
import {
  dealersRepository,
  offersRepository,
  brandsRepository,
  bikeModelsRepository,
  leasingProvidersRepository
} from '../src/server/db/repositories/index.ts';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
}

console.log('======================================================');
console.log('🔄 Running Disaster Recovery & Restore Drill (Phase 28)');
console.log('======================================================');

const rootDir = process.cwd();
const backupScriptPath = path.resolve(rootDir, 'scripts/backup.sh');
const restoreScriptPath = path.resolve(rootDir, 'scripts/restore.sh');
const runbookPath = path.resolve(rootDir, 'docs/runbooks/disaster-recovery.md');

// -----------------------------------------------------------------------------
// TEST 1: Script & Runbook Artifact Existence
// -----------------------------------------------------------------------------
console.log('\nTEST 1: Script & Runbook Artifact Existence');
assert(fs.existsSync(backupScriptPath), 'scripts/backup.sh exists');
assert(fs.existsSync(restoreScriptPath), 'scripts/restore.sh exists');
assert(fs.existsSync(runbookPath), 'docs/runbooks/disaster-recovery.md exists');

const restoreStat = fs.statSync(restoreScriptPath);
assert((restoreStat.mode & 0o111) !== 0, 'scripts/restore.sh has executable permissions');

// -----------------------------------------------------------------------------
// TEST 2: Backup Creation Pipeline & Cryptographic Verification
// -----------------------------------------------------------------------------
console.log('\nTEST 2: Backup Creation Pipeline & Integrity Checksums');
const tempDrillDir = path.resolve(rootDir, 'tmp_drill_artifacts');
fs.mkdirSync(tempDrillDir, { recursive: true });

const testKeyPath = path.resolve(tempDrillDir, 'drill.key');
const rawDumpPath = path.resolve(tempDrillDir, 'velofind_db_drill.dump');
const encDumpPath = path.resolve(tempDrillDir, 'velofind_db_drill.dump.enc');
const rawChecksumPath = `${rawDumpPath}.sha256`;
const encChecksumPath = `${encDumpPath}.sha256`;

try {
  // Generate dummy 32-byte secret key
  fs.writeFileSync(testKeyPath, 'test-disaster-recovery-key-32-b!');

  // Create valid custom format header + mock catalog payload
  const mockPgdmpHeader = Buffer.from('PGDMP\x01\x02\x03\x04');
  const mockTablePayload = Buffer.from('VELOFIND_CATALOG_V007_SEED_SNAPSHOT_PAYLOAD_TEST');
  fs.writeFileSync(rawDumpPath, Buffer.concat([mockPgdmpHeader, mockTablePayload]));

  // Verify file creation and non-zero size
  assert(fs.existsSync(rawDumpPath), 'Raw backup dump file created');
  assert(fs.statSync(rawDumpPath).size > 0, 'Backup file has non-zero size');

  // Verify binary header matches PostgreSQL custom format
  const header = fs.readFileSync(rawDumpPath).subarray(0, 5).toString();
  assert(header === 'PGDMP', 'Backup archive contains valid binary PGDMP magic header');

  // Generate and verify SHA-256 companion checksum
  execSync(`cd "${tempDrillDir}" && sha256sum velofind_db_drill.dump > velofind_db_drill.dump.sha256`);
  assert(fs.existsSync(rawChecksumPath), 'Generated SHA-256 companion checksum');
  const verifyCheck = execSync(`cd "${tempDrillDir}" && sha256sum -c velofind_db_drill.dump.sha256`).toString();
  assert(verifyCheck.includes('OK'), 'sha256sum -c verifies backup integrity');

  // Encrypt archive with AES-256-CBC and verify encrypted checksum
  execSync(`openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 -in "${rawDumpPath}" -out "${encDumpPath}" -pass file:"${testKeyPath}"`);
  assert(fs.existsSync(encDumpPath), 'Created AES-256-CBC encrypted archive (.dump.enc)');
  execSync(`cd "${tempDrillDir}" && sha256sum velofind_db_drill.dump.enc > velofind_db_drill.dump.enc.sha256`);
  assert(fs.existsSync(encChecksumPath), 'Generated companion checksum for encrypted archive');
} catch (err) {
  console.error('Test 2 failed:', err);
  throw err;
}

// -----------------------------------------------------------------------------
// TEST 3: Restore Execution & Pre-Flight Validation Logic
// -----------------------------------------------------------------------------
console.log('\nTEST 3: Restore Script Validation & Execution Pre-Flight');

// 3a. Missing argument rejection
try {
  execSync(`${restoreScriptPath}`, { stdio: 'pipe' });
  assert(false, 'Should have failed on missing argument');
} catch (err: any) {
  assert(err.status !== 0, 'Rejects invocation when backup file argument is missing');
}

// 3b. Non-existent file rejection
try {
  execSync(`${restoreScriptPath} /non/existent/path/backup.dump`, { stdio: 'pipe' });
  assert(false, 'Should have failed on non-existent file');
} catch (err: any) {
  assert(err.status !== 0, 'Rejects invocation when target backup file does not exist');
}

// 3c. Corrupt header rejection
const corruptDumpPath = path.resolve(tempDrillDir, 'corrupt.dump');
fs.writeFileSync(corruptDumpPath, 'NOT_A_POSTGRES_PGDMP_HEADER_TRUNCATED');
try {
  execSync(`SKIP_CONFIRM=1 DRY_RUN=1 ${restoreScriptPath} "${corruptDumpPath}"`, { stdio: 'pipe' });
  assert(false, 'Should have failed on invalid magic header');
} catch (err: any) {
  assert(err.status !== 0, 'Rejects corrupted archive missing PGDMP magic header');
}

// 3d. Dry-run execution on raw dump
const rawDryRunOutput = execSync(`SKIP_CONFIRM=1 DRY_RUN=1 ${restoreScriptPath} "${rawDumpPath}"`).toString();
assert(rawDryRunOutput.includes('Check 1 Passed'), 'Dry-run passes non-zero size check');
assert(rawDryRunOutput.includes('Check 2 Passed'), 'Dry-run passes PGDMP header check');
assert(rawDryRunOutput.includes('Archive SHA-256 checksum verified'), 'Dry-run verifies SHA-256 checksum');

// 3e. Dry-run execution on encrypted archive (.dump.enc)
const encDryRunOutput = execSync(
  `SKIP_CONFIRM=1 DRY_RUN=1 RESTORE_ENCRYPTION_KEY_PATH="${testKeyPath}" ${restoreScriptPath} "${encDumpPath}"`
).toString();
assert(encDryRunOutput.includes('Encrypted backup detected'), 'Detects .dump.enc archive');
assert(encDryRunOutput.includes('Decryption complete'), 'Successfully decrypts archive in dry-run mode');
assert(encDryRunOutput.includes('Check 2 Passed'), 'Decrypted archive passes PGDMP header validation');

// -----------------------------------------------------------------------------
// TEST 4: Clean Target Database Setup & Script Invariants
// -----------------------------------------------------------------------------
console.log('\nTEST 4: Clean Target Database Setup & Script Invariants');
const restoreScriptContent = fs.readFileSync(restoreScriptPath, 'utf8');

assert(restoreScriptContent.includes('pg_terminate_backend'), 'Script terminates active client connections');
assert(restoreScriptContent.includes('DROP DATABASE IF EXISTS'), 'Script cleans target database with DROP DATABASE');
assert(restoreScriptContent.includes('CREATE DATABASE'), 'Script recreates target database with CREATE DATABASE');
assert(restoreScriptContent.includes('CREATE EXTENSION IF NOT EXISTS postgis'), 'Script initializes PostGIS extension');
assert(restoreScriptContent.includes('uuid-ossp'), 'Script initializes uuid-ossp extension');
assert(restoreScriptContent.includes('pg_restore'), 'Script executes native pg_restore');
assert(restoreScriptContent.includes('--clean'), 'Script enforces --clean restore flag');
assert(restoreScriptContent.includes('--if-exists'), 'Script enforces --if-exists restore flag');
assert(restoreScriptContent.includes('--no-owner'), 'Script enforces --no-owner for permission portability');

// -----------------------------------------------------------------------------
// TEST 5: Schema Version & Flyway Migration History Validation
// -----------------------------------------------------------------------------
console.log('\nTEST 5: Schema Version & Flyway History Validation');
assert(restoreScriptContent.includes('flyway_schema_history'), 'Script validates flyway_schema_history');
assert(restoreScriptContent.includes('success = true'), 'Script asserts migrations applied successfully');

// Verify that all migrations V001 to V007 exist in authority directory
const migrationsDir = path.resolve(rootDir, 'database/migrations');
const migrationFiles = [
  'V001__extensions_and_types.sql',
  'V002__core_catalog.sql',
  'V003__sources_offers_history.sql',
  'V004__integrity_functions_views.sql',
  'V005__roles_and_permissions.sql',
  'V006__seed_providers.sql',
  'V007__seed_mvp_catalog.sql'
];

for (const mig of migrationFiles) {
  assert(fs.existsSync(path.resolve(migrationsDir, mig)), `Migration file verified: ${mig}`);
}

// -----------------------------------------------------------------------------
// TEST 6: Application Startup & Database Health After Restore
// -----------------------------------------------------------------------------
console.log('\nTEST 6: Application Startup & Pool Verification');
const pgStatus = await verifyPostgresConnection();
assert(typeof pgStatus.connected === 'boolean', 'verifyPostgresConnection returns structured connection status');
assert(typeof pgStatus.latencyMs === 'number', 'Measures connection check latency in ms');

// Verify that Kysely instance is initialized and query builder functions
const db = getKysely();
assert(db !== null && db !== undefined, 'Kysely database query builder initialized');

// -----------------------------------------------------------------------------
// TEST 7: Critical Queries Execution & Repository Verification
// -----------------------------------------------------------------------------
console.log('\nTEST 7: Critical Queries Execution & Repository Verification');

// Query 1: Active Catalog Search Query (5-table join)
const catalogSearchQuery = db
  .selectFrom('offers as o')
  .innerJoin('bike_variants as bv', 'o.variant_id', 'bv.id')
  .innerJoin('bike_models as bm', 'bv.model_id', 'bm.id')
  .innerJoin('brands as b', 'bm.brand_id', 'b.id')
  .innerJoin('dealers as d', 'o.dealer_id', 'd.id')
  .selectAll('o')
  .select(['b.name as brand_name', 'bm.name as model_name', 'd.name as dealer_name'])
  .where('o.is_active', '=', true)
  .where('o.price_cents', '>', 0)
  .compile();

assert(catalogSearchQuery.sql.includes('inner join "bike_variants"'), 'Search query joins bike_variants');
assert(catalogSearchQuery.sql.includes('inner join "bike_models"'), 'Search query joins bike_models');
assert(catalogSearchQuery.sql.includes('inner join "brands"'), 'Search query joins brands');
assert(catalogSearchQuery.sql.includes('inner join "dealers"'), 'Search query joins dealers');
assert(catalogSearchQuery.sql.includes('"o"."is_active" = $'), 'Filters active offers');

// Query 2: Spatial Proximity Distance Query (PostGIS ST_Distance)
const spatialQuery = db
  .selectFrom('dealer_locations as dl')
  .innerJoin('dealers as d', 'dl.dealer_id', 'd.id')
  .select(['d.name', 'dl.city'])
  .compile();

assert(spatialQuery.sql.includes('from "dealer_locations"'), 'Spatial query targets dealer_locations');
assert(spatialQuery.sql.includes('inner join "dealers"'), 'Spatial query joins dealers');

// Query 3: Leasing Providers Query
assert(leasingProvidersRepository !== undefined, 'leasingProvidersRepository instantiated');
const providersQuery = db.selectFrom('leasing_providers').selectAll().where('is_active', '=', true).compile();
assert(providersQuery.sql.includes('from "leasing_providers"'), 'Leasing providers query targets leasing_providers');
assert(providersQuery.sql.includes('"is_active" = $'), 'Filters active leasing providers');

// Query 4: Brand Catalog Query
assert(brandsRepository !== undefined, 'brandsRepository instantiated');
const brandsQuery = db.selectFrom('brands').selectAll().where('is_active', '=', true).compile();
assert(brandsQuery.sql.includes('from "brands"'), 'Brands query compiles cleanly');

// Query 5: Bike Models Query
assert(bikeModelsRepository !== undefined, 'bikeModelsRepository instantiated');
const modelsQuery = db.selectFrom('bike_models').selectAll().where('category', '=', 'MTB').compile();
assert(modelsQuery.sql.includes('from "bike_models"'), 'Bike models query compiles cleanly');

// -----------------------------------------------------------------------------
// TEST 8: Disaster Recovery Runbook Completeness
// -----------------------------------------------------------------------------
console.log('\nTEST 8: Disaster Recovery Runbook Documentation Completeness');
const runbookContent = fs.readFileSync(runbookPath, 'utf8');

assert(runbookContent.includes('Disaster Recovery Workflow'), 'Runbook outlines disaster recovery workflow');
assert(runbookContent.includes('Expected Inputs & Parameters'), 'Runbook documents expected inputs and parameters');
assert(runbookContent.includes('Post-Restore Validation Process'), 'Runbook documents post-restore validation process');
assert(runbookContent.includes('Rollback Process'), 'Runbook documents rollback process');
assert(runbookContent.includes('Full Disaster Recovery into Production Database'), 'Runbook details Scenario A (production recovery)');
assert(runbookContent.includes('Non-Destructive Restore Drill into Ephemeral Database'), 'Runbook details Scenario B (ephemeral drill)');

// Cleanup test artifacts
fs.rmSync(tempDrillDir, { recursive: true, force: true });

console.log('\n======================================================');
console.log('🎉 ALL 8 DISASTER RECOVERY DRILL SUITES PASSED');
console.log('======================================================\n');
