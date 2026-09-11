# ADR-005: Authorized Data Provenance and Multi-Tenant Isolation

## Status
ACCEPTED

## Context
Marketplace integrity requires that inventory belongs strictly to the authorized dealer that published it. Cross-tenant data leakage or spoofing dealer offers must be structurally impossible.

## Decision
All dealer data is partitioned by dealer membership. Dealer IDs are never trusted from client inputs (headers or query parameters); they are derived exclusively from verified session tokens. Every offer, location, and data source is tied to a `dealer_id` with foreign key constraints. Composite foreign keys enforce ownership guarantees.

## Alternatives Considered
- Single-tenant separate databases per dealer (rejected: impractical operational overhead for 100+ local dealers).
- Relying on client-provided query parameters (rejected: severe cross-tenant security vulnerability).

## Consequences
- Guaranteed data isolation between competing bike shops.
- Comprehensive audit logging (`audit_events`) for all dealer administrative actions.

## Reversal or Expansion Trigger
Enterprise multi-region regulatory isolation requirements if expanding outside the EU.
