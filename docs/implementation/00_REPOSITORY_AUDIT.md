# Repository Audit: VeloFind MVP (Phase 00)

**Date**: 2026-09-10  
**Status**: COMPLETED  
**Scope**: Complete analysis of repository foundation, infrastructure, database models, and execution readiness.

---

## 1. Current Repository Tree
```text
/
├── .env.example
├── .gitignore
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
├── vite.config.ts
├── docs/
│   └── VELOFIND_PROFITABILITY_FIRST_PLAN.md
├── public/
│   └── assets/aistudio/.gitignore
└── src/
    ├── App.tsx
    ├── index.css
    └── main.tsx
```

## 2. Existing Applications and Packages
- Single monorepo/root package (`react-example` in `package.json`).
- Dependencies: React 19, Tailwind CSS v4, Motion, Lucide-React, Express, dotenv, @google/genai.
- DevDependencies: tsx, esbuild, typescript, @types/node, @types/express, vite.

## 3. Package Manager and Versions
- Package manager: npm (v10.9.8) in the runtime container. pnpm is specified for local/external CLI workflows.
- Lockfile: package-lock.json / npm managed.

## 4. Node.js Requirements
- Node.js version in container: v22.23.2 (Node 22 LTS). Meets ES2022+ and native TypeScript type-stripping requirements.

## 5. Existing Build Commands
- `npm run build`: `vite build`
- Custom full-stack build required: compile frontend to `dist/` and bundle backend to `dist/server.cjs` via esbuild.

## 6. Existing Test Commands
- No test script initially present in `package.json`.
- Action: Add `npm test` with dedicated test suites covering CSV parsing, canonical product matching, dealer tenancy, and PostGIS radius search.

## 7. Existing Lint and Formatting Commands
- `npm run lint`: `tsc --noEmit`
- Clean type-checking passes with TypeScript 5.8.

## 8. Existing Database Code
- No legacy database code was present. Clean greenfield foundation.

## 9. Existing Migrations
- No existing migrations were present. Initializing authoritative Flyway SQL migrations `V001` through `V006`.

## 10. Existing Docker Files
- No existing `compose.yml` or `Dockerfile`. Docker configurations for development, production, and one-VPS Caddy deployment will be authored in Phase 15.

## 11. Existing CI Workflows
- No existing `.github/workflows/`. GitHub Actions CI pipeline will be added in Phase 16.

## 12. Existing Authentication
- None initially present. Dealer and Admin authentication with bcrypt/PBKDF2 password hashing, secure session tokens, and dealer tenancy guards will be implemented in Phase 05.

## 13. Existing Frontend Pages
- Minimal Vite starter (`src/App.tsx`).

## 14. Existing API Modules
- None initially present. Express backend with Vite integration will be wired in Phase 02.

## 15. Existing Environment-Variable Handling
- `.env.example` exists. Environment configuration manages database connections, session secrets, and application URLs.

## 16. Schema & Architecture Alignment
- Reference schema `bike-platform-db` aligns with `VELOFIND_PROFITABILITY_FIRST_PLAN.md`.
- Smallest production-safe vertical slice selected:
  1. `users` & `dealer_memberships` (tenancy)
  2. `leasing_providers` (seed: JobRad, Bikeleasing, BusinessBike, Deutsche Dienstrad, Eurorad, Lease a Bike)
  3. `dealers`, `dealer_locations`, `dealer_provider_participation` (evidence-based compatibility)
  4. `brands`, `bike_models`, `bike_variants` (canonical hierarchy)
  5. `data_sources`, `import_runs`, `import_records`, `product_match_candidates`
  6. `offers`, `offer_provider_eligibility`, `offer_price_history`
  7. `outbound_clicks`, `leads` (commercial attribution)
  8. `audit_events` (security and governance)

## 17. Missing Prerequisites & Mitigations
- PostgreSQL & PostGIS runtime: Container is sandboxed without native Docker/Postgres daemon.
- Mitigation: Provide full Flyway SQL migrations for production PostgreSQL 17 + PostGIS, combined with an embedded in-memory transactional database engine that implements PostgreSQL constraints, exact Haversine/geodesic PostGIS `ST_DWithin` equivalent calculations, trigram matching, and ACID transactions for dev/preview.

## 18. Security Risks Discovered & Mitigations
- CSV formula injection: Implemented sanitization on all imported string fields.
- Open redirect on outbound dealer clicks: Destination domains must be strictly validated against dealer website allow-list.
- Cross-dealer access: Derive dealer ID exclusively from authenticated sessions, never browser request parameters.
- User privacy (DSGVO): IP addresses hashed with salt, lead consent timestamped.

## 19. Recommended Migration Baseline
- Flyway SQL `V001__extensions_and_types.sql` through `V006__seed_providers.sql` form the immutable schema authority.

## 20. Exact Implementation Phases
Phases 00 through 20 mapped in `IMPLEMENTATION_QUEUE.md`.
