/**
 * VeloFind Phase 29: Production Monitoring, Health Checks & Operational Metrics Tests
 */

import { metrics } from '../src/server/monitoring/metrics.ts';
import { handleLivenessCheck, handleReadinessCheck } from '../src/server/monitoring/health.ts';

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
  console.log('⚡ Testing Phase 29: Health Probes & Operational Metrics');
  console.log('======================================================\n');

  // Test 1: Liveness probe handler returns 200 OK without DB queries
  console.log('TEST 1: Liveness probe execution');
  let liveStatus = 0;
  let livePayload: any = null;
  const mockLiveReq: any = {};
  const mockLiveRes: any = {
    setHeader: () => {},
    status: (code: number) => {
      liveStatus = code;
      return {
        json: (data: any) => {
          livePayload = data;
        }
      };
    }
  };

  handleLivenessCheck(mockLiveReq, mockLiveRes);
  assert(liveStatus === 200, 'Liveness probe responds with HTTP 200');
  assert(livePayload.status === 'ok', 'Liveness payload contains status: ok');
  assert(typeof livePayload.uptimeSeconds === 'number', 'Liveness payload contains numeric uptimeSeconds');
  assert(typeof livePayload.timestamp === 'string', 'Liveness payload contains timestamp');

  // Test 2: Bounded route normalization
  console.log('\nTEST 2: Route Normalization (Bounded Cardinality)');
  const normOffer = metrics.normalizeRoute('GET', '/api/offers/123e4567-e89b-12d3-a456-426614174000');
  assert(normOffer === 'GET /api/offers/:id', 'Normalizes /api/offers/:uuid to bounded pattern');

  const normDealer = metrics.normalizeRoute('GET', '/api/dealers/radhaus-berlin?sort=price');
  assert(normDealer === 'GET /api/dealers/:id', 'Normalizes dealer slug and strips query parameters');

  const normOut = metrics.normalizeRoute('GET', '/out/d89c3c88-df11-4d5f-8861-4c8079a9180a');
  assert(normOut === 'GET /out/:token', 'Normalizes outbound click redirect routes');

  // Test 3: Metrics accumulation and snapshot structure
  console.log('\nTEST 3: Operational Metrics Snapshot & Counters');
  metrics.reset();

  metrics.recordHttpRequest('GET', '/api/search', 200, 15);
  metrics.recordHttpRequest('POST', '/api/leads', 201, 30);
  metrics.recordHttpRequest('GET', '/api/offers/non-existent', 404, 10);
  metrics.recordHttpRequest('GET', '/api/crash', 500, 5);

  metrics.recordOutboundClick();
  metrics.recordOutboundClick();
  metrics.recordLeadCreated();
  metrics.recordDbConnectionError();
  metrics.recordFeedImportRun({ success: true, importedRows: 42, quarantinedRows: 1 });

  const snapshot = metrics.getSnapshot();

  assert(snapshot.http.requestsTotal === 4, 'Correct total HTTP requests count');
  assert(snapshot.http.errorsByClass['4xx'] === 1, 'Correct 4xx errors count');
  assert(snapshot.http.errorsByClass['5xx'] === 1, 'Correct 5xx errors count');
  assert(snapshot.businessEvents.outboundClicksTotal === 2, 'Correct outbound clicks total');
  assert(snapshot.businessEvents.leadsCreatedTotal === 1, 'Correct leads created total');
  assert(snapshot.feedIngestion.importRunsTotal === 1, 'Correct feed import runs total');
  assert(snapshot.feedIngestion.importedRowsTotal === 42, 'Correct imported rows total');
  assert(snapshot.feedIngestion.quarantinedRowsTotal === 1, 'Correct quarantined rows total');
  assert(snapshot.postgresPool.connectionErrorsTotal === 1, 'Correct DB connection errors total');
  assert(snapshot.postgresPool.maxConnections >= 1, 'PostgreSQL pool max connection metric reported');

  console.log('\n======================================================');
  console.log('✅ All Phase 29 Monitoring & Metrics tests passed!');
  console.log('======================================================\n');
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
