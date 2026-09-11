# Operational Runbook: Production PostgreSQL Backup Automation (Phase 27)

## 1. Overview & Architecture

This runbook outlines the operational procedures, scheduling policies, retention lifecycles, and verification mechanisms for VeloFind's production PostgreSQL 17 + PostGIS database backups (`velofind_db`).

The backup pipeline is implemented in `scripts/backup.sh` and backed by Docker Compose infrastructure (`compose.production.yml`).

---

## 2. Backup Characteristics & Technology Choices

| Attribute | Specification | Operational Justification |
|---|---|---|
| **Dump Utility** | `pg_dump` (PostgreSQL 17 compatible) | Native atomic snapshot utility locking table schemas without blocking readers. |
| **Archive Format** | Custom Format (`-Fc`) | Includes catalog table of contents, compressed table blocks, blobs, and geometry definitions; enables parallel multi-worker restore (`pg_restore -j`), single-table extraction, and index re-ordering. |
| **Compression** | Zlib Maximum Level (`-Z 9`) | Compacts raw spatial coordinates and JSONB catalog data, achieving 70-85% size reduction. |
| **Integrity Verification** | 3-Phase Automated Check | 1. Non-empty file size verification.<br>2. Binary `PGDMP` magic byte header validation.<br>3. `pg_restore -l` catalog table of contents parse test. |
| **Companion Checksum** | SHA-256 (`.sha256`) | Detects bit rot, silent storage corruption, and transfer truncations. Verified immediately upon generation (`sha256sum -c`). |
| **Encryption at Rest** | OpenSSL AES-256-CBC (PBKDF2, 100k iter) | Optional military-grade envelope encryption for backups stored in untrusted cloud buckets or external disks. |
| **Local Retention** | Configurable rolling window (`BACKUP_RETENTION_DAYS`) | Automatically prunes expired dumps and checksums without human intervention. |
| **Off-Server Upload** | Pluggable hook (`BACKUP_REMOTE_DESTINATION`, `BACKUP_OFFSERVER_HOOK`) | Seamless sync to S3, MinIO, rclone, or remote SSH destinations. |

---

## 3. Environment Variables

| Variable | Default Value | Description |
|---|---|---|
| `BACKUP_PATH` (or `BACKUP_DIR`) | `/backups` (or `./backups`) | Target directory where dumps, checksums, and encrypted files are stored. |
| `BACKUP_RETENTION_DAYS` | `14` | Local retention window in days before automated pruning. |
| `BACKUP_ENCRYPTION_KEY_PATH` | *Optional* (e.g. `/etc/velofind/backup.key`) | Path to 256-bit symmetric encryption passphrase/key file for AES-256-CBC encryption. |
| `BACKUP_REMOTE_DESTINATION` | *Optional* (e.g. `s3://velofind-backups/prod`) | Off-server cloud target (S3 bucket, rclone remote, or SSH path). |
| `BACKUP_OFFSERVER_HOOK` | *Optional* | Shell command or executable receiving `$TARGET_ARCHIVE` and `$TARGET_CHECKSUM` arguments. |
| `POSTGRES_HOST` / `PGHOST` | `postgres` | Hostname of PostgreSQL service container on internal Docker network. |
| `POSTGRES_PORT` / `PGPORT` | `5432` | Port for PostgreSQL service. |
| `POSTGRES_USER` / `PGUSER` | `velofind` | Database superuser/application user. |
| `POSTGRES_DB` / `PGDATABASE` | `velofind_db` | Production catalog database. |
| `POSTGRES_PASSWORD` | *Secret* | PostgreSQL credentials for pg_dump. |
| `COMPRESSION_LEVEL` | `9` | Zlib compression level (0-9). |

---

## 4. Backup Schedule & Automation

### Automated Production Cron Schedule

Backups run daily during the lowest traffic maintenance window (02:30 Europe/Berlin time) to minimize I/O impact on search and lead routing.

```cron
# /etc/cron.d/velofind-backup
# Execute daily at 02:30 AM UTC
30 2 * * * root cd /opt/velofind && /opt/velofind/scripts/backup.sh >> /var/log/velofind-backup.log 2>&1
```

### Docker Compose Scheduled Runner

Alternatively, when running exclusively via Docker Compose:

```bash
# Trigger an immediate on-demand backup
npm run compose:prod:backup

# Or directly via docker compose:
docker compose --env-file .env.production -f compose.production.yml --profile backup run --rm db-backup
```

---

## 5. Retention Policy & Rotation Strategy

VeloFind employs a **Grandfather-Father-Son (GFS)** multi-tier retention architecture:

```
[ DAILY BACKUPS ]  ──► Kept locally for 14 days (pruned by scripts/backup.sh)
        │
        ├── Weekly Snapshot (Every Sunday) ──► Kept in cold cloud storage for 8 weeks
        │
        └── Monthly Snapshot (1st of month) ──► Kept in immutable archive for 12 months
```

### Local Storage Rotation
- During each backup invocation, `scripts/backup.sh` scans `BACKUP_DIR` for files matching `velofind_db_*.dump*` and companion `.sha256` files.
- Files with modification times strictly older than `BACKUP_RETENTION_DAYS` are deleted automatically.

---

## 6. Checksum Verification Mechanism

Every backup generates an RFC 4634 SHA-256 companion checksum file:
```
# Format of velofind_db_YYYYMMDD_HHMMSS.dump.sha256
7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069  velofind_db_YYYYMMDD_HHMMSS.dump
```

To manually verify the integrity of any backup archive:

```bash
cd /path/to/backups
sha256sum -c velofind_db_20260911_023000.dump.sha256
# Expected output: velofind_db_20260911_023000.dump: OK
```

If checksum verification fails:
1. **DO NOT ATTEMPT RESTORE**: The archive is corrupted or truncated.
2. Alert on-call engineering.
3. Fall back to the previous day's verified backup snapshot.

---

## 7. Encryption Key Management & Encryption Procedure

### Generating a Production Backup Key

Generate a cryptographically secure 256-bit key:

```bash
# Store with strict root-only read permissions
mkdir -p /etc/velofind
openssl rand -base64 32 > /etc/velofind/backup.key
chmod 400 /etc/velofind/backup.key
chown root:root /etc/velofind/backup.key
```

### Automated Encryption Flow
When `BACKUP_ENCRYPTION_KEY_PATH=/etc/velofind/backup.key` is set:
1. The custom format `.dump` file is created and verified.
2. OpenSSL encrypts the archive using AES-256-CBC with PBKDF2 key derivation and 100,000 iterations:
   ```bash
   openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 \
     -in "velofind_db.dump" \
     -out "velofind_db.dump.enc" \
     -pass file:/etc/velofind/backup.key
   ```
3. A companion checksum `velofind_db.dump.enc.sha256` is generated.

### Manual Decryption for Recovery
To decrypt an encrypted archive prior to restoration:

```bash
openssl enc -d -aes-256-cbc -pbkdf2 -iter 100000 \
  -in "velofind_db_20260911_023000.dump.enc" \
  -out "velofind_db_20260911_023000.dump" \
  -pass file:/etc/velofind/backup.key
```

---

## 8. Off-Server Upload Integration

To ensure disaster survivability against hardware or data-center loss, backups support off-server upload.

### Configuration Options
1. **AWS S3 / Cloudflare R2**:
   ```env
   BACKUP_REMOTE_DESTINATION=s3://velofind-backups-eu-central-1/production
   ```
2. **rclone Multi-Cloud Remote**:
   ```env
   BACKUP_REMOTE_DESTINATION=rclone:b2-backup:velofind-prod
   ```
3. **Custom Script Hook**:
   ```env
   BACKUP_OFFSERVER_HOOK="/usr/local/bin/sync-offsite.sh"
   ```

The offsite hook receives two arguments: `$ARCHIVE_PATH` and `$CHECKSUM_PATH`.

---

## 9. Recovery Prerequisites (For Phase 28)

Before executing a database restore drill or disaster recovery operation:
1. **Target PostgreSQL Instance**: Running PostgreSQL 17 with the `postgis` extension available (`CREATE EXTENSION IF NOT EXISTS postgis;`).
2. **Privileges**: Target role must possess `CREATEDB` and superuser/table creation rights.
3. **Storage**: At least 3x the size of the uncompressed dump file free on `/var/lib/postgresql/data`.
4. **Validated Backup Archive**: SHA-256 checksum verified (`sha256sum -c`).
5. **Decryption Key**: If the file is `.dump.enc`, the decryption key must be available to restore the raw `.dump` file.
6. **No Active Migrations**: Application traffic must be halted or redirected to maintenance mode during full restores.
