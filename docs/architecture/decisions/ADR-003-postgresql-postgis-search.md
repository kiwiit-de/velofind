# ADR-003: PostgreSQL 17, PostGIS, Full-Text & Trigram Search

## Status
ACCEPTED

## Context
VeloFind requires flexible bike and e-bike discovery with fast text search across brands, models, categories, and technical specs, combined with accurate German dealer radius searches (e.g. within 25km of Berlin or Munich).

## Decision
Utilize PostgreSQL 17 with PostGIS extensions (`postgis`), Full-Text Search (`tsvector`, `tsquery`), and trigram fuzzy matching (`pg_trgm`). Dealer locations are stored as PostGIS `geography(Point, 4326)` points with GiST spatial indexing. Radius queries execute using `ST_DWithin`. No external search engines (Typesense, Elasticsearch, Algolia) are introduced for the MVP.

## Alternatives Considered
- Elasticsearch/Typesense (rejected: adds operational failure modes, multi-node synchronization, and double-write consistency challenges for MVP).
- Calculating distance in JavaScript (rejected: cannot leverage database spatial indexing, high memory overhead).

## Consequences
- Single stateful database service simplifies backups and operational maintenance.
- PostGIS provides sub-millisecond distance filtering on indexed dealer coordinates.
- PostgreSQL full-text and trigram indexes deliver millisecond search response times.

## Reversal or Expansion Trigger
Typesense or Meilisearch may be evaluated if inventory exceeds 2,000,000 active offers or if complex typo-tolerance search loads saturate database IOPS.
