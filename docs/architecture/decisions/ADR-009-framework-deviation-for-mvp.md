# ADR-009: Framework Deviation for MVP Validation and Profitability

## Status
ACCEPTED

## Context
The initial technical blueprint outlined a dual-framework stack consisting of a Next.js frontend (for SSR/SEO) and a NestJS + Fastify backend. During Phase 02 and Phase 11–20 execution, the entire vertical slice of commercial functionality was successfully implemented, unified, and validated within an Express 4 + React 19 (Vite) modular monolith:

```text
dealer inventory 
-> authorized CSV import 
-> product normalization 
-> searchable offer 
-> evidence-based leasing compatibility 
-> lead generation 
-> outbound attribution
```

A complete re-platforming to Next.js and NestJS at this juncture would introduce significant technical churn, schedule delays, and regression risks without increasing immediate commercial validation or dealer value generation.

## Decision
We intentionally prioritize business validation, operational simplicity, and profitability over framework purity.

1. **Keep Express 4 Backend**: Retain the clean, high-performance Express REST API in `/server.ts` to power search, feed ingestion, lead capture, and commercial attribution.
2. **Keep React + Vite Frontend**: Retain the React 19 Single Page Application in `/src/App.tsx` and modular components, providing instant search UX, interactive leasing calculators, and dealer administrative workflows.
3. **Keep Flyway Migrations**: Maintain Flyway SQL (`database/migrations/V001__extensions_and_types.sql` through `V006__seed_providers.sql`) as the sole and immutable database schema authority.
4. **Keep PostgreSQL 17 + PostGIS Target Architecture**: Continue with PostgreSQL 17 + PostGIS 3.5 as the underlying production datastore, backed by Kysely for type-safe relational and spatial queries.
5. **Keep Docker Deployment**: Deploy the modular monolith as a unified multi-stage container orchestrated via Docker Compose alongside PostgreSQL and Flyway.

## Migration Path to Next.js and NestJS (Future Expansion)

Should future business milestones or scaling benchmarks demand migration to Next.js (for extensive dynamic SSR / ISR sitemaps) or NestJS (for enterprise dependency injection or microservice extraction), the transition path is decoupled and straightforward:

1. **API Migration Path (Express -> NestJS + Fastify)**:
   - The business logic is already modularized by domain and database service layers (`searchOffers`, `importCSVFeed`, `submitLead`, `recordOutboundClick`).
   - The Kysely database repository layer (`src/server/db/`) can be wrapped in standard NestJS Injectable Providers without modifying SQL query logic or database schemas.
   - Express route handlers map 1:1 to NestJS Controller methods with Fastify adapter.
2. **Frontend Migration Path (Vite SPA -> Next.js App Router)**:
   - UI components (`OfferCard`, `OfferModal`, `SearchFiltersBar`, `LeadModal`, `LeasingGuideView`) are standard React 19 components with zero proprietary bundler hooks.
   - For SSR catalogue pages, components can be moved into Next.js App Router routes (`app/angebote/[slug]/page.tsx`, `app/haendler/[slug]/page.tsx`) with Server Components fetching data from the repository layer.
   - The Vite SPA can remain as the authenticated Dealer and Admin Portal (`/portal/*`), while Next.js handles consumer-facing SEO landing pages.

## Consequences

### Positive
- **Zero Business Stagnation**: Immediate focus on commercial traction, dealer onboarding, and live inventory validation.
- **Unified Codebase**: Server and client build together in a single deterministic pipeline (`npm run build`).
- **Low Operational Footprint**: Runs seamlessly on a single low-cost VPS with minimal memory overhead.

### Negative / Trade-offs
- Dynamic server-rendered HTML for search engine crawlers requires pre-rendering or dynamic meta-tag generation scripts until Next.js or a dedicated SSR edge worker is deployed.
- NestJS structural abstractions (Modules, Decorators, Guards) are replaced by clean Express middleware and modular services.
