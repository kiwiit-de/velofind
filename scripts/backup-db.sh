#!/usr/bin/env bash
# ==============================================================================
# VeloFind Production PostgreSQL Backup Script
# Creates a compressed custom-format pg_dump archive inside the backup volume.
# ==============================================================================
set -euo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-compose.production.yml}"
ENV_FILE="${ENV_FILE:-.env.production}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: Production environment file '$ENV_FILE' not found."
  exit 1
fi

echo "==> Triggering VeloFind production database backup via Docker Compose..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" --profile backup run --rm db-backup

echo "==> Backup execution finished successfully."
