# ADR-004: Type-Safe Database Access Layer (Kysely)

## Status
ACCEPTED

## Context
The application needs type-safe SQL query building without the baggage, runtime caching obscurities, and query generation overhead of heavy traditional ORMs.

## Decision
Use Kysely with `pg` as the primary query builder. Kysely provides compile-time TypeScript type safety, enforces parameterized inputs, and maps directly to the Flyway-managed schema without runtime introspection delays or hidden query generation anomalies.

## Alternatives Considered
- Heavy ORM (TypeORM, Hibernate, Prisma): Heavy abstraction layers, migration coupling, sub-optimal spatial query support.
- Raw string queries (`pg.query` directly without typing): Prone to typos, schema drift, and refactoring errors.

## Consequences
- 100% type safety on table columns, foreign keys, and result sets.
- Explicit query transparency with easy integration of `EXPLAIN ANALYZE`.
- Clean transaction and connection pool lifecycle management.

## Reversal or Expansion Trigger
None anticipated for relational data operations.
