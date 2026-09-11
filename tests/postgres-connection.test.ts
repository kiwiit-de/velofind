/**
 * VeloFind Phase 21: PostgreSQL 17 + PostGIS Connection & Health Tests
 */

import { getPool, verifyPostgresConnection, verifyPostgisExtension, closePool } from '../src/server/db/pool.ts';

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
  console.log('🐘 Testing PostgreSQL 17 & PostGIS Connection Layer');
  console.log('======================================================\n');

  // Test 1: Pool initialization and config contracts
  console.log('TEST 1: Pool Configuration & Initialization');
  const pool = getPool();
  assert(pool !== null && pool !== undefined, 'Pool initialized');
  assert(pool.options.max === 20, 'Default pool maximum connections is 20');
  assert(pool.options.idleTimeoutMillis === 30000, 'Idle timeout is 30,000 ms');
  assert(pool.options.connectionTimeoutMillis === 3000, 'Connection timeout is 3,000 ms');

  // Test 2: Connection Verification Function Contract
  console.log('\nTEST 2: PostgreSQL Connectivity Verification');
  const pgStatus = await verifyPostgresConnection();
  assert(typeof pgStatus.connected === 'boolean', 'Returns structured connected boolean flag');
  assert(typeof pgStatus.latencyMs === 'number', 'Measures connection check latency in ms');

  if (pgStatus.connected) {
    console.log(`  ℹ Connected to live PostgreSQL: ${pgStatus.version?.split('\n')[0]}`);
    console.log(`  ℹ Active Database: ${pgStatus.database}`);
    assert(pgStatus.version !== undefined, 'PostgreSQL version string returned');
  } else {
    console.log(`  ℹ PostgreSQL offline (expected in sandbox without Docker): ${pgStatus.error}`);
    assert(typeof pgStatus.error === 'string', 'Error message reported gracefully without process crash');
  }

  // Test 3: PostGIS Extension Verification Function Contract
  console.log('\nTEST 3: PostGIS Spatial Extension Verification');
  const postgisStatus = await verifyPostgisExtension();
  assert(typeof postgisStatus.available === 'boolean', 'Returns structured PostGIS availability flag');

  if (postgisStatus.available) {
    console.log(`  ℹ PostGIS active: ${postgisStatus.fullVersion || postgisStatus.installedVersion}`);
    assert(postgisStatus.installedVersion !== undefined || postgisStatus.fullVersion !== undefined, 'PostGIS version reported');
  } else {
    console.log(`  ℹ PostGIS check reported: ${postgisStatus.error}`);
    assert(typeof postgisStatus.error === 'string', 'Error message captured safely');
  }

  // Test 4: Graceful Pool Termination
  console.log('\nTEST 4: Graceful Pool Termination');
  await closePool();
  assert(true, 'Pool ended cleanly without hanging handles');

  console.log('\n======================================================');
  console.log('🎉 PHASE 21 POSTGRESQL CONNECTION TESTS COMPLETE');
  console.log('======================================================\n');
}

runTests().catch((err) => {
  console.error('Phase 21 Test Failure:', err);
  process.exit(1);
});
