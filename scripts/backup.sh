#!/usr/bin/env bash
# ==============================================================================
# VeloFind Production PostgreSQL Automated Backup Script (Phase 27)
# ==============================================================================
# Features:
# 1. PostgreSQL Custom Format (-Fc) with maximum zlib compression (-Z 9).
# 2. Automated integrity validation (file existence, non-empty, PGDMP magic header, pg_restore -l).
# 3. Cryptographic SHA-256 companion checksum generation and verification.
# 4. AES-256-CBC (PBKDF2) encrypted storage destination support.
# 5. Configurable local retention policy and automated rotation cleanup.
# 6. Pluggable off-server / remote cloud upload hook integration.
# ==============================================================================
set -euo pipefail

# ------------------------------------------------------------------------------
# 1. ENVIRONMENT CONFIGURATION & DEFAULTS
# ------------------------------------------------------------------------------
BACKUP_DIR="${BACKUP_PATH:-${BACKUP_DIR:-./backups}}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
BACKUP_ENCRYPTION_KEY_PATH="${BACKUP_ENCRYPTION_KEY_PATH:-}"
BACKUP_REMOTE_DESTINATION="${BACKUP_REMOTE_DESTINATION:-}"
BACKUP_OFFSERVER_HOOK="${BACKUP_OFFSERVER_HOOK:-}"

POSTGRES_HOST="${PGHOST:-${POSTGRES_HOST:-postgres}}"
POSTGRES_PORT="${PGPORT:-${POSTGRES_PORT:-5432}}"
POSTGRES_USER="${PGUSER:-${POSTGRES_USER:-velofind}}"
POSTGRES_DB="${PGDATABASE:-${POSTGRES_DB:-velofind_db}}"
COMPRESSION_LEVEL="${COMPRESSION_LEVEL:-9}"

TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_PREFIX="velofind_db"
BACKUP_FILE="${BACKUP_DIR}/${BACKUP_PREFIX}_${TIMESTAMP}.dump"
CHECKSUM_FILE="${BACKUP_FILE}.sha256"

# ------------------------------------------------------------------------------
# 2. LOGGING UTILITY
# ------------------------------------------------------------------------------
log_info()  { echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [INFO]  $*"; }
log_warn()  { echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [WARN]  $*" >&2; }
log_error() { echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [ERROR] $*" >&2; }

log_info "=================================================================="
log_info "VeloFind Production PostgreSQL Backup Engine Starting"
log_info "=================================================================="
log_info "Target Database : ${POSTGRES_DB} on ${POSTGRES_HOST}:${POSTGRES_PORT}"
log_info "Destination Dir : ${BACKUP_DIR}"
log_info "Retention Limit : ${BACKUP_RETENTION_DAYS} days"

# ------------------------------------------------------------------------------
# 3. PRE-FLIGHT DIRECTORY & PERMISSION CHECKS
# ------------------------------------------------------------------------------
mkdir -p "${BACKUP_DIR}"
chmod 700 "${BACKUP_DIR}" || true

if [ -n "${BACKUP_ENCRYPTION_KEY_PATH}" ]; then
  if [ ! -f "${BACKUP_ENCRYPTION_KEY_PATH}" ]; then
    log_error "Specified BACKUP_ENCRYPTION_KEY_PATH '${BACKUP_ENCRYPTION_KEY_PATH}' does not exist!"
    exit 1
  fi
  log_info "Encryption Key  : Configured (${BACKUP_ENCRYPTION_KEY_PATH})"
else
  log_info "Encryption Key  : None specified (plaintext custom-format archive)"
fi

# ------------------------------------------------------------------------------
# 4. EXECUTE PG_DUMP (CUSTOM FORMAT -Fc, MAXIMUM COMPRESSION)
# ------------------------------------------------------------------------------
log_info "Executing pg_dump (format=custom, compression=${COMPRESSION_LEVEL})..."

START_TIME=$(date +%s)

if command -v pg_dump >/dev/null 2>&1; then
  # Direct invocation (Host or inside postgres/backup container)
  PGPASSWORD="${POSTGRES_PASSWORD:-}" pg_dump \
    -h "${POSTGRES_HOST}" \
    -p "${POSTGRES_PORT}" \
    -U "${POSTGRES_USER}" \
    -d "${POSTGRES_DB}" \
    -Fc \
    -Z "${COMPRESSION_LEVEL}" \
    -f "${BACKUP_FILE}"
elif command -v docker >/dev/null 2>&1; then
  # Fallback to docker compose execution if host does not have pg_dump installed
  log_info "pg_dump not found on host; invoking via docker compose exec postgres..."
  docker compose exec -T \
    -e PGPASSWORD="${POSTGRES_PASSWORD:-}" \
    postgres pg_dump \
      -U "${POSTGRES_USER}" \
      -d "${POSTGRES_DB}" \
      -Fc \
      -Z "${COMPRESSION_LEVEL}" > "${BACKUP_FILE}"
else
  log_error "Neither 'pg_dump' nor 'docker' command is available in PATH."
  exit 1
fi

DUMP_DURATION=$(( $(date +%s) - START_TIME ))
log_info "pg_dump completed in ${DUMP_DURATION}s."

# ------------------------------------------------------------------------------
# 5. AUTOMATED BACKUP INTEGRITY & VALIDATION CHECKS
# ------------------------------------------------------------------------------
log_info "Running automated integrity and validation checks..."

# Check 1: File Existence & Non-Zero Size
if [ ! -s "${BACKUP_FILE}" ]; then
  log_error "Integrity check failed: Backup file '${BACKUP_FILE}' is missing or empty!"
  exit 1
fi
BACKUP_SIZE=$(wc -c < "${BACKUP_FILE}" | tr -d ' ')
log_info "Check 1 Passed: File exists with non-zero size (${BACKUP_SIZE} bytes)."

# Check 2: Custom Format Magic Header (PGDMP)
MAGIC_HEADER=$(head -c 5 "${BACKUP_FILE}" || true)
if [ "${MAGIC_HEADER}" != "PGDMP" ]; then
  log_error "Integrity check failed: '${BACKUP_FILE}' missing PostgreSQL PGDMP magic header!"
  exit 1
fi
log_info "Check 2 Passed: Valid PostgreSQL PGDMP custom format header verified."

# Check 3: Archive Table of Contents Verification (pg_restore -l)
if command -v pg_restore >/dev/null 2>&1; then
  if pg_restore -l "${BACKUP_FILE}" >/dev/null 2>&1; then
    log_info "Check 3 Passed: pg_restore TOC verification succeeded (archive is readable)."
  else
    log_error "Integrity check failed: pg_restore TOC catalog listing failed on '${BACKUP_FILE}'!"
    exit 1
  fi
else
  log_info "Check 3 Skipped: 'pg_restore' binary not in PATH on this host."
fi

# ------------------------------------------------------------------------------
# 6. SHA-256 CHECKSUM GENERATION & VERIFICATION
# ------------------------------------------------------------------------------
log_info "Generating cryptographic SHA-256 checksum..."

# Compute checksum (stored relative to base filename for portability)
(cd "${BACKUP_DIR}" && sha256sum "$(basename "${BACKUP_FILE}")" > "$(basename "${CHECKSUM_FILE}")")

# Verify checksum immediately
(cd "${BACKUP_DIR}" && sha256sum -c "$(basename "${CHECKSUM_FILE}")" >/dev/null)
HASH_VALUE=$(awk '{print $1}' "${CHECKSUM_FILE}")
log_info "Checksum Verified: SHA-256 [${HASH_VALUE}]"

# ------------------------------------------------------------------------------
# 7. ENCRYPTION AT REST (OPENSSL AES-256-CBC WITH PBKDF2)
# ------------------------------------------------------------------------------
ENCRYPTED_FILE=""
if [ -n "${BACKUP_ENCRYPTION_KEY_PATH}" ] && [ -f "${BACKUP_ENCRYPTION_KEY_PATH}" ]; then
  ENCRYPTED_FILE="${BACKUP_FILE}.enc"
  ENCRYPTED_CHECKSUM="${ENCRYPTED_FILE}.sha256"
  log_info "Encrypting backup archive with AES-256-CBC (PBKDF2)..."

  openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 \
    -in "${BACKUP_FILE}" \
    -out "${ENCRYPTED_FILE}" \
    -pass "file:${BACKUP_ENCRYPTION_KEY_PATH}"

  # Checksum for encrypted payload
  (cd "${BACKUP_DIR}" && sha256sum "$(basename "${ENCRYPTED_FILE}")" > "$(basename "${ENCRYPTED_CHECKSUM}")")
  (cd "${BACKUP_DIR}" && sha256sum -c "$(basename "${ENCRYPTED_CHECKSUM}")" >/dev/null)

  ENC_HASH=$(awk '{print $1}' "${ENCRYPTED_CHECKSUM}")
  log_info "Encrypted Archive Created: ${ENCRYPTED_FILE} (SHA-256: ${ENC_HASH})"
fi

# ------------------------------------------------------------------------------
# 8. OFF-SERVER UPLOAD HOOK INTEGRATION
# ------------------------------------------------------------------------------
if [ -n "${BACKUP_OFFSERVER_HOOK}" ]; then
  log_info "Executing off-server upload hook: ${BACKUP_OFFSERVER_HOOK}..."
  TARGET_UPLOAD="${ENCRYPTED_FILE:-${BACKUP_FILE}}"
  TARGET_CHECKSUM="${ENCRYPTED_FILE:+$ENCRYPTED_FILE.sha256}"
  TARGET_CHECKSUM="${TARGET_CHECKSUM:-$CHECKSUM_FILE}"
  
  eval "${BACKUP_OFFSERVER_HOOK} \"${TARGET_UPLOAD}\" \"${TARGET_CHECKSUM}\""
  log_info "Off-server upload hook executed successfully."
elif [ -n "${BACKUP_REMOTE_DESTINATION}" ]; then
  log_info "Off-server remote destination configured: ${BACKUP_REMOTE_DESTINATION}"
  TARGET_UPLOAD="${ENCRYPTED_FILE:-${BACKUP_FILE}}"
  TARGET_CHECKSUM="${ENCRYPTED_FILE:+$ENCRYPTED_FILE.sha256}"
  TARGET_CHECKSUM="${TARGET_CHECKSUM:-$CHECKSUM_FILE}"

  if [[ "${BACKUP_REMOTE_DESTINATION}" == s3://* ]]; then
    if command -v aws >/dev/null 2>&1; then
      log_info "Uploading to AWS S3: ${BACKUP_REMOTE_DESTINATION}..."
      aws s3 cp "${TARGET_UPLOAD}" "${BACKUP_REMOTE_DESTINATION}/"
      aws s3 cp "${TARGET_CHECKSUM}" "${BACKUP_REMOTE_DESTINATION}/"
      log_info "S3 upload complete."
    else
      log_warn "'aws' CLI not found; off-server S3 sync skipped."
    fi
  elif [[ "${BACKUP_REMOTE_DESTINATION}" == rclone:* ]]; then
    if command -v rclone >/dev/null 2>&1; then
      log_info "Uploading via rclone: ${BACKUP_REMOTE_DESTINATION}..."
      rclone copy "${TARGET_UPLOAD}" "${BACKUP_REMOTE_DESTINATION}"
      rclone copy "${TARGET_CHECKSUM}" "${BACKUP_REMOTE_DESTINATION}"
      log_info "rclone upload complete."
    else
      log_warn "'rclone' CLI not found; off-server rclone sync skipped."
    fi
  else
    log_info "Off-server upload destination '${BACKUP_REMOTE_DESTINATION}' ready for custom sync."
  fi
else
  log_info "Off-server upload integration: None configured (local storage only)."
fi

# ------------------------------------------------------------------------------
# 9. LOCAL RETENTION CLEANUP (ROTATION)
# ------------------------------------------------------------------------------
log_info "Applying local retention cleanup (retention threshold: ${BACKUP_RETENTION_DAYS} days)..."

# Prune .dump, .dump.enc, and .sha256 older than threshold
PRUNED_COUNT=0
while IFS= read -r old_file; do
  if [ -n "${old_file}" ]; then
    log_info "Pruning expired backup artifact: ${old_file}"
    rm -f "${old_file}"
    PRUNED_COUNT=$((PRUNED_COUNT + 1))
  fi
done < <(find "${BACKUP_DIR}" \( -name "${BACKUP_PREFIX}_*.dump*" -o -name "${BACKUP_PREFIX}_*.sha256" \) -type f -mtime +"${BACKUP_RETENTION_DAYS}" 2>/dev/null || true)

log_info "Retention cleanup completed. ${PRUNED_COUNT} expired files pruned."

# ------------------------------------------------------------------------------
# 10. BACKUP SUMMARY
# ------------------------------------------------------------------------------
log_info "=================================================================="
log_info "🎉 VeloFind Production Backup Completed Successfully"
log_info "=================================================================="
log_info "Snapshot File   : ${BACKUP_FILE}"
log_info "Snapshot Size   : ${BACKUP_SIZE} bytes"
log_info "SHA-256 Hash    : ${HASH_VALUE}"
log_info "Encrypted       : $([ -n "${ENCRYPTED_FILE}" ] && echo "YES (${ENCRYPTED_FILE})" || echo "NO")"
log_info "Local Retention : Kept last ${BACKUP_RETENTION_DAYS} days"
log_info "=================================================================="

exit 0
