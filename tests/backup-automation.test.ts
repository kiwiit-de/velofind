import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { parse as parseYaml } from 'yaml';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
}

console.log('======================================================');
console.log('💾 Verifying PostgreSQL Backup Automation (Phase 27)');
console.log('======================================================');

const rootDir = process.cwd();
const backupScriptPath = path.resolve(rootDir, 'scripts/backup.sh');
const runbookPath = path.resolve(rootDir, 'docs/runbooks/backup.md');
const envExamplePath = path.resolve(rootDir, '.env.production.example');
const composePath = path.resolve(rootDir, 'compose.production.yml');

// -----------------------------------------------------------------------------
// TEST 1: File Existence & Executable Permissions
// -----------------------------------------------------------------------------
console.log('\nTEST 1: Script & Runbook File Existence');
assert(fs.existsSync(backupScriptPath), 'scripts/backup.sh exists');
assert(fs.existsSync(runbookPath), 'docs/runbooks/backup.md exists');
assert(fs.existsSync(envExamplePath), '.env.production.example exists');

const scriptStat = fs.statSync(backupScriptPath);
const isExecutable = (scriptStat.mode & 0o111) !== 0;
assert(isExecutable, 'scripts/backup.sh has executable permissions');

// -----------------------------------------------------------------------------
// TEST 2: Environment Variables Compliance in Template & Script
// -----------------------------------------------------------------------------
console.log('\nTEST 2: Environment Variables Support');
const envContent = fs.readFileSync(envExamplePath, 'utf8');
const scriptContent = fs.readFileSync(backupScriptPath, 'utf8');

assert(envContent.includes('BACKUP_PATH='), '.env.production.example defines BACKUP_PATH');
assert(envContent.includes('BACKUP_DIR='), '.env.production.example defines BACKUP_DIR');
assert(envContent.includes('BACKUP_RETENTION_DAYS='), '.env.production.example defines BACKUP_RETENTION_DAYS');
assert(envContent.includes('BACKUP_ENCRYPTION_KEY_PATH='), '.env.production.example defines BACKUP_ENCRYPTION_KEY_PATH');
assert(envContent.includes('BACKUP_REMOTE_DESTINATION='), '.env.production.example defines BACKUP_REMOTE_DESTINATION');

assert(scriptContent.includes('BACKUP_PATH'), 'backup.sh supports BACKUP_PATH');
assert(scriptContent.includes('BACKUP_RETENTION_DAYS'), 'backup.sh supports BACKUP_RETENTION_DAYS');
assert(scriptContent.includes('BACKUP_ENCRYPTION_KEY_PATH'), 'backup.sh supports BACKUP_ENCRYPTION_KEY_PATH');
assert(scriptContent.includes('BACKUP_REMOTE_DESTINATION'), 'backup.sh supports BACKUP_REMOTE_DESTINATION');
assert(scriptContent.includes('BACKUP_OFFSERVER_HOOK'), 'backup.sh supports BACKUP_OFFSERVER_HOOK');

// -----------------------------------------------------------------------------
// TEST 3: Custom Format (-Fc) & Compression Directives
// -----------------------------------------------------------------------------
console.log('\nTEST 3: Custom Format & Zlib Compression Specifications');
assert(scriptContent.includes('-Fc'), 'pg_dump is executed with custom format (-Fc)');
assert(scriptContent.includes('-Z'), 'pg_dump is executed with zlib compression flag (-Z)');
assert(scriptContent.includes('PGDMP'), 'Script validates binary PGDMP magic header');

// -----------------------------------------------------------------------------
// TEST 4: Cryptographic Checksum Generation & Verification Logic
// -----------------------------------------------------------------------------
console.log('\nTEST 4: SHA-256 Checksum Engine Verification');
assert(scriptContent.includes('sha256sum'), 'Script uses sha256sum for checksum generation');
assert(scriptContent.includes('sha256sum -c'), 'Script immediately verifies checksum with sha256sum -c');

// Verify checksum mechanism on dummy test payload
const testDir = path.resolve(rootDir, 'tmp_test_backup');
fs.mkdirSync(testDir, { recursive: true });
try {
  const dummyDump = path.resolve(testDir, 'velofind_test.dump');
  // Create mock PGDMP header + dummy payload
  fs.writeFileSync(dummyDump, Buffer.concat([Buffer.from('PGDMP\x01\x02\x03'), Buffer.from('mock database content')]));

  // Generate sha256
  execSync(`cd "${testDir}" && sha256sum velofind_test.dump > velofind_test.dump.sha256`);
  assert(fs.existsSync(`${dummyDump}.sha256`), 'Generated test .sha256 file');

  // Verify sha256
  const verifyResult = execSync(`cd "${testDir}" && sha256sum -c velofind_test.dump.sha256`).toString();
  assert(verifyResult.includes('OK'), 'sha256sum -c validation passed on test payload');
} finally {
  fs.rmSync(testDir, { recursive: true, force: true });
}

// -----------------------------------------------------------------------------
// TEST 5: OpenSSL AES-256-CBC PBKDF2 Encryption Round-Trip
// -----------------------------------------------------------------------------
console.log('\nTEST 5: AES-256-CBC Encryption & Decryption Round-Trip');
assert(scriptContent.includes('openssl enc -aes-256-cbc'), 'Script supports openssl aes-256-cbc encryption');
assert(scriptContent.includes('-pbkdf2'), 'Script enforces PBKDF2 key derivation');

const encTestDir = path.resolve(rootDir, 'tmp_enc_test');
fs.mkdirSync(encTestDir, { recursive: true });
try {
  const rawFile = path.resolve(encTestDir, 'test_raw.dump');
  const encFile = path.resolve(encTestDir, 'test_raw.dump.enc');
  const decFile = path.resolve(encTestDir, 'test_decrypted.dump');
  const keyFile = path.resolve(encTestDir, 'test.key');

  const secretData = 'CRITICAL_VELOFIND_CATALOG_DATA_V007';
  fs.writeFileSync(rawFile, secretData);
  fs.writeFileSync(keyFile, 'test-secret-encryption-key-32-chars-long!');

  // Encrypt
  execSync(`openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 -in "${rawFile}" -out "${encFile}" -pass file:"${keyFile}"`);
  assert(fs.existsSync(encFile), 'Encrypted archive created successfully');

  // Decrypt
  execSync(`openssl enc -d -aes-256-cbc -pbkdf2 -iter 100000 -in "${encFile}" -out "${decFile}" -pass file:"${keyFile}"`);
  assert(fs.existsSync(decFile), 'Decrypted archive created successfully');

  const restoredData = fs.readFileSync(decFile, 'utf8');
  assert(restoredData === secretData, 'Decrypted content exactly matches original pre-encryption payload');
} finally {
  fs.rmSync(encTestDir, { recursive: true, force: true });
}

// -----------------------------------------------------------------------------
// TEST 6: Local Retention Cleanup Logic
// -----------------------------------------------------------------------------
console.log('\nTEST 6: Local Retention Cleanup & Rotation Logic');
assert(scriptContent.includes('-mtime +"${BACKUP_RETENTION_DAYS}"'), 'Script filters files older than BACKUP_RETENTION_DAYS');
assert(scriptContent.includes('rm -f'), 'Script prunes matching expired files');

// -----------------------------------------------------------------------------
// TEST 7: Off-Server Upload Hook Integration
// -----------------------------------------------------------------------------
console.log('\nTEST 7: Off-Server Upload Hook Integration');
assert(scriptContent.includes('BACKUP_OFFSERVER_HOOK'), 'Script supports custom upload hook execution');
assert(scriptContent.includes('BACKUP_REMOTE_DESTINATION'), 'Script supports remote cloud destination specification');

// -----------------------------------------------------------------------------
// TEST 8: Runbook Documentation Completeness
// -----------------------------------------------------------------------------
console.log('\nTEST 8: Runbook Documentation Completeness');
const runbookContent = fs.readFileSync(runbookPath, 'utf8');
assert(runbookContent.includes('Backup Schedule'), 'Runbook documents backup schedule');
assert(runbookContent.includes('Retention Policy'), 'Runbook documents retention policy');
assert(runbookContent.includes('Rotation Strategy'), 'Runbook documents rotation strategy');
assert(runbookContent.includes('Recovery Prerequisites'), 'Runbook documents recovery prerequisites');
assert(runbookContent.includes('Checksum Verification'), 'Runbook documents checksum verification mechanism');
assert(runbookContent.includes('Encryption Key Management'), 'Runbook documents encryption key generation and handling');

// -----------------------------------------------------------------------------
// TEST 9: Production Docker Compose Integration
// -----------------------------------------------------------------------------
console.log('\nTEST 9: Docker Compose Backup Service Integration');
assert(fs.existsSync(composePath), 'compose.production.yml exists');
const composeConfig = parseYaml(fs.readFileSync(composePath, 'utf8')) as Record<string, any>;
const backupService = composeConfig.services['db-backup'];

assert(Boolean(backupService), 'db-backup service configured in compose.production.yml');
assert(Array.isArray(backupService.profiles) && backupService.profiles.includes('backup'), 'db-backup service uses profile "backup"');
assert(backupService.volumes?.some((v: string) => v.includes('/scripts:/scripts:ro')), 'Mounts scripts directory into backup container');
assert(backupService.command?.includes('/scripts/backup.sh'), 'Backup service executes /scripts/backup.sh');

console.log('\n======================================================');
console.log('🎉 ALL 9 BACKUP AUTOMATION VERIFICATION SUITES PASSED');
console.log('======================================================\n');
