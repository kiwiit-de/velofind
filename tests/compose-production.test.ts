/**
 * Production Docker Compose Stack Verification (Phase 24)
 * Validates compose.production.yml, Dockerfile, and .env.production.example
 * against production security, networking, healthcheck, and lifecycle requirements.
 */

import fs from 'fs';
import path from 'path';
import { parse as parseYaml } from 'yaml';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  ❌ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

console.log('======================================================');
console.log('🐳 Verifying Production Docker Deployment Stack (Phase 24)');
console.log('======================================================\n');

// -----------------------------------------------------------------------------
// TEST 1: File Existence & YAML Parsing
// -----------------------------------------------------------------------------
console.log('TEST 1: Compose File & Environment Template Existence');
const composePath = path.resolve(process.cwd(), 'compose.production.yml');
const envExamplePath = path.resolve(process.cwd(), '.env.production.example');
const dockerfilePath = path.resolve(process.cwd(), 'Dockerfile');

assert(fs.existsSync(composePath), 'compose.production.yml exists');
assert(fs.existsSync(envExamplePath), '.env.production.example exists');
assert(fs.existsSync(dockerfilePath), 'Dockerfile exists');

const composeContent = fs.readFileSync(composePath, 'utf8');
const composeConfig = parseYaml(composeContent);
assert(typeof composeConfig === 'object' && composeConfig !== null, 'compose.production.yml parsed as valid YAML');
assert(Boolean(composeConfig.services), 'Top-level services block is present');

// -----------------------------------------------------------------------------
// TEST 2: Service Topology & Roles
// -----------------------------------------------------------------------------
console.log('\nTEST 2: Container Topology & Services Definition');
const services = composeConfig.services;
assert(Boolean(services['caddy']), "Reverse proxy service 'caddy' defined");
assert(Boolean(services['velofind-app']), "Application service 'velofind-app' defined");
assert(Boolean(services['postgres']), "Database service 'postgres' defined");
assert(Boolean(services['flyway']), "Migration service 'flyway' defined");
assert(Boolean(services['db-backup']), "Backup service 'db-backup' defined with profile");

// -----------------------------------------------------------------------------
// TEST 3: Network Separation & Internal Isolation
// -----------------------------------------------------------------------------
console.log('\nTEST 3: Network Separation & Internal Isolation');
const networks = composeConfig.networks;
assert(Boolean(networks['public_net']), "Network 'public_net' defined");
assert(Boolean(networks['internal_net']), "Network 'internal_net' defined");
assert(networks['internal_net'].internal === true, "Network 'internal_net' has internal: true (no external gateway)");

// Caddy connects to public_net
const caddyNetworks = services['caddy'].networks;
assert(Array.isArray(caddyNetworks) && caddyNetworks.includes('public_net'), "'caddy' attached to 'public_net'");

// App connects to both public and internal
const appNetworks = services['velofind-app'].networks;
assert(Array.isArray(appNetworks) && appNetworks.includes('public_net'), "'velofind-app' attached to 'public_net'");
assert(Array.isArray(appNetworks) && appNetworks.includes('internal_net'), "'velofind-app' attached to 'internal_net'");

// Database and Flyway MUST ONLY connect to internal_net
const pgNetworks = services['postgres'].networks;
assert(Array.isArray(pgNetworks) && pgNetworks.length === 1 && pgNetworks[0] === 'internal_net', "'postgres' attached strictly to 'internal_net' only");

const flywayNetworks = services['flyway'].networks;
assert(Array.isArray(flywayNetworks) && flywayNetworks.length === 1 && flywayNetworks[0] === 'internal_net', "'flyway' attached strictly to 'internal_net' only");

// -----------------------------------------------------------------------------
// TEST 4: Port Security - Only Caddy Exposes Public Ports
// -----------------------------------------------------------------------------
console.log('\nTEST 4: Port Security (Ingress Exclusivity)');
assert(services['postgres'].ports === undefined, 'PostgreSQL does NOT expose host or public ports');
assert(services['velofind-app'].ports === undefined, 'Application container does NOT expose host or public ports directly');
assert(Array.isArray(services['caddy'].ports), "'caddy' defines public ports");
assert(services['caddy'].ports.some((p: string) => p.includes('80:80')), "'caddy' exposes port 80");
assert(services['caddy'].ports.some((p: string) => p.includes('443:443')), "'caddy' exposes port 443");

// -----------------------------------------------------------------------------
// TEST 5: Non-Root Security & Privileges
// -----------------------------------------------------------------------------
console.log('\nTEST 5: Application Container Non-Root Configuration');
assert(services['velofind-app'].user === 'node', "'velofind-app' explicitly runs as user 'node'");
const secOpt = services['velofind-app'].security_opt;
assert(Array.isArray(secOpt) && secOpt.includes('no-new-privileges:true'), "'velofind-app' enforces 'no-new-privileges:true'");

const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
assert(dockerfileContent.includes('USER node'), "Dockerfile runner stage enforces 'USER node'");
assert(dockerfileContent.includes('--chown=node:node'), 'Dockerfile uses unprivileged chown for node user');

// -----------------------------------------------------------------------------
// TEST 6: Flyway Pre-execution & Startup Order Failure Halting
// -----------------------------------------------------------------------------
console.log('\nTEST 6: Flyway Lifecycle & Startup Dependency Order');
const appDependsOn = services['velofind-app'].depends_on;
assert(Boolean(appDependsOn['flyway']), "'velofind-app' depends on 'flyway'");
assert(
  appDependsOn['flyway'].condition === 'service_completed_successfully',
  "'velofind-app' requires flyway condition 'service_completed_successfully'"
);
assert(
  appDependsOn['postgres'].condition === 'service_healthy',
  "'velofind-app' requires postgres condition 'service_healthy'"
);

const flywayDependsOn = services['flyway'].depends_on;
assert(
  flywayDependsOn['postgres'].condition === 'service_healthy',
  "'flyway' requires postgres condition 'service_healthy' before executing migrations"
);

assert(services['flyway'].restart === 'no', "'flyway' has restart: 'no' (fails fast on error)");

// -----------------------------------------------------------------------------
// TEST 7: Restart Policies
// -----------------------------------------------------------------------------
console.log('\nTEST 7: Container Restart Policies');
assert(services['velofind-app'].restart === 'unless-stopped', "'velofind-app' restart policy is 'unless-stopped'");
assert(services['postgres'].restart === 'unless-stopped', "'postgres' restart policy is 'unless-stopped'");

// -----------------------------------------------------------------------------
// TEST 8: Container Health Checks
// -----------------------------------------------------------------------------
console.log('\nTEST 8: Container Health Check Design');
const pgHealth = services['postgres'].healthcheck;
assert(Boolean(pgHealth), "'postgres' defines healthcheck");
assert(
  Array.isArray(pgHealth.test) && pgHealth.test.some((t: string) => t.includes('pg_isready')),
  "'postgres' healthcheck uses 'pg_isready'"
);

const appHealth = services['velofind-app'].healthcheck;
assert(Boolean(appHealth), "'velofind-app' defines healthcheck");
assert(
  Array.isArray(appHealth.test) && appHealth.test.some((t: string) => t.includes('/api/health')),
  "'velofind-app' healthcheck verifies '/api/health'"
);

// -----------------------------------------------------------------------------
// TEST 9: Resource Limits & Reservations
// -----------------------------------------------------------------------------
console.log('\nTEST 9: Resource Limits & Reservations');
assert(Boolean(services['velofind-app'].deploy?.resources?.limits?.cpus), "'velofind-app' defines CPU limits");
assert(Boolean(services['velofind-app'].deploy?.resources?.limits?.memory), "'velofind-app' defines memory limits");
assert(Boolean(services['postgres'].deploy?.resources?.limits?.cpus), "'postgres' defines CPU limits");
assert(Boolean(services['postgres'].deploy?.resources?.limits?.memory), "'postgres' defines memory limits");

// -----------------------------------------------------------------------------
// TEST 10: Persistent Volumes & Backup Support
// -----------------------------------------------------------------------------
console.log('\nTEST 10: Persistent Volumes & Backup Support');
const volumes = composeConfig.volumes;
assert(Boolean(volumes['postgres_data']), "Named volume 'postgres_data' defined");
assert(Boolean(volumes['postgres_backups']), "Named volume 'postgres_backups' defined");
assert(Boolean(volumes['caddy_data']), "Named volume 'caddy_data' defined for TLS certificates");
assert(Boolean(volumes['caddy_config']), "Named volume 'caddy_config' defined for Caddy autosave");

const pgVolumes = services['postgres'].volumes;
assert(
  Array.isArray(pgVolumes) && pgVolumes.some((v: string) => v.startsWith('postgres_data:')),
  "'postgres' mounts 'postgres_data' to /var/lib/postgresql/data"
);
assert(
  Array.isArray(pgVolumes) && pgVolumes.some((v: string) => v.startsWith('postgres_backups:')),
  "'postgres' mounts 'postgres_backups' volume for future backup integration"
);

const caddyVolumes = services['caddy'].volumes;
assert(
  Array.isArray(caddyVolumes) && caddyVolumes.some((v: string) => v.startsWith('caddy_data:')),
  "'caddy' mounts 'caddy_data' for certificate persistence"
);

assert(fs.existsSync(path.resolve(process.cwd(), 'scripts/backup-db.sh')), "'scripts/backup-db.sh' helper exists");
assert(fs.existsSync(path.resolve(process.cwd(), 'scripts/restore-db.sh')), "'scripts/restore-db.sh' helper exists");

// -----------------------------------------------------------------------------
// TEST 11: Production Environment Template Configuration
// -----------------------------------------------------------------------------
console.log('\nTEST 11: Production Environment Template Configuration');
const envContent = fs.readFileSync(envExamplePath, 'utf8');
const expectedVars = [
  'NODE_ENV=production',
  'PORT=3000',
  'POSTGRES_DB=',
  'POSTGRES_USER=',
  'POSTGRES_PASSWORD=',
  'DATABASE_URL=',
  'APP_URL=',
  'POSTGRES_MAX_CONNECTIONS=',
  'FLYWAY_CONNECT_RETRIES=',
  'BACKUP_RETENTION_DAYS='
];

for (const v of expectedVars) {
  assert(envContent.includes(v), `.env.production.example defines ${v}`);
}

console.log('\n======================================================');
console.log('🎉 ALL 11 PRODUCTION COMPOSE VERIFICATION SUITES PASSED');
console.log('======================================================');
