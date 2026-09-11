# Operational Runbook: Disaster Recovery & Restore Verification (Phase 28)

## 1. Overview & Objectives

This runbook documents the disaster recovery (DR) protocols, automated restore drill procedures, and rollback workflows for VeloFind's PostgreSQL 17 + PostGIS catalog database (`velofind_db`).

Restorations are executed via `scripts/restore.sh`, which accepts plaintext custom-format archives (`.dump`) as well as AES-256-CBC encrypted backups (`.dump.enc`).

---

## 2. Disaster Recovery Workflow

```
                        [ DISASTER EVENT DETECTED ]
                      (Data corruption, disk loss, etc.)
                                    │
                                    ▼
                      [ Declare Recovery Incident ]
                   - Route traffic to maintenance page
                   - Stop ingestion pipelines & workers
                                    │
                                    ▼
                      [ Locate & Select Backup ]
                   - Fetch latest verified snapshot from
                     local /backups or S3/remote storage
                                    │
                                    ▼
                      [ Run Automated Restore Script ]
                 ./scripts/restore.sh <backup_file> [target_db]
                                    │
          ┌─────────────────────────┴─────────────────────────┐
          ▼                                                   ▼
   [ Pre-Flight Validation ]                           [ Envelope Decryption ]
   - Verify SHA-256 checksum                          - If file ends in .enc:
   - Check binary PGDMP header                          OpenSSL AES-256-CBC with
   - Inspect archive TOC (pg_restore -l)                PBKDF2 key derivation
          │                                                   │
          └─────────────────────────┬─────────────────────────┘
                                    │
                                    ▼
                      [ Clean Database Provisioning ]
                   - Terminate lingering client pids
                   - DROP DATABASE IF EXISTS <target_db>
                   - CREATE DATABASE <target_db>
                   - Initialize PostGIS & uuid-ossp
                                    │
                                    ▼
                         [ Execute pg_restore ]
                   - pg_restore -Fc -d <target_db>
                                    │
                                    ▼
                      [ Post-Restore Verification ]
                   - Flyway schema history integrity
                   - Entity row count audit
                   - Critical query smoke test
                                    │
                                    ▼
                      [ Reconnect Application Stack ]
                   - Restart velofind-app container
                   - Validate /api/health probe
                   - Re-enable public ingress
```

---

## 3. Expected Inputs & Parameters

The restore engine can be driven via positional command-line arguments or environment variables:

### Command-Line Arguments
```bash
./scripts/restore.sh <path_to_backup_archive> [target_database_name]
```

### Environment Variables

| Variable | Default Value | Description |
|---|---|---|
| `RESTORE_FILE` / `BACKUP_FILE` | *None* | Path to the `.dump` or `.dump.enc` archive file. |
| `TARGET_DB` / `POSTGRES_DB` | `velofind_db` | Destination database to be wiped and restored. |
| `POSTGRES_HOST` / `PGHOST` | `postgres` | Target PostgreSQL host. |
| `POSTGRES_PORT` / `PGPORT` | `5432` | Target PostgreSQL port. |
| `POSTGRES_USER` / `PGUSER` | `velofind` | Target PostgreSQL user. |
| `POSTGRES_PASSWORD` | *Secret* | PostgreSQL authentication credentials. |
| `BACKUP_ENCRYPTION_KEY_PATH` | *None* | Path to 256-bit passphrase/key file for `.dump.enc` archives. |
| `SKIP_CONFIRM` | `0` | Set to `1` or `true` for headless CI/CD drills and automated pipelines. |
| `CLEAN_DATABASE` | `1` | Set to `1` (default) to drop and recreate clean target database. |
| `DRY_RUN` | `0` | Set to `1` to validate checksum, decrypt, and parse TOC without modifying the database. |

---

## 4. Step-by-Step Restoration Procedures

### Scenario A: Full Disaster Recovery into Production Database

1. **Stop Application Ingress**:
   ```bash
   docker compose -f compose.production.yml stop velofind-app
   ```

2. **Execute Restoration**:
   ```bash
   # For plaintext backup:
   ./scripts/restore.sh /backups/velofind_db_20260911_023000.dump velofind_db

   # For encrypted backup:
   BACKUP_ENCRYPTION_KEY_PATH=/etc/velofind/backup.key \
     ./scripts/restore.sh /backups/velofind_db_20260911_023000.dump.enc velofind_db
   ```

3. **Restart Application Container**:
   ```bash
   docker compose -f compose.production.yml start velofind-app
   ```

4. **Verify Endpoint Health**:
   ```bash
   curl -f http://localhost:3000/api/health
   ```

---

### Scenario B: Non-Destructive Restore Drill into Ephemeral Database

To verify a backup snapshot without disrupting live production traffic:

```bash
SKIP_CONFIRM=1 ./scripts/restore.sh /backups/velofind_db_latest.dump velofind_restore_drill
```

After validating metrics, drop the drill database:
```bash
docker compose exec postgres psql -U velofind -c "DROP DATABASE velofind_restore_drill;"
```

---

## 5. Post-Restore Validation Process

The restoration script executes automated post-restore sanity checks:

### 1. Flyway Migration History
Verifies that all migration scripts applied cleanly:
```sql
SELECT installed_rank, version, description, success, installed_on
FROM flyway_schema_history
ORDER BY installed_rank DESC;
```
- Ensures `success = true` for every record.
- Confirms latest installed migration matches code repo (`V007`).

### 2. Entity Count Audit
Compares restored counts against expected operational baselines:
```sql
SELECT 
  (SELECT count(*) FROM brands) as brands_count,
  (SELECT count(*) FROM bike_models) as models_count,
  (SELECT count(*) FROM bike_variants) as variants_count,
  (SELECT count(*) FROM dealers) as dealers_count,
  (SELECT count(*) FROM dealer_locations) as locations_count,
  (SELECT count(*) FROM offers) as offers_count,
  (SELECT count(*) FROM leasing_providers) as providers_count;
```

### 3. Application Smoke Tests
1. **Active Offer Catalog Join**:
   ```sql
   SELECT count(*)
   FROM offers o
   JOIN bike_variants bv ON o.variant_id = bv.id
   JOIN bike_models bm ON bv.model_id = bm.id
   JOIN brands b ON bm.brand_id = b.id
   JOIN dealers d ON o.dealer_id = d.id
   WHERE o.is_active = true;
   ```
2. **PostGIS Spatial Distance**:
   ```sql
   SELECT d.name, dl.city,
          ROUND(ST_Distance(dl.coordinates, ST_SetSRID(ST_MakePoint(11.5820, 48.1351), 4326)::geography)::numeric / 1000, 1) AS dist_km
   FROM dealer_locations dl
   JOIN dealers d ON dl.dealer_id = d.id
   LIMIT 1;
   ```

---

## 6. Rollback Process

If a restoration fails midway or data anomalies are detected after completion:

```
                  [ RESTORATION FAILED OR INVALID ]
                                  │
                                  ▼
                     [ 1. Isolate Database ]
                   - Terminate client connections
                                  │
                                  ▼
                [ 2. Identify Fallback Snapshot ]
                   - Select previous day's verified backup
                     (e.g., T-1 or T-2 daily dump)
                                  │
                                  ▼
                [ 3. Re-run Restore with Fallback ]
                   ./scripts/restore.sh /backups/velofind_db_T-1.dump
                                  │
                                  ▼
                [ 4. Verify Fallback Integrity ]
                   - Pass Flyway and Smoke tests
                                  │
                                  ▼
                [ 5. Resume Application Traffic ]
```

1. **Safety Snapshot**: Before any recovery is attempted on an existing damaged database, always capture an ad-hoc pre-restore snapshot:
   ```bash
   pg_dump -Fc -f "/backups/pre_restore_snapshot_$(date +%Y%m%d_%H%M%S).dump" velofind_db || true
   ```
2. **Fallback Execution**: If the chosen backup archive is corrupted or fails verification, revert immediately to the previous daily snapshot (`velofind_db_<PREVIOUS_DATE>.dump`).
3. **Database Drop & Resync**: If the target database is in an inconsistent state, invoke:
   ```bash
   CLEAN_DATABASE=1 SKIP_CONFIRM=1 ./scripts/restore.sh /backups/velofind_db_fallback.dump velofind_db
   ```
4. **Log Retention**: Save `/tmp/velofind_restore_*` logs and terminal output to `/var/log/velofind-restore-incident.log` for post-mortem review.
