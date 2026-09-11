# VeloFind MVP Implementation Queue

| Phase | Phase Name | Status | Dependencies |
|---|---|---|---|
| **00** | Repository Audit | **COMPLETE** | None |
| **01** | Architecture Decisions (ADRs) | **COMPLETE** | Phase 00 |
| **02** | Monorepo and Application Foundation | **COMPLETE** | Phase 01 |
| **03** | Flyway / PostgreSQL / PostGIS Foundation | **COMPLETE** | Phase 02 |
| **04** | Database Access and Configuration | **COMPLETE** | Phase 03 |
| **05** | Authentication and Dealer Tenancy | **COMPLETE** | Phase 04 |
| **06** | Catalogue Domain | **COMPLETE** | Phase 04 |
| **07** | Dealers, Locations, and Provider Participation | **COMPLETE** | Phase 05, 06 |
| **08** | Offers and Provider Compatibility | **COMPLETE** | Phase 07 |
| **09** | First Authorized CSV Import | **COMPLETE** | Phase 08 |
| **10** | Canonical Matching and Manual Review | **COMPLETE** | Phase 09 |
| **11** | Public Search API & Geospatial Radius | **COMPLETE** | Phase 08, 10 |
| **12** | Public Discovery Web Experience & SEO | **COMPLETE** | Phase 11 |
| **13** | Lead Capture and Outbound Attribution | **COMPLETE** | Phase 12 |
| **14** | Minimal Internal Administration & Dealer Portal | **COMPLETE** | Phase 05, 13 |
| **15** | Production Docker Deployment | **COMPLETE** | Phase 14 |
| **16** | CI/CD Pipeline & Quality Gates | **COMPLETE** | Phase 15 |
| **17** | Backup, Restoration, Monitoring, Runbooks | **COMPLETE** | Phase 15 |
| **18** | Security and Privacy Review | **COMPLETE** | Phase 16, 17 |
| **19** | Performance Validation | **COMPLETE** | Phase 18 |
| **20** | Final Production-Readiness Review | **COMPLETE** | Phase 19 |

---

## Detailed Phase Breakdown

### Phase 00: Repository Audit
- **Objective**: Complete inspection of dependencies, runtime constraints, and missing assets.
- **Status**: COMPLETE. Output: `docs/implementation/00_REPOSITORY_AUDIT.md`.

### Phase 01: Architecture Decisions
- **Objective**: Establish foundational ADRs for modular monolith, Flyway authority, PostGIS search, Kysely data access, tenancy, and feed idempotency.
- **Status**: COMPLETE. Output: `docs/architecture/decisions/ADR-001` through `ADR-008`.

### Phase 02: Monorepo and Application Foundation
- **Objective**: Configure Express backend + Vite full-stack foundation, shared types, environment configurations, and scripts.
- **Dependencies**: Phase 01.
- **Files**: `package.json`, `server.ts`, `src/types.ts`.

### Phase 03: Flyway / PostgreSQL / PostGIS Foundation
- **Objective**: Author forward-only Flyway SQL migrations `V001__extensions_and_types.sql` through `V006__seed_providers.sql` adhering to production constraints.
- **Dependencies**: Phase 02.
- **Files**: `database/migrations/V001` to `V006`.

### Phase 04: Database Access and Configuration
- **Objective**: Implement database connection management, Kysely type contracts, transactional queries, and geospatial calculus.
- **Dependencies**: Phase 03.
- **Files**: `src/server/db/`, `src/server/db/schema.ts`.

### Phase 05: Authentication and Dealer Tenancy
- **Objective**: Multi-tenant RBAC (admin, dealer owner, dealer editor, viewer), secure token handling, password hashing, and tenancy enforcement.
- **Dependencies**: Phase 04.

### Phase 06: Catalogue Domain
- **Objective**: Canonical brand, bike model, and variant hierarchy with technical specifications.
- **Dependencies**: Phase 04.

### Phase 07: Dealers, Locations, and Provider Participation
- **Objective**: Dealer profiles, physical store locations with PostGIS coordinates, and verified leasing provider participation.
- **Dependencies**: Phase 05, 06.

### Phase 08: Offers and Provider Compatibility
- **Objective**: Dealer inventory offers, price history, and multi-tier evidence-based leasing eligibility calculation.
- **Dependencies**: Phase 07.

### Phase 09: First Authorized CSV Import
- **Objective**: Safe CSV feed parser, injection defense, row validation, error reports, and idempotent upserts.
- **Dependencies**: Phase 08.

### Phase 10: Canonical Matching and Manual Review
- **Objective**: Precedence matching (GTIN -> SKU -> Brand/Model/Year) and candidate review logging.
- **Dependencies**: Phase 09.

### Phase 11: Public Search API & Geospatial Radius
- **Objective**: High-performance search with PostGIS `ST_DWithin` radius filtering, full-text / trigram ranking, and keyset pagination.
- **Dependencies**: Phase 08, 10.

### Phase 12: Public Discovery Web Experience & SEO
- **Objective**: German bike discovery marketplace with responsive search, filters, variant switcher, leasing badges, and SEO metadata.
- **Dependencies**: Phase 11.

### Phase 13: Lead Capture and Outbound Attribution
- **Objective**: Tracked outbound clicks (`/api/out/:offerId`), lead capture forms with DSGVO consent, and rate limiting.
- **Dependencies**: Phase 12.

### Phase 14: Minimal Internal Administration & Dealer Portal
- **Objective**: Dealer inventory management, feed upload interface, lead review, and audit log exploration.
- **Dependencies**: Phase 05, 13.

### Phase 15: Production Docker Deployment
- **Objective**: Docker Compose multi-stage setup with Caddy, web, api, postgres, flyway, and health checks.
- **Dependencies**: Phase 14.

### Phase 16: CI/CD Pipeline & Quality Gates
- **Objective**: GitHub Actions workflow for linting, type-checking, integration tests, and migration validation.
- **Dependencies**: Phase 15.

### Phase 17: Backup, Restoration, Monitoring, Runbooks
- **Objective**: `pg_dump` backup scripts, isolated restore validation, and production runbooks.
- **Dependencies**: Phase 15.

### Phase 18: Security and Privacy Review
- **Objective**: OWASP top 10 audit, DSGVO privacy compliance, injection defenses, and rate limiting.
- **Dependencies**: Phase 16, 17.

### Phase 19: Performance Validation
- **Objective**: Latency benchmarks, indexing verification, and query optimization evidence.
- **Dependencies**: Phase 18.

### Phase 20: Final Production-Readiness Review
- **Objective**: Comprehensive checklist evaluation and final GO / NO-GO verdict.
- **Dependencies**: Phase 19.
