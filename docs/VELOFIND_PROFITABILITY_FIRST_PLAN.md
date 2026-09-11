# VeloFind Profitability-First Business & Architecture Plan

## 1. Executive Summary & Strategy
VeloFind is a Germany-focused bike and e-bike discovery marketplace connecting riders with verified dealer inventory and leasing providers.
Rather than attempting nationwide catalogue coverage or unprofitable consumer subsidies, VeloFind executes a **profitability-first vertical slice**:
```text
authorized dealer inventory
-> import
-> product normalization
-> searchable offer
-> dealer and leasing-provider information
-> user enquiry or tracked outbound action
-> measurable dealer value
```

## 2. Core User & Dealer Journeys
1. **Search & Discovery**:
   - Filter by brand, category (E-Bike, Gravel, Trekking, MTB, City, Cargo, Rennrad), motor brand, battery capacity, frame size, and price.
   - Filter by German location (Postal code / City) and radius (10km, 25km, 50km, 100km).
   - Filter by supported leasing provider (JobRad, Bikeleasing, BusinessBike, Deutsche Dienstrad, Eurorad, Lease a Bike).
2. **Dealer Attribution & Commercial Monetization**:
   - High-intent riders see verified dealer inventory with real-time availability.
   - Transparent leasing eligibility with verification evidence ("Confirmed", "Likely", "Requires confirmation").
   - Clear legal disclaimer: "Händler bleibt Vertragspartner. Leasingvorbehalt."
   - Outbound click redirection (`/api/out/:offerId` or `/out/:offerId`) with privacy-preserving attribution (no raw IP storage).
   - Lead capture for test rides and consultations with DSGVO consent tracking.
3. **Dealer & Inventory Lifecycle**:
   - Authorized CSV feed import matching the canonical contract.
   - Idempotent upsert by `(source_id, external_id)`.
   - Price change detection and historical price logging.
   - Partial error isolation (clean rows imported, bad rows reported, existing inventory never staled on partial failure).
   - Product canonicalization hierarchy: Brand -> Bike Model -> Bike Variant -> Dealer Offer.

## 3. Mandatory Engineering Standards
- UUID primary keys throughout.
- Strict PostgreSQL constraints with named foreign keys.
- Flyway SQL forward-only migrations.
- Data-source provenance and dealer multi-tenancy isolation.
- PostGIS geospatial coordinates and distance calculations.
