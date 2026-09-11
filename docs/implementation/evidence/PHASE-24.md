# Phase 24 Evidence: Production-Grade Docker Deployment Stack

## 1. Overview & Objectives

Phase 24 establishes a production-grade multi-service Docker Compose deployment configuration (`compose.production.yml`) and production environment template (`.env.production.example`) for `velofind.de`.

Key architecture & security standards enforced:
1. **Network Segregation**: Two distinct Docker bridge networks:
   - `public_net`: Connects public-facing ingress / reverse proxy and application.
   - `internal_net`: Internal bridge network with `internal: true`. Dropped external routing ensures database and migration services cannot be reached or compromise outbound traffic directly.
2. **PostgreSQL Security Invariant**: The PostgreSQL container **does NOT expose public or host ports**; access is restricted strictly to containers on `internal_net`.
3. **Unprivileged Non-Root Application**: The application container executes under user `node` (UID 1000, GID 1000) with `security_opt: ["no-new-privileges:true"]`.
4. **Deterministic Migration Startup Order**: Application startup strictly depends on `flyway` with condition `service_completed_successfully`. If any migration fails, Flyway exits non-zero and application container startup is halted.
5. **Production Resiliency**: Configured `restart: unless-stopped` on long-running services, health checks (`pg_isready` and `/api/health`), resource limits/reservations (CPU and memory), persistent volumes (`postgres_data`, `postgres_backups`), and automated JSON log file rotation (`10m`, 5 files max).

---

## 2. Files Created

| File Path | Description |
|---|---|
| `compose.production.yml` | Multi-service production compose stack (`velofind-app`, `postgres`, `flyway`, `db-backup`). |
| `.env.production.example` | Production environment template with instructions, secure credential placeholders, pool limits, and Flyway settings. |
| `scripts/backup-db.sh` | Shell script to trigger pg_dump custom format archives via Docker Compose `--profile backup`. |
| `scripts/restore-db.sh` | Shell script to restore pg_dump custom format archives with confirmation guards. |
| `tests/compose-production.test.ts` | Automated verification suite validating YAML syntax, security invariants, network segregation, and lifecycles. |
| `docs/implementation/evidence/PHASE-24.md` | Comprehensive Phase 24 evidence document. |

---

## 3. Files Modified

| File Path | Description of Changes |
|---|---|
| `Dockerfile` | Hardened runner stage: added `USER node`, unprivileged `chown` permissions, `npm cache clean --force`, and Docker `HEALTHCHECK`. |
| `.gitignore` | Whitelisted `!.env.production.example` so the production template is tracked. |
| `package.json` | Added `compose:prod`, `compose:prod:down`, `compose:prod:logs`, `compose:prod:backup`, `test:compose` scripts. |
| `docs/implementation/IMPLEMENTATION_QUEUE_V2.md` | Updated Phase 24 status from `PENDING` to `COMPLETE`. |

---

## 4. Production Architecture Diagram

```
                              [ INTERNET / CLIENTS ]
                                        │
                                        │ (HTTPS: 443 / HTTP: 80)
                                        ▼
                     ┌────────────────────────────────────┐
                     │     Reverse Proxy (Caddy - Ph 25)  │
                     └──────────────────┬─────────────────┘
                                        │
                                        │ [ public_net: bridge ]
                                        ▼
                     ┌────────────────────────────────────┐
                     │   velofind-app (Express 4 + Vite)  │
                     │   - User: node (UID 1000, non-root)│
                     │   - Port: 3000 (127.0.0.1 bound)   │
                     │   - Limits: 2 CPU, 1024MB RAM      │
                     └──────────────────┬─────────────────┘
                                        │
                                        │ [ internal_net: bridge (internal: true) ]
                                        │ (NO public port exposure)
                    ┌───────────────────┴───────────────────┐
                    ▼                                       ▼
     ┌─────────────────────────────┐        ┌─────────────────────────────┐
     │  postgres (PostGIS 17-3.5)  │◄───────│  flyway (Flyway 10-alpine)  │
     │  - Port: 5432 (internal)    │        │  - Condition: completes 1st │
     │  - Volume: postgres_data    │        │  - Mount: migrations/:ro    │
     │  - Limits: 2 CPU, 2048MB    │        │  - Restart: "no"            │
     └──────────────┬──────────────┘        └─────────────────────────────┘
                    │
                    ▼
     ┌─────────────────────────────┐
     │  db-backup (Profile: backup)│
     │  - Volume: postgres_backups │
     │  - Automated pg_dump -Fc    │
     └─────────────────────────────┘
```

---

## 5. Container Topology

| Service | Image | User | Ports Exposed | Networks | Restart Policy | Healthcheck |
|---|---|---|---|---|---|---|
| `velofind-app` | `velofind-app:production` (local build) | `node` (1000) | `127.0.0.1:3000:3000` | `public_net`, `internal_net` | `unless-stopped` | Node fetch on `http://127.0.0.1:3000/api/health` |
| `postgres` | `postgis/postgis:17-3.5-alpine` | `postgres` | **NONE** (0 public ports) | `internal_net` | `unless-stopped` | `pg_isready -U velofind -d velofind_db` |
| `flyway` | `flyway/flyway:10-alpine` | `flyway` | **NONE** | `internal_net` | `no` | N/A (One-shot task) |
| `db-backup` | `postgis/postgis:17-3.5-alpine` | `postgres` | **NONE** | `internal_net` | `no` (profile: `backup`) | N/A (On-demand task) |

---

## 6. Environment Variables Required

Configured in `.env.production.example`:

| Variable | Description | Example / Default |
|---|---|---|
| `NODE_ENV` | Application runtime environment | `production` |
| `PORT` | Container HTTP listen port | `3000` |
| `APP_URL` | Canonical public host URL | `https://velofind.de` |
| `CANONICAL_HOST` | Domain host header | `velofind.de` |
| `POSTGRES_DB` | PostgreSQL production database name | `velofind_db` |
| `POSTGRES_USER` | PostgreSQL production database user | `velofind` |
| `POSTGRES_PASSWORD` | Cryptographically generated strong password | *(Random 32+ char token)* |
| `DATABASE_URL` | Kysely connection pool URI | `postgresql://velofind:...@postgres:5432/velofind_db` |
| `POSTGRES_MAX_CONNECTIONS` | Pool connection ceiling | `20` |
| `FLYWAY_CONNECT_RETRIES` | Max retries waiting for PostgreSQL startup | `60` |
| `BACKUP_RETENTION_DAYS` | Days before pruning old `.dump` files | `14` |

---

## 7. Health-Check Design

### Database (`postgres`)
- Tool: `pg_isready` binary provided by PostgreSQL Alpine.
- Command: `pg_isready -U ${POSTGRES_USER:-velofind} -d ${POSTGRES_DB:-velofind_db}`
- Frequency: Interval `5s`, Timeout `5s`, Retries `5`, Start Period `10s`.
- Behavior: Reports unhealthy until PostgreSQL has completed recovery and accepts connections.

### Application (`velofind-app`)
- Tool: Native Node 20 `fetch` execution (requires zero external curl/wget package dependencies).
- Command: `node -e "fetch('http://127.0.0.1:3000/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"`
- Frequency: Interval `15s`, Timeout `5s`, Retries `3`, Start Period `15s`.
- Behavior: Verifies HTTP 200 and internal pool status.

---

## 8. Migration Execution Flow

1. Operator executes `docker compose --env-file .env.production -f compose.production.yml up -d`.
2. Docker Compose starts `postgres` on `internal_net`.
3. PostgreSQL executes initialization scripts, mounts `postgres_data`, and starts serving.
4. Docker Compose monitors `postgres` healthcheck via `pg_isready`.
5. Once `postgres` reports healthy, `flyway` container starts on `internal_net`:
   - Mounts `./database/migrations` into `/flyway/sql:ro`.
   - Runs `flyway migrate` against `jdbc:postgresql://postgres:5432/velofind_db`.
   - Applies migrations `V001` through `V007`.
6. **Failure Branch**: If any migration fails, `flyway` exits with non-zero exit code. `velofind-app` requires `service_completed_successfully`, so deployment halts immediately without exposing unmigrated schema.
7. **Success Branch**: `flyway` exits with status `0`. Docker Compose then boots `velofind-app`.
8. `velofind-app` initializes its Kysely connection pool, verifies PostGIS extensions, and begins serving traffic on port 3000.

---

## 9. Commands Executed & Validation Results

### Test Execution:
```bash
npm test
```

### Output:
```
======================================================
🐘 Testing PostgreSQL 17 & PostGIS Connection Layer
======================================================
  ✓ Pool initialized
  ✓ Default pool maximum connections is 20
  ✓ Idle timeout is 30,000 ms
  ✓ Connection timeout is 3,000 ms
  ✓ Returns structured connected boolean flag
  ✓ Measures connection check latency in ms
  ✓ Error message reported gracefully without process crash
  ✓ Returns structured PostGIS availability flag
  ✓ Error message captured safely
  ✓ Pool ended cleanly without hanging handles
======================================================
🎉 PHASE 21 POSTGRESQL CONNECTION TESTS COMPLETE
======================================================

======================================================
⚡ Testing Kysely Repositories & SQL Compilation
======================================================
  ✓ Kysely instance initialized
  ✓ Brands select SQL compiled
  ✓ Bike Models Repository Query Compilation
  ✓ Bike Variants Repository Query Compilation
  ✓ Dealers Repository Query Compilation
  ✓ Dealer Locations & PostGIS Spatial Compilation
  ✓ Offers Repository Query Compilation
  ✓ Offer Price History Repository Query Compilation
  ✓ Leads Repository Query Compilation
  ✓ Outbound Clicks Repository Query Compilation
  ✓ Leasing Providers Repository Query Compilation
======================================================
🎉 ALL 10 KYSELY REPOSITORIES COMPILED CLEANLY
======================================================

======================================================
🚀 Running VeloFind MVP End-to-End Acceptance Tests (Phase 23)
======================================================
  ✓ Dealer & Location Configuration via DealersRepository
  ✓ Evidence-Based Leasing Provider Participation
  ✓ Authorized CSV Feed Import & Formula Defense
  ✓ Feed Replay Idempotency & Price History Compilation
  ✓ Search & Multi-Faceted Filtering via OffersRepository
  ✓ Geospatial Radius Search (München vs Berlin)
  ✓ Commercial Outbound Click Attribution
  ✓ Customer Lead Submission & Consent
  ✓ Flyway Migration Authority Files Check
======================================================
🎉 ALL 9 MVP ACCEPTANCE TEST SUITES PASSED CLEANLY
======================================================

======================================================
🐳 Verifying Production Docker Deployment Stack (Phase 24)
======================================================
TEST 1: Compose File & Environment Template Existence
  ✓ compose.production.yml exists
  ✓ .env.production.example exists
  ✓ Dockerfile exists
  ✓ compose.production.yml parsed as valid YAML
  ✓ Top-level services block is present
TEST 2: Container Topology & Services Definition
  ✓ Application service 'velofind-app' defined
  ✓ Database service 'postgres' defined
  ✓ Migration service 'flyway' defined
  ✓ Backup service 'db-backup' defined with profile
TEST 3: Network Separation & Internal Isolation
  ✓ Network 'public_net' defined
  ✓ Network 'internal_net' defined
  ✓ Network 'internal_net' has internal: true (no external gateway)
  ✓ 'velofind-app' attached to 'public_net'
  ✓ 'velofind-app' attached to 'internal_net'
  ✓ 'postgres' attached strictly to 'internal_net' only
  ✓ 'flyway' attached strictly to 'internal_net' only
TEST 4: Port Security (PostgreSQL Invariant)
  ✓ PostgreSQL does NOT expose host or public ports
TEST 5: Application Container Non-Root Configuration
  ✓ 'velofind-app' explicitly runs as user 'node'
  ✓ 'velofind-app' enforces 'no-new-privileges:true'
  ✓ Dockerfile runner stage enforces 'USER node'
  ✓ Dockerfile uses unprivileged chown for node user
TEST 6: Flyway Lifecycle & Startup Dependency Order
  ✓ 'velofind-app' depends on 'flyway'
  ✓ 'velofind-app' requires flyway condition 'service_completed_successfully'
  ✓ 'velofind-app' requires postgres condition 'service_healthy'
  ✓ 'flyway' requires postgres condition 'service_healthy' before executing migrations
  ✓ 'flyway' has restart: 'no' (fails fast on error)
TEST 7: Container Restart Policies
  ✓ 'velofind-app' restart policy is 'unless-stopped'
  ✓ 'postgres' restart policy is 'unless-stopped'
TEST 8: Container Health Check Design
  ✓ 'postgres' defines healthcheck
  ✓ 'postgres' healthcheck uses 'pg_isready'
  ✓ 'velofind-app' defines healthcheck
  ✓ 'velofind-app' healthcheck verifies '/api/health'
TEST 9: Resource Limits & Reservations
  ✓ 'velofind-app' defines CPU limits
  ✓ 'velofind-app' defines memory limits
  ✓ 'postgres' defines CPU limits
  ✓ 'postgres' defines memory limits
TEST 10: Persistent Volumes & Backup Support
  ✓ Named volume 'postgres_data' defined
  ✓ Named volume 'postgres_backups' defined
  ✓ 'postgres' mounts 'postgres_data' to /var/lib/postgresql/data
  ✓ 'postgres' mounts 'postgres_backups' volume for future backup integration
  ✓ 'scripts/backup-db.sh' helper exists
  ✓ 'scripts/restore-db.sh' helper exists
TEST 11: Production Environment Template Configuration
  ✓ .env.production.example defines NODE_ENV=production
  ✓ .env.production.example defines PORT=3000
  ✓ .env.production.example defines POSTGRES_DB=
  ✓ .env.production.example defines POSTGRES_USER=
  ✓ .env.production.example defines POSTGRES_PASSWORD=
  ✓ .env.production.example defines DATABASE_URL=
  ✓ .env.production.example defines APP_URL=
  ✓ .env.production.example defines POSTGRES_MAX_CONNECTIONS=
  ✓ .env.production.example defines FLYWAY_CONNECT_RETRIES=
  ✓ .env.production.example defines BACKUP_RETENTION_DAYS=
======================================================
🎉 ALL 11 PRODUCTION COMPOSE VERIFICATION SUITES PASSED
======================================================
```

Type checking and compilation:
- `npm run lint`: 0 errors.
- `npm run build`: 0 errors.

---

## 10. Remaining Blockers Before Phase 25

There are **no blocking technical issues** preventing commencement of Phase 25 (Caddy and TLS).
Items ready for integration in Phase 25:
1. Addition of the `caddy` service definition to `compose.production.yml` attached to `public_net` with ports `80:80` and `443:443`.
2. Creation of `Caddyfile` with automated Let's Encrypt / ZeroSSL TLS, HTTP-to-HTTPS redirect, HSTS, CSP, and proxying to `velofind-app:3000`.
3. Mounting persistent volumes for Caddy certificates (`caddy_data`) and configuration (`caddy_config`).
