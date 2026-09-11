# VeloFind Implementation Queue V2: Production Hardening & Deployment

This implementation queue outlines the remaining technical and operational phases to transition the validated Express + Vite + Flyway modular monolith into a hardened, production-ready environment backed by real PostgreSQL 17 + PostGIS, Kysely query builders, automated TLS, backup/restore runbooks, and pilot dealer onboarding.

---

## Phase Overview

| Phase | Phase Name | Status | Dependencies |
|---|---|---|---|
| **21** | Real PostgreSQL Integration | **COMPLETE** | ADR-009 |
| **22** | Kysely Repository Layer | **COMPLETE** | Phase 21 |
| **23** | Remove In-Memory Database Engine | **COMPLETE** | Phase 22 |
| **24** | Production Compose Stack | **COMPLETE** | Phase 21, 23 |
| **25** | Caddy and TLS | **COMPLETE** | Phase 24 |
| **26** | SEO and Sitemap Generation | **PENDING** | Phase 23 |
| **27** | Backup System | **PENDING** | Phase 24 |
| **28** | Restore Verification | **PENDING** | Phase 27 |
| **29** | Monitoring and Health Dashboards | **PENDING** | Phase 25 |
| **30** | Pilot Dealer Onboarding Workflow | **PENDING** | Phase 23, 29 |
| **31** | Production Readiness Review | **PENDING** | Phase 21-30 |

---

## Detailed Phase Breakdown

### Phase 21: Real PostgreSQL Integration
- **Objective**: Connect the Express backend to a real PostgreSQL 17 + PostGIS instance via connection pooling (`pg` pool) and verify automatic execution of Flyway migrations against the live database container.
- **Files to Create**:
  - `src/server/db/pool.ts` (connection pooling configuration, SSL, keep-alives, connection health checks)
  - `tests/postgres-connection.test.ts` (verifies pool connection, query latency, and PostGIS extension presence)
- **Files to Modify**:
  - `package.json` (add `pg`, `@types/pg`)
  - `.env.example` (declare `DATABASE_URL`, `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`)
  - `docker-compose.yml` (configure network bridge, volume persistence, and service dependency health checks)
- **Acceptance Criteria**:
  - Backend establishes verified connection pool to PostgreSQL 17 with PostGIS 3.5.
  - Running `SELECT PostGIS_Full_Version();` returns valid spatial library information.
  - Connection errors fail fast with human-readable diagnostic output instead of unhandled promise rejections.

---

### Phase 22: Kysely Repository Layer
- **Objective**: Author strongly typed Kysely schema definitions matching the 6 Flyway SQL migrations and implement domain repositories for Catalog, Dealers, Offers, Ingestion, Leads, and Outbound Clicks.
- **Files to Create**:
  - `src/server/db/schema.ts` (complete TypeScript interfaces reflecting the 20 Flyway tables)
  - `src/server/db/repositories/catalog.repository.ts` (brand, model, variant queries)
  - `src/server/db/repositories/dealer.repository.ts` (dealer profiles, physical locations, supported leasing providers)
  - `src/server/db/repositories/offer.repository.ts` (PostGIS radius search, multi-faceted filtering, price history)
  - `src/server/db/repositories/import.repository.ts` (idempotent upserts on `(source_id, external_id)`, quarantine records)
  - `src/server/db/repositories/lead.repository.ts` (GDPR-compliant lead insert, status updates)
  - `src/server/db/repositories/attribution.repository.ts` (safe outbound click tracking and aggregation)
  - `tests/kysely-repositories.test.ts` (integration tests against live test database)
- **Files to Modify**:
  - `package.json` (add `kysely`)
  - `src/types.ts` (align domain types with Kysely query return types)
- **Acceptance Criteria**:
  - 100% of queries use Kysely with zero raw unescaped SQL strings.
  - Spatial radius query uses `ST_DWithin` and `ST_Distance` on geography points.
  - Feed ingestion upserts are idempotent and update `offer_price_history` when prices change.

---

### Phase 23: Remove In-Memory Database Engine
- **Objective**: Refactor `/server.ts` and test harnesses to route all production and development traffic through the Kysely repository layer, cleanly deprecating and deleting the in-memory relational simulation.
- **Files to Create**:
  - `docs/implementation/evidence/PHASE-23.md` (documentation of in-memory removal and benchmark comparison)
- **Files to Modify**:
  - `server.ts` (switch all route handlers from `db.*` in-memory methods to async Kysely repository calls)
  - `tests/mvp-verification.test.ts` (update test assertions to execute against Kysely repositories)
  - `src/server/db/database.ts` (remove mock state and retain only shared math/sanitization utility functions)
- **Acceptance Criteria**:
  - Zero mock state or in-memory arrays remain in the active data path.
  - `npm test` executes the 9 test suites directly against the real PostgreSQL container with identical pass rates.
  - Server boots in under 1.5 seconds and passes all health checks.

---

### Phase 24: Production Compose Stack
- **Objective**: Author a standalone production Docker Compose configuration (`compose.production.yml`) with production resource limits, automated restart policies, persistent volumes, and secret management.
- **Files to Create**:
  - `compose.production.yml` (production-hardened multi-service compose definition)
  - `.env.production.example` (template for production secrets and credentials)
- **Files to Modify**:
  - `Dockerfile` (optimize caching, security non-root user `node`, and size)
  - `package.json` (add `compose:prod` scripts)
- **Acceptance Criteria**:
  - `docker compose -f compose.production.yml up -d` boots all services successfully without interactive intervention.
  - App and database services run under unprivileged non-root users.
  - Data volumes survive container restarts and rebuilds.

---

### Phase 25: Caddy and TLS
- **Objective**: Configure Caddy as the automated reverse proxy handling automatic HTTPS, TLS certificates via Let's Encrypt / ZeroSSL, gzip/zstd compression, and security headers.
- **Files to Create**:
  - `Caddyfile` (Caddy reverse proxy configuration with reverse proxy to `velofind-app:3000`, HSTS, CSP, and rate limiting)
- **Files to Modify**:
  - `compose.production.yml` (add `caddy` service with ports `80` and `443`, plus persistent cert volumes)
- **Acceptance Criteria**:
  - Caddy proxies all HTTP traffic to HTTPS automatically.
  - Security headers (HSTS, X-Content-Type-Options, Referrer-Policy, Content-Security-Policy) are present on all responses.
  - Static assets are compressed and cached with optimal HTTP cache headers.

---

### Phase 26: SEO and Sitemap Generation
- **Objective**: Implement dynamic XML sitemap generation (`/sitemap.xml`), `robots.txt`, and Open Graph / Schema.org JSON-LD structured data for bike offers and verified dealers.
- **Files to Create**:
  - `src/server/seo/sitemap.ts` (dynamic sitemap generator querying active offers, dealers, and leasing providers)
  - `public/robots.txt` (search engine crawler directives)
  - `src/components/JsonLd.tsx` (Schema.org `Product`, `Offer`, `BicycleStore`, and `BreadcrumbList` generator)
- **Files to Modify**:
  - `server.ts` (mount `/sitemap.xml` and `/robots.txt` endpoints)
  - `src/components/OfferModal.tsx` (embed Schema.org structured metadata)
- **Acceptance Criteria**:
  - `GET /sitemap.xml` returns valid XML listing all canonical product offers and dealer profile URLs.
  - Google Rich Results test valid against generated Product and Store JSON-LD schemas.

---

### Phase 27: Backup System [COMPLETE]
- **Objective**: Implement an automated, encrypted database backup script utilizing `pg_dump`, gzip/zlib compression, retention rotation, and verification checksums.
- **Files Created**:
  - `scripts/backup.sh` (POSIX-compliant automated backup script with custom format -Fc, zlib -Z 9, sha256 checksum, AES-256-CBC encryption, and rotation)
  - `docs/runbooks/backup.md` (detailed operational runbook for scheduled and ad-hoc database backups, retention, encryption, and off-server sync)
  - `tests/backup-automation.test.ts` (verification test suite for backup automation, encryption round-trip, and checksum validation)
- **Files Modified**:
  - `compose.production.yml` (mount backup volume and scripts into db-backup service)
  - `.env.production.example` (add BACKUP_PATH, BACKUP_RETENTION_DAYS, BACKUP_ENCRYPTION_KEY_PATH, BACKUP_REMOTE_DESTINATION)
  - `package.json` (add test:backup script)
- **Status**: COMPLETE. Fully verified across 9 test suites.

---

### Phase 28: Restore Verification
- **Objective**: Author an automated restore drill script and step-by-step disaster recovery procedure to verify backup integrity in an isolated test container.
- **Files to Create**:
  - `scripts/restore.sh` (automated restore script taking a backup archive and restoring to target database)
  - `tests/restore-drill.test.ts` (verifies data integrity and row counts post-restoration)
  - `docs/runbooks/disaster-recovery.md` (step-by-step manual and automated disaster recovery runbook)
- **Files to Modify**:
  - `package.json` (add `test:restore` command)
- **Acceptance Criteria**:
  - Automated restore drill restores a fresh backup into an ephemeral PostgreSQL instance.
  - Row counts across all 20 tables match the pre-backup state with 100% data fidelity.
- **Status**: COMPLETE. Fully verified across 8 automated restore drill test suites.

---

### Phase 29: Monitoring and Health Dashboards
- **Objective**: Implement system health probes (`/api/health/live`, `/api/health/ready`), database query metrics, and error alerting hooks.
- **Files to Create**:
  - `src/server/monitoring/health.ts` (Kubernetes/Docker health and readiness checks probing PostgreSQL, disk, and memory)
  - `docs/runbooks/monitoring.md` (operational runbook covering metrics, log aggregation, and error triage)
- **Files to Modify**:
  - `server.ts` (mount detailed `/api/health/ready` probe)
  - `src/components/DealerAdminPortal.tsx` (add system health status indicator)
- **Acceptance Criteria**:
  - `/api/health/live` responds `200 OK` when the event loop is responsive.
  - `/api/health/ready` validates database connectivity and responds `503 Service Unavailable` if database is down.

---

### Phase 30: Pilot Dealer Onboarding Workflow
- **Objective**: Build the self-serve dealer onboarding flow enabling a new German bike shop to register, configure store locations, upload their initial CSV inventory feed, and select supported leasing providers with verification evidence.
- **Files to Create**:
  - `src/components/DealerOnboardingModal.tsx` (step-by-step registration: Store details, Opening Hours, Leasing Accreditations, CSV Upload)
  - `src/server/services/onboarding.service.ts` (dealer registration, initial user provisioning, and feed validation)
  - `docs/runbooks/dealer-onboarding.md` (internal standard operating procedure for verifying dealer credentials)
- **Files to Modify**:
  - `src/components/Header.tsx` (add "Händler werden" button)
  - `src/components/DealerAdminPortal.tsx` (link onboarding assistance and profile settings)
  - `server.ts` (mount `POST /api/dealers/onboard` endpoint)
- **Acceptance Criteria**:
  - New dealer can complete onboarding in under 5 minutes.
  - Uploaded inventory immediately populates the search index after automated formula sanitization.
  - Participating leasing providers display correct evidence badges on the public storefront.

---

### Phase 31: Production Readiness Review
- **Objective**: Final comprehensive pre-launch audit covering security penetration checks, load testing (pgbench / k6), backup dry-runs, and compliance verification.
- **Files to Create**:
  - `docs/implementation/evidence/PHASE-31_PRODUCTION_READINESS.md` (final signed-off readiness report with latency percentiles and security checklist)
  - `scripts/load-test.sh` (k6 / autocannon load testing script evaluating search and lead submission concurrency)
- **Files to Modify**:
  - `docs/implementation/IMPLEMENTATION_QUEUE_V2.md` (mark all phases as COMPLETE)
- **Acceptance Criteria**:
  - P95 search latency below 100ms under 200 concurrent requests.
  - Zero high or critical security vulnerabilities detected via static audit and automated vulnerability scans.
  - End-to-end commercial flow tested with real pilot dealer inventory.
