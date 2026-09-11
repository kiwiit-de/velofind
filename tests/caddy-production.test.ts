import fs from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
}

console.log('======================================================');
console.log('🔒 Verifying Caddyfile & TLS Reverse Proxy (Phase 25)');
console.log('======================================================');

const rootDir = process.cwd();
const caddyfilePath = path.resolve(rootDir, 'Caddyfile');
const composePath = path.resolve(rootDir, 'compose.production.yml');

// -----------------------------------------------------------------------------
// TEST 1: Caddyfile Existence & Basic Syntax
// -----------------------------------------------------------------------------
console.log('\nTEST 1: Caddyfile Existence');
assert(fs.existsSync(caddyfilePath), 'Caddyfile exists in project root');
const caddyContent = fs.readFileSync(caddyfilePath, 'utf8');
assert(caddyContent.trim().length > 0, 'Caddyfile is not empty');

// -----------------------------------------------------------------------------
// TEST 2: Canonical Host & WWW Redirection
// -----------------------------------------------------------------------------
console.log('\nTEST 2: Canonical Domain & WWW Redirection');
assert(caddyContent.includes('www.velofind.de {'), "Defines 'www.velofind.de' site block");
assert(
  caddyContent.includes('redir https://velofind.de{uri} permanent'),
  "Permanently redirects 'www.velofind.de' to 'https://velofind.de{uri}'"
);
assert(caddyContent.includes('velofind.de {'), "Defines canonical 'velofind.de' site block");

// -----------------------------------------------------------------------------
// TEST 3: Automated Let's Encrypt / ACME Configuration
// -----------------------------------------------------------------------------
console.log('\nTEST 3: ACME & TLS Configuration');
assert(caddyContent.includes('{$ACME_EMAIL:admin@velofind.de}'), 'ACME email configured with fallback for automated Let\'s Encrypt / ZeroSSL');
assert(caddyContent.includes('admin off'), 'Caddy admin interface disabled for container isolation');

// -----------------------------------------------------------------------------
// TEST 4: Compression (zstd & gzip)
// -----------------------------------------------------------------------------
console.log('\nTEST 4: Compression Support');
assert(caddyContent.includes('encode zstd gzip'), 'Modern zstd and gzip compression enabled');

// -----------------------------------------------------------------------------
// TEST 5: Reverse Proxy Configuration to Private Upstream
// -----------------------------------------------------------------------------
console.log('\nTEST 5: Reverse Proxy Upstream Routing');
assert(caddyContent.includes('reverse_proxy velofind-app:3000'), "Reverse proxy targets isolated 'velofind-app:3000' container");
assert(caddyContent.includes('header_up Host {host}'), 'Passes through original Host header to Express application');
assert(caddyContent.includes('header_up X-Real-IP {remote_host}'), 'Sets X-Real-IP header with client IP');
assert(caddyContent.includes('header_up X-Forwarded-For {remote_host}'), 'Sets X-Forwarded-For header');
assert(caddyContent.includes('header_up X-Forwarded-Proto {scheme}'), 'Sets X-Forwarded-Proto header');

// -----------------------------------------------------------------------------
// TEST 6: Infrastructure Concealment (Server Signature Stripping)
// -----------------------------------------------------------------------------
console.log('\nTEST 6: Infrastructure Concealment');
assert(caddyContent.includes('-Server'), "Strips 'Server' response header to hide reverse proxy technology");
assert(caddyContent.includes('-X-Powered-By'), "Strips 'X-Powered-By' response header to hide Express/Node runtime");

// -----------------------------------------------------------------------------
// TEST 7: Mandatory Security Headers
// -----------------------------------------------------------------------------
console.log('\nTEST 7: Security Headers Suite');
assert(caddyContent.includes('Content-Security-Policy'), "Defines 'Content-Security-Policy' (CSP) header");
assert(caddyContent.includes("default-src 'self'"), 'CSP enforces default-src self');
assert(caddyContent.includes("frame-ancestors 'none'"), 'CSP blocks framing/clickjacking');
assert(caddyContent.includes('X-Frame-Options "DENY"'), "Enforces 'X-Frame-Options: DENY'");
assert(caddyContent.includes('X-Content-Type-Options "nosniff"'), "Enforces 'X-Content-Type-Options: nosniff'");
assert(caddyContent.includes('Referrer-Policy "strict-origin-when-cross-origin"'), "Enforces 'Referrer-Policy: strict-origin-when-cross-origin'");
assert(caddyContent.includes('Permissions-Policy'), "Enforces 'Permissions-Policy' to restrict sensitive device APIs");
assert(caddyContent.includes('Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"'), 'Enforces HSTS with 1 year duration and preload');

// -----------------------------------------------------------------------------
// TEST 8: Compose Stack Ingress Isolation & Port Privacy
// -----------------------------------------------------------------------------
console.log('\nTEST 8: Docker Compose Ingress Invariants');
assert(fs.existsSync(composePath), 'compose.production.yml exists');
const composeConfig = parseYaml(fs.readFileSync(composePath, 'utf8')) as Record<string, any>;
const services = composeConfig.services;

assert(Boolean(services['caddy']), "'caddy' service present in production compose stack");
const caddyPorts = services['caddy'].ports;
assert(Array.isArray(caddyPorts), "'caddy' defines exposed ports");
assert(caddyPorts.some((p: string) => p.includes('80:80')), "'caddy' exposes public HTTP port 80");
assert(caddyPorts.some((p: string) => p.includes('443:443')), "'caddy' exposes public HTTPS port 443");

// Verify that velofind-app and postgres DO NOT expose ports to host
assert(services['velofind-app'].ports === undefined, "'velofind-app' has NO public/host ports exposed (completely private)");
assert(services['postgres'].ports === undefined, "'postgres' has NO public/host ports exposed (completely private)");

// Verify Caddy mount
const caddyVols = services['caddy'].volumes;
assert(caddyVols.some((v: string) => v.includes('Caddyfile') && v.includes(':ro')), 'Mounts Caddyfile as read-only');
assert(caddyVols.some((v: string) => v.startsWith('caddy_data:')), 'Mounts persistent caddy_data volume');
assert(caddyVols.some((v: string) => v.startsWith('caddy_config:')), 'Mounts persistent caddy_config volume');

// Verify dependency
assert(services['caddy'].depends_on?.['velofind-app']?.condition === 'service_healthy', "'caddy' depends on 'velofind-app' reporting healthy");

console.log('\n======================================================');
console.log('🎉 ALL 8 CADDY & TLS SECURITY VERIFICATION SUITES PASSED');
console.log('======================================================\n');
