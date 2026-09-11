# ADR-008: Feed Import Idempotency and Stale Inventory Grace Policy

## Status
ACCEPTED

## Context
Automated dealer CSV/XML inventory feeds are prone to network timeouts, malformed rows, server errors, and incomplete payloads. If an import fails halfway through, naive systems mark unseen items "out of stock" or "deleted", destroying valid active dealer offers.

## Decision
1. **Offer Identity**: Guaranteed idempotent by composite natural key `(source_id, external_id)`.
2. **Partial Error Tolerance**: Valid rows are imported; invalid rows are quarantined into `import_records` with exact line number, raw payload, and validation error messages.
3. **Stale Policy**:
   - Partial or failed import runs NEVER mark existing inventory stale.
   - Only 100% successful snapshot imports trigger the stale inventory sweep.
   - Items unseen in a successful snapshot are placed in a configurable grace period (default 48 hours) before transition to `OUT_OF_STOCK` or `INACTIVE`.
4. **Price History**: Whenever an active offer's price changes, an immutable entry is recorded in `offer_price_history`.

## Alternatives Considered
- Full wipe and replace (rejected: causes search downtime, breaks active customer links, and drops valid offers on feed glitch).
- Strict abort-on-first-error (rejected: a single bad row prevents 5,000 valid bikes from going live).

## Consequences
- Highly resilient feed pipeline.
- Reliable historical pricing data for consumer price drop notifications and transparency.
