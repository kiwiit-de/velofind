# ADR-002: Flyway Forward-Only Migration Schema Authority

## Status
ACCEPTED

## Context
Database schema drift between staging, production, and developer instances creates catastrophic bugs. ORM-generated auto-migrations often produce unsafe index locks, drop columns inadvertently, or obscure database-level constraints.

## Decision
Flyway SQL is the sole schema authority. All schema changes must be expressed as forward-only, idempotent SQL scripts (`V001__*.sql` onwards). No ORM migration generator may touch production schemas. All migrations must be testable on an empty database.

## Alternatives Considered
- Prisma/Drizzle auto-migrations (rejected: hidden schema mutations, lacks fine-grained control over PostGIS/GIN/GiST index creation and least-privilege roles).
- Manual ad-hoc SQL executions (rejected: untracked, non-reproducible).

## Consequences
- Every schema change is explicitly versioned and reviewable in PRs.
- Clear separation between runtime application code and database migration runner.
- Production-grade reproducibility.

## Reversal or Expansion Trigger
None. Forward-only SQL migrations are standard across enterprise relational systems.
