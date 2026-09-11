# ADR-006: Evidence-Based Leasing Compatibility

## Status
ACCEPTED

## Context
German bicycle leasing involves complex employer agreements and provider regulations (JobRad, Bikeleasing, BusinessBike, Deutsche Dienstrad, Eurorad, Lease a Bike). Claiming universal leasing eligibility (`is_leasing_eligible = true`) creates severe legal liability and customer frustration if an employer rejects an unapproved dealer or model.

## Decision
Abandon binary eligibility flags. Implement an evidence-based multi-tier compatibility model:
1. `dealer_provider_participation`: Tracks dealer contracts with leasing providers and records verification evidence (contract ID, confirmation date, verification status).
2. `offer_provider_eligibility`: Computes compatibility status:
   - `CONFIRMED`: Dealer holds verified active provider agreement and bike meets provider pricing/type policies.
   - `LIKELY`: Dealer participates in provider network; model conforms to standard category criteria.
   - `REQUIRES_CONFIRMATION`: Dealer participation unverified or custom employer portal requirement.
   - `NOT_ELIGIBLE`: Model explicitly excluded (e.g. S-Pedelecs under certain collective bargaining rules) or dealer not participating.
3. Every UI representation includes the required legal disclaimer: "Händler bleibt Vertragspartner. Leasingvorbehalt."

## Alternatives Considered
- Simple boolean `leasing_eligible` flag (rejected: misleading to consumers and legally hazardous).

## Consequences
- Transparent and trustworthy consumer experience.
- Protects dealers from illegitimate customer lease claims.
