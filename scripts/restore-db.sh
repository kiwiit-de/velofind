#!/usr/bin/env bash
# ==============================================================================
# VeloFind Production PostgreSQL Restore Script
# Restores a pg_dump custom archive into the production database.
# Usage: ./scripts/restore-db.sh /backups/velofind_db_YYYYMMDD_HHMMSS.dump
# ==============================================================================
set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <backup_filename_or_path>"
  echo "Example: $0 velofind_db_20260911_120000.dump"
  exit 1
fi

DUMP_TARGET="$1"
COMPOSE_FILE="${COMPOSE_FILE:-compose.production.yml}"
ENV_FILE="${ENV_FILE:-.env.production}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: Production environment file '$ENV_FILE' not found."
  exit 1
fi

# Load database credentials from env file
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

echo "WARNING: Restoring will overwrite existing data in database '${POSTGRES_DB}'."
read -p "Are you sure you want to proceed? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Restore aborted by operator."
  exit 0
fi

echo "==> Restoring database from: $DUMP_TARGET..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T postgres \
  pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists "$DUMP_TARGET"

echo "==> Database restore completed successfully."
