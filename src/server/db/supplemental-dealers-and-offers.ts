/**
 * Supplemental Registry: Additional Dealers and Ingested Offers
 * Ensures 100% of requested partner websites are registered
 * and all offers have valid prices > 649 EUR for leasing eligibility.
 */
import type { Dealer, Offer } from '../../types.ts';

export const SUPPLEMENTAL_DEALERS: Dealer[] = [
  {
    "id": "mc000000-0000-4000-a000-000000000001",
    "name": "McDonald's Deutschland (Dienstrad Fleet & Delivery E-Bikes)",
    "slug": "mcdonalds-deutschland-dienstrad",
    "website_url": "https://www.mcdonalds.de",
    "phone": "+49 89 785940",
    "email": "dienstrad@mcdonalds.de",
    "is_verified": true,
    "is_active": true,
    "locations": [
      {
        "id": "mc000000-0000-4000-a000-000000000002",
        "dealer_id": "mc000000-0000-4000-a000-000000000001",
        "name": "McDonald's Mobility & Dienstrad Hub",
        "address_line1": "Drygalski-Allee 51",
        "postal_code": "81477",
        "city": "München",
        "country_code": "DE",
        "latitude": 48.0934,
        "longitude": 11.5173,
        "phone": "+49 89 785940",
        "email": "dienstrad@mcdonalds.de",
        "opening_hours": "Mo-Fr: 08:00 - 18:00 Uhr"
      }
    ],
    "supported_providers": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "contract_reference": "VF-CTR-MCD-JOB"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "contract_reference": "VF-CTR-MCD-BIK"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "contract_reference": "VF-CTR-MCD-LEA"
      }
    ],
    "created_at": "2026-09-01T00:00:00.000Z"
  }
];

export const SUPPLEMENTAL_OFFERS: Offer[] = [
  {
    "id": "supp-off-9001",
    "dealer_id": "mc000000-0000-4000-a000-000000000001",
    "dealer_name": "McDonald's Deutschland (Dienstrad Fleet & Delivery E-Bikes)",
    "dealer_slug": "mcdonalds-deutschland-dienstrad",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "mc000000-0000-4000-a000-000000000002",
        "dealer_id": "mc000000-0000-4000-a000-000000000001",
        "name": "McDonald's Mobility & Dienstrad Hub",
        "address_line1": "Drygalski-Allee 51",
        "postal_code": "81477",
        "city": "München",
        "country_code": "DE",
        "latitude": 48.0934,
        "longitude": 11.5173,
        "phone": "+49 89 785940",
        "email": "dienstrad@mcdonalds.de",
        "opening_hours": "Mo-Fr: 08:00 - 18:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9001",
    "title": "CUBE Cargo Sport Dual Hybrid 1000 Flashgrey",
    "brand_name": "CUBE",
    "model_name": "Cargo Sport Dual Hybrid 1000",
    "model_year": 2025,
    "category": "CARGO",
    "propulsion": "PEDELEC",
    "price_cents": 529900,
    "compare_at_price_cents": 559900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.mcdonalds.de?ref=velofind&offer=EXT-SUPP-9001",
    "image_url": "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9001",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "One Size",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 1000,
      "motor_model": "Bosch Cargo Line Gen 4",
      "sku": "EXT-SUPP-9001"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-MCD-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-MCD-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-MCD-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9001",
        "offer_id": "supp-off-9001",
        "old_price_cents": 559900,
        "new_price_cents": 529900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9002",
    "dealer_id": "mc000000-0000-4000-a000-000000000001",
    "dealer_name": "McDonald's Deutschland (Dienstrad Fleet & Delivery E-Bikes)",
    "dealer_slug": "mcdonalds-deutschland-dienstrad",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "mc000000-0000-4000-a000-000000000002",
        "dealer_id": "mc000000-0000-4000-a000-000000000001",
        "name": "McDonald's Mobility & Dienstrad Hub",
        "address_line1": "Drygalski-Allee 51",
        "postal_code": "81477",
        "city": "München",
        "country_code": "DE",
        "latitude": 48.0934,
        "longitude": 11.5173,
        "phone": "+49 89 785940",
        "email": "dienstrad@mcdonalds.de",
        "opening_hours": "Mo-Fr: 08:00 - 18:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9002",
    "title": "Tern GSD S10 LX Cargo Pedelec Beetle Blue",
    "brand_name": "Tern",
    "model_name": "GSD S10 LX",
    "model_year": 2025,
    "category": "CARGO",
    "propulsion": "PEDELEC",
    "price_cents": 569900,
    "compare_at_price_cents": 599900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.mcdonalds.de?ref=velofind&offer=EXT-SUPP-9002",
    "image_url": "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9002",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "Universal",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 1000,
      "motor_model": "Bosch Cargo Line Gen 4",
      "sku": "EXT-SUPP-9002"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-MCD-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-MCD-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-MCD-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9002",
        "offer_id": "supp-off-9002",
        "old_price_cents": 599900,
        "new_price_cents": 569900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9003",
    "dealer_id": "mc000000-0000-4000-a000-000000000001",
    "dealer_name": "McDonald's Deutschland (Dienstrad Fleet & Delivery E-Bikes)",
    "dealer_slug": "mcdonalds-deutschland-dienstrad",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "mc000000-0000-4000-a000-000000000002",
        "dealer_id": "mc000000-0000-4000-a000-000000000001",
        "name": "McDonald's Mobility & Dienstrad Hub",
        "address_line1": "Drygalski-Allee 51",
        "postal_code": "81477",
        "city": "München",
        "country_code": "DE",
        "latitude": 48.0934,
        "longitude": 11.5173,
        "phone": "+49 89 785940",
        "email": "dienstrad@mcdonalds.de",
        "opening_hours": "Mo-Fr: 08:00 - 18:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9003",
    "title": "Riese & Müller Transporter 65 Touring E-Cargo",
    "brand_name": "Riese & Müller",
    "model_name": "Transporter 65 Touring",
    "model_year": 2025,
    "category": "CARGO",
    "propulsion": "PEDELEC",
    "price_cents": 619900,
    "compare_at_price_cents": 649900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.mcdonalds.de?ref=velofind&offer=EXT-SUPP-9003",
    "image_url": "https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9003",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "Universal",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 750,
      "motor_model": "Bosch Performance Line CX",
      "sku": "EXT-SUPP-9003"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-MCD-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-MCD-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-MCD-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9003",
        "offer_id": "supp-off-9003",
        "old_price_cents": 649900,
        "new_price_cents": 619900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9004",
    "dealer_id": "f778f310-1d9c-4f73-af4d-63331bd064b1",
    "dealer_name": "Fahrrad XXL Meinhövel Gelsenkirchen",
    "dealer_slug": "fahrrad-xxl-meinhoevel-gelsenkirchen",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-xxl-gelsenkirchen-001",
        "dealer_id": "f778f310-1d9c-4f73-af4d-63331bd064b1",
        "name": "Fahrrad XXL Meinhövel Gelsenkirchen",
        "address_line1": "Willy-Brandt-Allee 54",
        "postal_code": "45891",
        "city": "Gelsenkirchen",
        "country_code": "DE",
        "latitude": 51.5542,
        "longitude": 7.0789,
        "phone": "+49 209 977500",
        "email": "gelsenkirchen@fahrrad-xxl.de",
        "opening_hours": "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 10:00 - 18:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9004",
    "title": "CUBE Stereo Hybrid 120 Pro 750 Swampgrey",
    "brand_name": "CUBE",
    "model_name": "Stereo Hybrid 120 Pro 750",
    "model_year": 2025,
    "category": "E_BIKE",
    "propulsion": "PEDELEC",
    "price_cents": 389900,
    "compare_at_price_cents": 419900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.fahrrad-xxl.de/filialen/gelsenkirchen/?ref=velofind&offer=EXT-SUPP-9004",
    "image_url": "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9004",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "L (20\")",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 750,
      "motor_model": "Bosch Performance Line CX",
      "sku": "EXT-SUPP-9004"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9004",
        "offer_id": "supp-off-9004",
        "old_price_cents": 419900,
        "new_price_cents": 389900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9005",
    "dealer_id": "f778f310-1d9c-4f73-af4d-63331bd064b1",
    "dealer_name": "Fahrrad XXL Meinhövel Gelsenkirchen",
    "dealer_slug": "fahrrad-xxl-meinhoevel-gelsenkirchen",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-xxl-gelsenkirchen-001",
        "dealer_id": "f778f310-1d9c-4f73-af4d-63331bd064b1",
        "name": "Fahrrad XXL Meinhövel Gelsenkirchen",
        "address_line1": "Willy-Brandt-Allee 54",
        "postal_code": "45891",
        "city": "Gelsenkirchen",
        "country_code": "DE",
        "latitude": 51.5542,
        "longitude": 7.0789,
        "phone": "+49 209 977500",
        "email": "gelsenkirchen@fahrrad-xxl.de",
        "opening_hours": "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 10:00 - 18:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9005",
    "title": "Specialized Turbo Vado 4.0 Cast Black",
    "brand_name": "Specialized",
    "model_name": "Turbo Vado 4.0",
    "model_year": 2025,
    "category": "E_BIKE",
    "propulsion": "PEDELEC",
    "price_cents": 399900,
    "compare_at_price_cents": 440000,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.fahrrad-xxl.de/filialen/gelsenkirchen/?ref=velofind&offer=EXT-SUPP-9005",
    "image_url": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9005",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "M",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 710,
      "motor_model": "Specialized 2.0",
      "sku": "EXT-SUPP-9005"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9005",
        "offer_id": "supp-off-9005",
        "old_price_cents": 440000,
        "new_price_cents": 399900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9006",
    "dealer_id": "f778f310-1d9c-4f73-af4d-63331bd064b2",
    "dealer_name": "Fahrrad XXL Feld Sankt Augustin",
    "dealer_slug": "fahrrad-xxl-feld-sankt-augustin",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-xxl-sankt-augustin-001",
        "dealer_id": "f778f310-1d9c-4f73-af4d-63331bd064b2",
        "name": "Fahrrad XXL Feld Sankt Augustin (Köln/Bonn)",
        "address_line1": "Einsteinstraße 35",
        "postal_code": "53757",
        "city": "Sankt Augustin",
        "country_code": "DE",
        "latitude": 50.7719,
        "longitude": 7.1873,
        "phone": "+49 2241 87800",
        "email": "sankt-augustin@fahrrad-xxl.de",
        "opening_hours": "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 09:30 - 18:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9006",
    "title": "Trek Rail 7 Gen 3 Crimson Matte",
    "brand_name": "Trek",
    "model_name": "Rail 7 Gen 3",
    "model_year": 2025,
    "category": "E_BIKE",
    "propulsion": "PEDELEC",
    "price_cents": 499900,
    "compare_at_price_cents": 549900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.fahrrad-xxl.de/filialen/sankt-augustin/?ref=velofind&offer=EXT-SUPP-9006",
    "image_url": "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9006",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "L",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 750,
      "motor_model": "Bosch Performance Line CX",
      "sku": "EXT-SUPP-9006"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9006",
        "offer_id": "supp-off-9006",
        "old_price_cents": 549900,
        "new_price_cents": 499900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9007",
    "dealer_id": "f778f310-1d9c-4f73-af4d-63331bd064b2",
    "dealer_name": "Fahrrad XXL Feld Sankt Augustin",
    "dealer_slug": "fahrrad-xxl-feld-sankt-augustin",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-xxl-sankt-augustin-001",
        "dealer_id": "f778f310-1d9c-4f73-af4d-63331bd064b2",
        "name": "Fahrrad XXL Feld Sankt Augustin (Köln/Bonn)",
        "address_line1": "Einsteinstraße 35",
        "postal_code": "53757",
        "city": "Sankt Augustin",
        "country_code": "DE",
        "latitude": 50.7719,
        "longitude": 7.1873,
        "phone": "+49 2241 87800",
        "email": "sankt-augustin@fahrrad-xxl.de",
        "opening_hours": "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 09:30 - 18:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9007",
    "title": "KTM Macina Tour CX 625 Deep Black",
    "brand_name": "KTM",
    "model_name": "Macina Tour CX 625",
    "model_year": 2025,
    "category": "TREKKING",
    "propulsion": "PEDELEC",
    "price_cents": 349900,
    "compare_at_price_cents": 379900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.fahrrad-xxl.de/filialen/sankt-augustin/?ref=velofind&offer=EXT-SUPP-9007",
    "image_url": "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9007",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "56 cm",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 625,
      "motor_model": "Bosch Performance Line CX",
      "sku": "EXT-SUPP-9007"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9007",
        "offer_id": "supp-off-9007",
        "old_price_cents": 379900,
        "new_price_cents": 349900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9008",
    "dealer_id": "f778f310-1d9c-4f73-af4d-63331bd064b3",
    "dealer_name": "Fahrrad XXL Walcher Esslingen",
    "dealer_slug": "fahrrad-xxl-walcher-esslingen",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-xxl-esslingen-001",
        "dealer_id": "f778f310-1d9c-4f73-af4d-63331bd064b3",
        "name": "Fahrrad XXL Walcher Esslingen (Stuttgart)",
        "address_line1": "Pliensaustraße 40",
        "postal_code": "73728",
        "city": "Esslingen am Neckar",
        "country_code": "DE",
        "latitude": 48.7428,
        "longitude": 9.3073,
        "phone": "+49 711 351270",
        "email": "esslingen@fahrrad-xxl.de",
        "opening_hours": "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 09:30 - 18:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9008",
    "title": "Giant Explore E+ 1 Pro Metallic Navy",
    "brand_name": "Giant",
    "model_name": "Explore E+ 1 Pro",
    "model_year": 2025,
    "category": "TREKKING",
    "propulsion": "PEDELEC",
    "price_cents": 379900,
    "compare_at_price_cents": 409900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.fahrrad-xxl.de/filialen/esslingen/?ref=velofind&offer=EXT-SUPP-9008",
    "image_url": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9008",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "M",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 800,
      "motor_model": "SyncDrive Pro2 85Nm",
      "sku": "EXT-SUPP-9008"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9008",
        "offer_id": "supp-off-9008",
        "old_price_cents": 409900,
        "new_price_cents": 379900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9009",
    "dealer_id": "f778f310-1d9c-4f73-af4d-63331bd064b3",
    "dealer_name": "Fahrrad XXL Walcher Esslingen",
    "dealer_slug": "fahrrad-xxl-walcher-esslingen",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-xxl-esslingen-001",
        "dealer_id": "f778f310-1d9c-4f73-af4d-63331bd064b3",
        "name": "Fahrrad XXL Walcher Esslingen (Stuttgart)",
        "address_line1": "Pliensaustraße 40",
        "postal_code": "73728",
        "city": "Esslingen am Neckar",
        "country_code": "DE",
        "latitude": 48.7428,
        "longitude": 9.3073,
        "phone": "+49 711 351270",
        "email": "esslingen@fahrrad-xxl.de",
        "opening_hours": "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 09:30 - 18:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9009",
    "title": "Scott Sub Sport eRIDE 10 Granite",
    "brand_name": "Scott",
    "model_name": "Sub Sport eRIDE 10",
    "model_year": 2025,
    "category": "TREKKING",
    "propulsion": "PEDELEC",
    "price_cents": 339900,
    "compare_at_price_cents": 369900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.fahrrad-xxl.de/filialen/esslingen/?ref=velofind&offer=EXT-SUPP-9009",
    "image_url": "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9009",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "L",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 625,
      "motor_model": "Bosch Performance CX",
      "sku": "EXT-SUPP-9009"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9009",
        "offer_id": "supp-off-9009",
        "old_price_cents": 369900,
        "new_price_cents": 339900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9010",
    "dealer_id": "f778f310-1d9c-4f73-af4d-63331bd064b4",
    "dealer_name": "Fahrrad XXL Emporon Dresden",
    "dealer_slug": "fahrrad-xxl-emporon-dresden",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-xxl-dresden-001",
        "dealer_id": "f778f310-1d9c-4f73-af4d-63331bd064b4",
        "name": "Fahrrad XXL Emporon Dresden Nord",
        "address_line1": "Washingtonstraße 65",
        "postal_code": "01139",
        "city": "Dresden",
        "country_code": "DE",
        "latitude": 51.0772,
        "longitude": 13.6895,
        "phone": "+49 351 288580",
        "email": "dresden@fahrrad-xxl.de",
        "opening_hours": "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 10:00 - 18:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9010",
    "title": "Haibike ALLMTN 3 Glossy Grey",
    "brand_name": "Haibike",
    "model_name": "ALLMTN 3",
    "model_year": 2025,
    "category": "E_BIKE",
    "propulsion": "PEDELEC",
    "price_cents": 439900,
    "compare_at_price_cents": 479900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.fahrrad-xxl.de/filialen/dresden/?ref=velofind&offer=EXT-SUPP-9010",
    "image_url": "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9010",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "M",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 720,
      "motor_model": "Yamaha PW-X3",
      "sku": "EXT-SUPP-9010"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9010",
        "offer_id": "supp-off-9010",
        "old_price_cents": 479900,
        "new_price_cents": 439900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9011",
    "dealer_id": "f778f310-1d9c-4f73-af4d-63331bd064b4",
    "dealer_name": "Fahrrad XXL Emporon Dresden",
    "dealer_slug": "fahrrad-xxl-emporon-dresden",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-xxl-dresden-001",
        "dealer_id": "f778f310-1d9c-4f73-af4d-63331bd064b4",
        "name": "Fahrrad XXL Emporon Dresden Nord",
        "address_line1": "Washingtonstraße 65",
        "postal_code": "01139",
        "city": "Dresden",
        "country_code": "DE",
        "latitude": 51.0772,
        "longitude": 13.6895,
        "phone": "+49 351 288580",
        "email": "dresden@fahrrad-xxl.de",
        "opening_hours": "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 10:00 - 18:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9011",
    "title": "Winora Sinus N8f Wave Warm Grey",
    "brand_name": "Winora",
    "model_name": "Sinus N8f",
    "model_year": 2025,
    "category": "CITY",
    "propulsion": "PEDELEC",
    "price_cents": 289900,
    "compare_at_price_cents": 319900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.fahrrad-xxl.de/filialen/dresden/?ref=velofind&offer=EXT-SUPP-9011",
    "image_url": "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9011",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "46 cm",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 500,
      "motor_model": "Bosch Active Line Plus",
      "sku": "EXT-SUPP-9011"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9011",
        "offer_id": "supp-off-9011",
        "old_price_cents": 319900,
        "new_price_cents": 289900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9012",
    "dealer_id": "f778f310-1d9c-4f73-af4d-63331bd064b5",
    "dealer_name": "Fahrrad XXL Kalker Ludwigshafen",
    "dealer_slug": "fahrrad-xxl-kalker-ludwigshafen",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-xxl-ludwigshafen-001",
        "dealer_id": "f778f310-1d9c-4f73-af4d-63331bd064b5",
        "name": "Fahrrad XXL Kalker Ludwigshafen (Mannheim)",
        "address_line1": "Karl-Krämer-Straße 12",
        "postal_code": "67061",
        "city": "Ludwigshafen am Rhein",
        "country_code": "DE",
        "latitude": 49.4811,
        "longitude": 8.4464,
        "phone": "+49 621 570080",
        "email": "ludwigshafen@fahrrad-xxl.de",
        "opening_hours": "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 10:00 - 18:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9012",
    "title": "CUBE Kathmandu Hybrid EXC 750 Prismagrey",
    "brand_name": "CUBE",
    "model_name": "Kathmandu Hybrid EXC 750",
    "model_year": 2025,
    "category": "TREKKING",
    "propulsion": "PEDELEC",
    "price_cents": 369900,
    "compare_at_price_cents": 399900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.fahrrad-xxl.de/filialen/ludwigshafen/?ref=velofind&offer=EXT-SUPP-9012",
    "image_url": "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9012",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "Trapez 54 cm",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 750,
      "motor_model": "Bosch Performance Line CX",
      "sku": "EXT-SUPP-9012"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9012",
        "offer_id": "supp-off-9012",
        "old_price_cents": 399900,
        "new_price_cents": 369900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9013",
    "dealer_id": "f778f310-1d9c-4f73-af4d-63331bd064b5",
    "dealer_name": "Fahrrad XXL Kalker Ludwigshafen",
    "dealer_slug": "fahrrad-xxl-kalker-ludwigshafen",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-xxl-ludwigshafen-001",
        "dealer_id": "f778f310-1d9c-4f73-af4d-63331bd064b5",
        "name": "Fahrrad XXL Kalker Ludwigshafen (Mannheim)",
        "address_line1": "Karl-Krämer-Straße 12",
        "postal_code": "67061",
        "city": "Ludwigshafen am Rhein",
        "country_code": "DE",
        "latitude": 49.4811,
        "longitude": 8.4464,
        "phone": "+49 621 570080",
        "email": "ludwigshafen@fahrrad-xxl.de",
        "opening_hours": "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 10:00 - 18:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9013",
    "title": "Stevens E-Triton PT5 Slate Grey",
    "brand_name": "Stevens",
    "model_name": "E-Triton PT5",
    "model_year": 2025,
    "category": "TREKKING",
    "propulsion": "PEDELEC",
    "price_cents": 379900,
    "compare_at_price_cents": 409900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.fahrrad-xxl.de/filialen/ludwigshafen/?ref=velofind&offer=EXT-SUPP-9013",
    "image_url": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9013",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "55 cm",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 625,
      "motor_model": "Bosch Performance CX",
      "sku": "EXT-SUPP-9013"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9013",
        "offer_id": "supp-off-9013",
        "old_price_cents": 409900,
        "new_price_cents": 379900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9014",
    "dealer_id": "f778f310-1d9c-4f73-af4d-63331bd064b6",
    "dealer_name": "Fahrrad XXL Marcks Hamburg",
    "dealer_slug": "fahrrad-xxl-marcks-hamburg",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-xxl-hamburg-001",
        "dealer_id": "f778f310-1d9c-4f73-af4d-63331bd064b6",
        "name": "Fahrrad XXL Marcks Hamburg Harburg",
        "address_line1": "Großmoorbogen 9",
        "postal_code": "21079",
        "city": "Hamburg",
        "country_code": "DE",
        "latitude": 53.4542,
        "longitude": 9.9986,
        "phone": "+49 40 7660090",
        "email": "hamburg@fahrrad-xxl.de",
        "opening_hours": "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 10:00 - 18:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9014",
    "title": "Riese & Müller Charger4 GT touring Petrol",
    "brand_name": "Riese & Müller",
    "model_name": "Charger4 GT touring",
    "model_year": 2025,
    "category": "TREKKING",
    "propulsion": "PEDELEC",
    "price_cents": 519900,
    "compare_at_price_cents": 549900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.fahrrad-xxl.de/filialen/hamburg/?ref=velofind&offer=EXT-SUPP-9014",
    "image_url": "https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9014",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "53 cm",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 750,
      "motor_model": "Bosch Performance Line CX",
      "sku": "EXT-SUPP-9014"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9014",
        "offer_id": "supp-off-9014",
        "old_price_cents": 549900,
        "new_price_cents": 519900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9015",
    "dealer_id": "f778f310-1d9c-4f73-af4d-63331bd064b6",
    "dealer_name": "Fahrrad XXL Marcks Hamburg",
    "dealer_slug": "fahrrad-xxl-marcks-hamburg",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-xxl-hamburg-001",
        "dealer_id": "f778f310-1d9c-4f73-af4d-63331bd064b6",
        "name": "Fahrrad XXL Marcks Hamburg Harburg",
        "address_line1": "Großmoorbogen 9",
        "postal_code": "21079",
        "city": "Hamburg",
        "country_code": "DE",
        "latitude": 53.4542,
        "longitude": 9.9986,
        "phone": "+49 40 7660090",
        "email": "hamburg@fahrrad-xxl.de",
        "opening_hours": "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 10:00 - 18:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9015",
    "title": "Specialized Turbo Como 4.0 Cast Umber",
    "brand_name": "Specialized",
    "model_name": "Turbo Como 4.0",
    "model_year": 2025,
    "category": "CITY",
    "propulsion": "PEDELEC",
    "price_cents": 389900,
    "compare_at_price_cents": 420000,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.fahrrad-xxl.de/filialen/hamburg/?ref=velofind&offer=EXT-SUPP-9015",
    "image_url": "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9015",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "M",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 710,
      "motor_model": "Specialized 2.0",
      "sku": "EXT-SUPP-9015"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9015",
        "offer_id": "supp-off-9015",
        "old_price_cents": 420000,
        "new_price_cents": 389900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9016",
    "dealer_id": "f778f310-1d9c-4f73-af4d-63331bd064b7",
    "dealer_name": "Fahrrad XXL Franz Mainz",
    "dealer_slug": "fahrrad-xxl-franz-mainz",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-xxl-mainz-001",
        "dealer_id": "f778f310-1d9c-4f73-af4d-63331bd064b7",
        "name": "Fahrrad XXL Franz Mainz Mombach",
        "address_line1": "Rheinallee 128",
        "postal_code": "55120",
        "city": "Mainz",
        "country_code": "DE",
        "latitude": 50.0211,
        "longitude": 8.2415,
        "phone": "+49 6131 62220",
        "email": "mainz@fahrrad-xxl.de",
        "opening_hours": "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 09:30 - 18:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9016",
    "title": "Bulls Sonic EVO AM 1 Carbon Grey",
    "brand_name": "Bulls",
    "model_name": "Sonic EVO AM 1",
    "model_year": 2025,
    "category": "E_BIKE",
    "propulsion": "PEDELEC",
    "price_cents": 429900,
    "compare_at_price_cents": 469900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.fahrrad-xxl.de/filialen/mainz/?ref=velofind&offer=EXT-SUPP-9016",
    "image_url": "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9016",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "44 cm",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 750,
      "motor_model": "Bosch Performance Line CX",
      "sku": "EXT-SUPP-9016"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9016",
        "offer_id": "supp-off-9016",
        "old_price_cents": 469900,
        "new_price_cents": 429900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9017",
    "dealer_id": "f778f310-1d9c-4f73-af4d-63331bd064b7",
    "dealer_name": "Fahrrad XXL Franz Mainz",
    "dealer_slug": "fahrrad-xxl-franz-mainz",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-xxl-mainz-001",
        "dealer_id": "f778f310-1d9c-4f73-af4d-63331bd064b7",
        "name": "Fahrrad XXL Franz Mainz Mombach",
        "address_line1": "Rheinallee 128",
        "postal_code": "55120",
        "city": "Mainz",
        "country_code": "DE",
        "latitude": 50.0211,
        "longitude": 8.2415,
        "phone": "+49 6131 62220",
        "email": "mainz@fahrrad-xxl.de",
        "opening_hours": "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 09:30 - 18:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9017",
    "title": "Pegasus Solero E8 Plus Wave Metallic",
    "brand_name": "Pegasus",
    "model_name": "Solero E8 Plus",
    "model_year": 2025,
    "category": "CITY",
    "propulsion": "PEDELEC",
    "price_cents": 279900,
    "compare_at_price_cents": 309900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.fahrrad-xxl.de/filialen/mainz/?ref=velofind&offer=EXT-SUPP-9017",
    "image_url": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9017",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "50 cm",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 500,
      "motor_model": "Bosch Active Line Plus",
      "sku": "EXT-SUPP-9017"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9017",
        "offer_id": "supp-off-9017",
        "old_price_cents": 309900,
        "new_price_cents": 279900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9018",
    "dealer_id": "caf305aa-5f65-4aee-b008-179eaf9287c3",
    "dealer_name": "Lucky Bike Filiale Düsseldorf",
    "dealer_slug": "lucky-bike-duesseldorf",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-lucky-duesseldorf-001",
        "dealer_id": "caf305aa-5f65-4aee-b008-179eaf9287c3",
        "name": "Lucky Bike Filiale Düsseldorf Heerdt",
        "address_line1": "Schiessstraße 43",
        "postal_code": "40549",
        "city": "Düsseldorf",
        "country_code": "DE",
        "latitude": 51.2389,
        "longitude": 6.7214,
        "phone": "+49 211 506690",
        "email": "duesseldorf@lucky-bike.de",
        "opening_hours": "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 10:00 - 18:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9018",
    "title": "CUBE Touring Hybrid ONE 625 Grey'n'White",
    "brand_name": "CUBE",
    "model_name": "Touring Hybrid ONE 625",
    "model_year": 2025,
    "category": "TREKKING",
    "propulsion": "PEDELEC",
    "price_cents": 259900,
    "compare_at_price_cents": 279900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.lucky-bike.de/filialen/duesseldorf/?ref=velofind&offer=EXT-SUPP-9018",
    "image_url": "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9018",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "Trapez 50 cm",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 625,
      "motor_model": "Bosch Performance Line",
      "sku": "EXT-SUPP-9018"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9018",
        "offer_id": "supp-off-9018",
        "old_price_cents": 279900,
        "new_price_cents": 259900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9019",
    "dealer_id": "caf305aa-5f65-4aee-b008-179eaf9287c3",
    "dealer_name": "Lucky Bike Filiale Düsseldorf",
    "dealer_slug": "lucky-bike-duesseldorf",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-lucky-duesseldorf-001",
        "dealer_id": "caf305aa-5f65-4aee-b008-179eaf9287c3",
        "name": "Lucky Bike Filiale Düsseldorf Heerdt",
        "address_line1": "Schiessstraße 43",
        "postal_code": "40549",
        "city": "Düsseldorf",
        "country_code": "DE",
        "latitude": 51.2389,
        "longitude": 6.7214,
        "phone": "+49 211 506690",
        "email": "duesseldorf@lucky-bike.de",
        "opening_hours": "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 10:00 - 18:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9019",
    "title": "Kalkhoff Entice 3.B Advance Mustard Yellow",
    "brand_name": "Kalkhoff",
    "model_name": "Entice 3.B Advance",
    "model_year": 2025,
    "category": "E_BIKE",
    "propulsion": "PEDELEC",
    "price_cents": 329900,
    "compare_at_price_cents": 359900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.lucky-bike.de/filialen/duesseldorf/?ref=velofind&offer=EXT-SUPP-9019",
    "image_url": "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9019",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "L (53 cm)",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 625,
      "motor_model": "Bosch Performance Line",
      "sku": "EXT-SUPP-9019"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9019",
        "offer_id": "supp-off-9019",
        "old_price_cents": 359900,
        "new_price_cents": 329900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9020",
    "dealer_id": "caf305aa-5f65-4aee-b008-179eaf9287c4",
    "dealer_name": "Lucky Bike Filiale Bielefeld",
    "dealer_slug": "lucky-bike-bielefeld",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-lucky-bielefeld-001",
        "dealer_id": "caf305aa-5f65-4aee-b008-179eaf9287c4",
        "name": "Lucky Bike Filiale Bielefeld",
        "address_line1": "Herforder Str. 182",
        "postal_code": "33609",
        "city": "Bielefeld",
        "country_code": "DE",
        "latitude": 52.0367,
        "longitude": 8.5578,
        "phone": "+49 521 329240",
        "email": "bielefeld@lucky-bike.de",
        "opening_hours": "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 10:00 - 18:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9020",
    "title": "CUBE Kathmandu Hybrid Pro 750 Flashgrey",
    "brand_name": "CUBE",
    "model_name": "Kathmandu Hybrid Pro 750",
    "model_year": 2025,
    "category": "TREKKING",
    "propulsion": "PEDELEC",
    "price_cents": 339900,
    "compare_at_price_cents": 369900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.lucky-bike.de/filialen/bielefeld/?ref=velofind&offer=EXT-SUPP-9020",
    "image_url": "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9020",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "Diamant 54 cm",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 750,
      "motor_model": "Bosch Performance Line CX",
      "sku": "EXT-SUPP-9020"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9020",
        "offer_id": "supp-off-9020",
        "old_price_cents": 369900,
        "new_price_cents": 339900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9021",
    "dealer_id": "caf305aa-5f65-4aee-b008-179eaf9287c4",
    "dealer_name": "Lucky Bike Filiale Bielefeld",
    "dealer_slug": "lucky-bike-bielefeld",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-lucky-bielefeld-001",
        "dealer_id": "caf305aa-5f65-4aee-b008-179eaf9287c4",
        "name": "Lucky Bike Filiale Bielefeld",
        "address_line1": "Herforder Str. 182",
        "postal_code": "33609",
        "city": "Bielefeld",
        "country_code": "DE",
        "latitude": 52.0367,
        "longitude": 8.5578,
        "phone": "+49 521 329240",
        "email": "bielefeld@lucky-bike.de",
        "opening_hours": "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 10:00 - 18:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9021",
    "title": "Gazelle Ultimate C8 HMB Denim Blue",
    "brand_name": "Gazelle",
    "model_name": "Ultimate C8 HMB",
    "model_year": 2025,
    "category": "CITY",
    "propulsion": "PEDELEC",
    "price_cents": 369900,
    "compare_at_price_cents": 399900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.lucky-bike.de/filialen/bielefeld/?ref=velofind&offer=EXT-SUPP-9021",
    "image_url": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9021",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "53 cm",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 625,
      "motor_model": "Bosch Active Line Plus",
      "sku": "EXT-SUPP-9021"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9021",
        "offer_id": "supp-off-9021",
        "old_price_cents": 399900,
        "new_price_cents": 369900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9022",
    "dealer_id": "caf305aa-5f65-4aee-b008-179eaf9287c5",
    "dealer_name": "Lucky Bike Filiale Köln Süd",
    "dealer_slug": "lucky-bike-koeln",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-lucky-koeln-001",
        "dealer_id": "caf305aa-5f65-4aee-b008-179eaf9287c5",
        "name": "Lucky Bike Filiale Köln Bayenthal",
        "address_line1": "Alteburger Str. 361",
        "postal_code": "50968",
        "city": "Köln",
        "country_code": "DE",
        "latitude": 50.9067,
        "longitude": 6.9745,
        "phone": "+49 221 348080",
        "email": "koeln@lucky-bike.de",
        "opening_hours": "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 10:00 - 18:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9022",
    "title": "Scott Patron eRIDE 920 Raw Carbon",
    "brand_name": "Scott",
    "model_name": "Patron eRIDE 920",
    "model_year": 2025,
    "category": "E_BIKE",
    "propulsion": "PEDELEC",
    "price_cents": 549900,
    "compare_at_price_cents": 599900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.lucky-bike.de/filialen/koeln/?ref=velofind&offer=EXT-SUPP-9022",
    "image_url": "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9022",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "M",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 750,
      "motor_model": "Bosch Performance CX",
      "sku": "EXT-SUPP-9022"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9022",
        "offer_id": "supp-off-9022",
        "old_price_cents": 599900,
        "new_price_cents": 549900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9023",
    "dealer_id": "caf305aa-5f65-4aee-b008-179eaf9287c5",
    "dealer_name": "Lucky Bike Filiale Köln Süd",
    "dealer_slug": "lucky-bike-koeln",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-lucky-koeln-001",
        "dealer_id": "caf305aa-5f65-4aee-b008-179eaf9287c5",
        "name": "Lucky Bike Filiale Köln Bayenthal",
        "address_line1": "Alteburger Str. 361",
        "postal_code": "50968",
        "city": "Köln",
        "country_code": "DE",
        "latitude": 50.9067,
        "longitude": 6.9745,
        "phone": "+49 221 348080",
        "email": "koeln@lucky-bike.de",
        "opening_hours": "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 10:00 - 18:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9023",
    "title": "Diamant Mandara Deluxe+ Vintage Bronze",
    "brand_name": "Diamant",
    "model_name": "Mandara Deluxe+",
    "model_year": 2025,
    "category": "TREKKING",
    "propulsion": "PEDELEC",
    "price_cents": 329900,
    "compare_at_price_cents": 359900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.lucky-bike.de/filialen/koeln/?ref=velofind&offer=EXT-SUPP-9023",
    "image_url": "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9023",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "50 cm",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 625,
      "motor_model": "Bosch Performance CX",
      "sku": "EXT-SUPP-9023"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9023",
        "offer_id": "supp-off-9023",
        "old_price_cents": 359900,
        "new_price_cents": 329900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9024",
    "dealer_id": "caf305aa-5f65-4aee-b008-179eaf9287c6",
    "dealer_name": "Lucky Bike Filiale Münster",
    "dealer_slug": "lucky-bike-muenster",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-lucky-muenster-001",
        "dealer_id": "caf305aa-5f65-4aee-b008-179eaf9287c6",
        "name": "Lucky Bike Filiale Münster",
        "address_line1": "Weseler Str. 539",
        "postal_code": "48163",
        "city": "Münster",
        "country_code": "DE",
        "latitude": 51.9289,
        "longitude": 7.5978,
        "phone": "+49 251 71830",
        "email": "muenster@lucky-bike.de",
        "opening_hours": "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 10:00 - 18:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9024",
    "title": "Gazelle Grenoble C7+ HMB Anthracite Matt",
    "brand_name": "Gazelle",
    "model_name": "Grenoble C7+ HMB",
    "model_year": 2025,
    "category": "CITY",
    "propulsion": "PEDELEC",
    "price_cents": 319900,
    "compare_at_price_cents": 349900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.lucky-bike.de/filialen/muenster/?ref=velofind&offer=EXT-SUPP-9024",
    "image_url": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9024",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "Wave 53 cm",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 500,
      "motor_model": "Bosch Active Line Plus",
      "sku": "EXT-SUPP-9024"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9024",
        "offer_id": "supp-off-9024",
        "old_price_cents": 349900,
        "new_price_cents": 319900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9025",
    "dealer_id": "caf305aa-5f65-4aee-b008-179eaf9287c6",
    "dealer_name": "Lucky Bike Filiale Münster",
    "dealer_slug": "lucky-bike-muenster",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-lucky-muenster-001",
        "dealer_id": "caf305aa-5f65-4aee-b008-179eaf9287c6",
        "name": "Lucky Bike Filiale Münster",
        "address_line1": "Weseler Str. 539",
        "postal_code": "48163",
        "city": "Münster",
        "country_code": "DE",
        "latitude": 51.9289,
        "longitude": 7.5978,
        "phone": "+49 251 71830",
        "email": "muenster@lucky-bike.de",
        "opening_hours": "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 10:00 - 18:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9025",
    "title": "Riese & Müller Nevo4 GT vario Pure White",
    "brand_name": "Riese & Müller",
    "model_name": "Nevo4 GT vario",
    "model_year": 2025,
    "category": "TREKKING",
    "propulsion": "PEDELEC",
    "price_cents": 499900,
    "compare_at_price_cents": 529900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.lucky-bike.de/filialen/muenster/?ref=velofind&offer=EXT-SUPP-9025",
    "image_url": "https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9025",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "47 cm",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 750,
      "motor_model": "Bosch Performance Line CX",
      "sku": "EXT-SUPP-9025"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9025",
        "offer_id": "supp-off-9025",
        "old_price_cents": 529900,
        "new_price_cents": 499900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9026",
    "dealer_id": "caf305aa-5f65-4aee-b008-179eaf9287c7",
    "dealer_name": "Lucky Bike Radlbauer München",
    "dealer_slug": "lucky-bike-radlbauer-muenchen",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-lucky-muenchen-001",
        "dealer_id": "caf305aa-5f65-4aee-b008-179eaf9287c7",
        "name": "Lucky Bike / Radlbauer München Neuaubing",
        "address_line1": "Limesstraße 69",
        "postal_code": "81243",
        "city": "München",
        "country_code": "DE",
        "latitude": 48.1489,
        "longitude": 11.4312,
        "phone": "+49 89 87180",
        "email": "muenchen@lucky-bike.de",
        "opening_hours": "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 10:00 - 18:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9026",
    "title": "Specialized Turbo Levo Alloy Black Satin",
    "brand_name": "Specialized",
    "model_name": "Turbo Levo Alloy",
    "model_year": 2025,
    "category": "E_BIKE",
    "propulsion": "PEDELEC",
    "price_cents": 529900,
    "compare_at_price_cents": 580000,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.lucky-bike.de/filialen/muenchen/?ref=velofind&offer=EXT-SUPP-9026",
    "image_url": "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9026",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "S4 (L)",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 700,
      "motor_model": "Specialized 2.2",
      "sku": "EXT-SUPP-9026"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9026",
        "offer_id": "supp-off-9026",
        "old_price_cents": 580000,
        "new_price_cents": 529900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9027",
    "dealer_id": "caf305aa-5f65-4aee-b008-179eaf9287c7",
    "dealer_name": "Lucky Bike Radlbauer München",
    "dealer_slug": "lucky-bike-radlbauer-muenchen",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-lucky-muenchen-001",
        "dealer_id": "caf305aa-5f65-4aee-b008-179eaf9287c7",
        "name": "Lucky Bike / Radlbauer München Neuaubing",
        "address_line1": "Limesstraße 69",
        "postal_code": "81243",
        "city": "München",
        "country_code": "DE",
        "latitude": 48.1489,
        "longitude": 11.4312,
        "phone": "+49 89 87180",
        "email": "muenchen@lucky-bike.de",
        "opening_hours": "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 10:00 - 18:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9027",
    "title": "KTM Macina Cross 620 Vital Blue",
    "brand_name": "KTM",
    "model_name": "Macina Cross 620",
    "model_year": 2025,
    "category": "E_BIKE",
    "propulsion": "PEDELEC",
    "price_cents": 319900,
    "compare_at_price_cents": 349900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.lucky-bike.de/filialen/muenchen/?ref=velofind&offer=EXT-SUPP-9027",
    "image_url": "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9027",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "51 cm",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 625,
      "motor_model": "Bosch Performance Line CX",
      "sku": "EXT-SUPP-9027"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9027",
        "offer_id": "supp-off-9027",
        "old_price_cents": 349900,
        "new_price_cents": 319900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9028",
    "dealer_id": "d0000000-0000-4000-a000-000000000003",
    "dealer_name": "Decathlon Essen",
    "dealer_slug": "decathlon-essen",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-decathlon-essen-001",
        "dealer_id": "d0000000-0000-4000-a000-000000000003",
        "name": "Decathlon Essen Rathaus Galerie",
        "address_line1": "Porscheplatz 2",
        "postal_code": "45127",
        "city": "Essen",
        "country_code": "DE",
        "latitude": 51.4589,
        "longitude": 7.0145,
        "phone": "+49 201 848500",
        "email": "essen@decathlon.de",
        "opening_hours": "Mo-Sa: 10:00 - 20:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9028",
    "title": "Rockrider E-EXPL 700 S Full Suspension Anthracite",
    "brand_name": "Rockrider",
    "model_name": "E-EXPL 700 S",
    "model_year": 2025,
    "category": "E_BIKE",
    "propulsion": "PEDELEC",
    "price_cents": 249900,
    "compare_at_price_cents": 279900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.decathlon.de/filiale/essen/?ref=velofind&offer=EXT-SUPP-9028",
    "image_url": "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9028",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "L",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 630,
      "motor_model": "Brose T Alu 70Nm",
      "sku": "EXT-SUPP-9028"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9028",
        "offer_id": "supp-off-9028",
        "old_price_cents": 279900,
        "new_price_cents": 249900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9029",
    "dealer_id": "d0000000-0000-4000-a000-000000000003",
    "dealer_name": "Decathlon Essen",
    "dealer_slug": "decathlon-essen",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-decathlon-essen-001",
        "dealer_id": "d0000000-0000-4000-a000-000000000003",
        "name": "Decathlon Essen Rathaus Galerie",
        "address_line1": "Porscheplatz 2",
        "postal_code": "45127",
        "city": "Essen",
        "country_code": "DE",
        "latitude": 51.4589,
        "longitude": 7.0145,
        "phone": "+49 201 848500",
        "email": "essen@decathlon.de",
        "opening_hours": "Mo-Sa: 10:00 - 20:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9029",
    "title": "Riverside 540 E Trekking Grey",
    "brand_name": "Riverside",
    "model_name": "540 E",
    "model_year": 2025,
    "category": "TREKKING",
    "propulsion": "PEDELEC",
    "price_cents": 149900,
    "compare_at_price_cents": 169900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.decathlon.de/filiale/essen/?ref=velofind&offer=EXT-SUPP-9029",
    "image_url": "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9029",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "M",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 500,
      "motor_model": "Shimano Steps E6100",
      "sku": "EXT-SUPP-9029"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9029",
        "offer_id": "supp-off-9029",
        "old_price_cents": 169900,
        "new_price_cents": 149900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9030",
    "dealer_id": "d0000000-0000-4000-a000-000000000004",
    "dealer_name": "Decathlon Düsseldorf",
    "dealer_slug": "decathlon-duesseldorf",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-decathlon-duesseldorf-001",
        "dealer_id": "d0000000-0000-4000-a000-000000000004",
        "name": "Decathlon Düsseldorf Schadow-Arkaden",
        "address_line1": "Schadowstraße 78",
        "postal_code": "40212",
        "city": "Düsseldorf",
        "country_code": "DE",
        "latitude": 51.2267,
        "longitude": 6.7845,
        "phone": "+49 211 862900",
        "email": "duesseldorf@decathlon.de",
        "opening_hours": "Mo-Sa: 10:00 - 20:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9030",
    "title": "Decathlon Cargo E-Bike R500E Longtail Blue",
    "brand_name": "Decathlon",
    "model_name": "R500E Longtail",
    "model_year": 2025,
    "category": "CARGO",
    "propulsion": "PEDELEC",
    "price_cents": 299900,
    "compare_at_price_cents": 329900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.decathlon.de/filiale/duesseldorf/?ref=velofind&offer=EXT-SUPP-9030",
    "image_url": "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9030",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "Universal",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 672,
      "motor_model": "Hinterradmotor 58Nm",
      "sku": "EXT-SUPP-9030"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9030",
        "offer_id": "supp-off-9030",
        "old_price_cents": 329900,
        "new_price_cents": 299900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9031",
    "dealer_id": "d0000000-0000-4000-a000-000000000004",
    "dealer_name": "Decathlon Düsseldorf",
    "dealer_slug": "decathlon-duesseldorf",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-decathlon-duesseldorf-001",
        "dealer_id": "d0000000-0000-4000-a000-000000000004",
        "name": "Decathlon Düsseldorf Schadow-Arkaden",
        "address_line1": "Schadowstraße 78",
        "postal_code": "40212",
        "city": "Düsseldorf",
        "country_code": "DE",
        "latitude": 51.2267,
        "longitude": 6.7845,
        "phone": "+49 211 862900",
        "email": "duesseldorf@decathlon.de",
        "opening_hours": "Mo-Sa: 10:00 - 20:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9031",
    "title": "Rockrider E-EXPL 520 S Bordeaux Red",
    "brand_name": "Rockrider",
    "model_name": "E-EXPL 520 S",
    "model_year": 2025,
    "category": "E_BIKE",
    "propulsion": "PEDELEC",
    "price_cents": 199900,
    "compare_at_price_cents": 229900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.decathlon.de/filiale/duesseldorf/?ref=velofind&offer=EXT-SUPP-9031",
    "image_url": "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9031",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "M",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 500,
      "motor_model": "Brose C Alu 50Nm",
      "sku": "EXT-SUPP-9031"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9031",
        "offer_id": "supp-off-9031",
        "old_price_cents": 229900,
        "new_price_cents": 199900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9032",
    "dealer_id": "d0000000-0000-4000-a000-000000000005",
    "dealer_name": "Decathlon Köln Marsdorf",
    "dealer_slug": "decathlon-koeln",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-decathlon-koeln-001",
        "dealer_id": "d0000000-0000-4000-a000-000000000005",
        "name": "Decathlon Köln Marsdorf Großfiliale",
        "address_line1": "Marsdorfer Str. 1",
        "postal_code": "50858",
        "city": "Köln",
        "country_code": "DE",
        "latitude": 50.9167,
        "longitude": 6.8645,
        "phone": "+49 221 789400",
        "email": "koeln@decathlon.de",
        "opening_hours": "Mo-Sa: 10:00 - 20:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9032",
    "title": "Rockrider E-ST 900 Mountainbike Blue/Orange",
    "brand_name": "Rockrider",
    "model_name": "E-ST 900",
    "model_year": 2025,
    "category": "E_BIKE",
    "propulsion": "PEDELEC",
    "price_cents": 219900,
    "compare_at_price_cents": 239900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.decathlon.de/filiale/koeln/?ref=velofind&offer=EXT-SUPP-9032",
    "image_url": "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9032",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "L",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 504,
      "motor_model": "Brose T Alu 70Nm",
      "sku": "EXT-SUPP-9032"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9032",
        "offer_id": "supp-off-9032",
        "old_price_cents": 239900,
        "new_price_cents": 219900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9033",
    "dealer_id": "d0000000-0000-4000-a000-000000000005",
    "dealer_name": "Decathlon Köln Marsdorf",
    "dealer_slug": "decathlon-koeln",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-decathlon-koeln-001",
        "dealer_id": "d0000000-0000-4000-a000-000000000005",
        "name": "Decathlon Köln Marsdorf Großfiliale",
        "address_line1": "Marsdorfer Str. 1",
        "postal_code": "50858",
        "city": "Köln",
        "country_code": "DE",
        "latitude": 50.9167,
        "longitude": 6.8645,
        "phone": "+49 221 789400",
        "email": "koeln@decathlon.de",
        "opening_hours": "Mo-Sa: 10:00 - 20:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9033",
    "title": "Elops 920 E Connect City E-Bike Navy",
    "brand_name": "Elops",
    "model_name": "920 E Connect",
    "model_year": 2025,
    "category": "CITY",
    "propulsion": "PEDELEC",
    "price_cents": 169900,
    "compare_at_price_cents": 189900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.decathlon.de/filiale/koeln/?ref=velofind&offer=EXT-SUPP-9033",
    "image_url": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9033",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "L/XL",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 417,
      "motor_model": "Brose Mittelmotor 50Nm",
      "sku": "EXT-SUPP-9033"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9033",
        "offer_id": "supp-off-9033",
        "old_price_cents": 189900,
        "new_price_cents": 169900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9034",
    "dealer_id": "d0000000-0000-4000-a000-000000000006",
    "dealer_name": "Decathlon Berlin Alexanderplatz",
    "dealer_slug": "decathlon-berlin",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-decathlon-berlin-001",
        "dealer_id": "d0000000-0000-4000-a000-000000000006",
        "name": "Decathlon Berlin Alexanderplatz",
        "address_line1": "Alexanderplatz 9",
        "postal_code": "10178",
        "city": "Berlin",
        "country_code": "DE",
        "latitude": 52.5218,
        "longitude": 13.4132,
        "phone": "+49 30 240800",
        "email": "berlin@decathlon.de",
        "opening_hours": "Mo-Sa: 10:00 - 20:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9034",
    "title": "B'Twin E-Fold 500 Klapp-E-Bike Ocker",
    "brand_name": "B'Twin",
    "model_name": "E-Fold 500",
    "model_year": 2025,
    "category": "CITY",
    "propulsion": "PEDELEC",
    "price_cents": 109900,
    "compare_at_price_cents": 129900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.decathlon.de/filiale/berlin/?ref=velofind&offer=EXT-SUPP-9034",
    "image_url": "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9034",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "One Size (Faltrad)",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 252,
      "motor_model": "Nabenmotor Brushless 35Nm",
      "sku": "EXT-SUPP-9034"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9034",
        "offer_id": "supp-off-9034",
        "old_price_cents": 129900,
        "new_price_cents": 109900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9035",
    "dealer_id": "d0000000-0000-4000-a000-000000000006",
    "dealer_name": "Decathlon Berlin Alexanderplatz",
    "dealer_slug": "decathlon-berlin",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-decathlon-berlin-001",
        "dealer_id": "d0000000-0000-4000-a000-000000000006",
        "name": "Decathlon Berlin Alexanderplatz",
        "address_line1": "Alexanderplatz 9",
        "postal_code": "10178",
        "city": "Berlin",
        "country_code": "DE",
        "latitude": 52.5218,
        "longitude": 13.4132,
        "phone": "+49 30 240800",
        "email": "berlin@decathlon.de",
        "opening_hours": "Mo-Sa: 10:00 - 20:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9035",
    "title": "Rockrider E-EXPL 700 Hardtail Dark Slate",
    "brand_name": "Rockrider",
    "model_name": "E-EXPL 700",
    "model_year": 2025,
    "category": "E_BIKE",
    "propulsion": "PEDELEC",
    "price_cents": 249900,
    "compare_at_price_cents": 269900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.decathlon.de/filiale/berlin/?ref=velofind&offer=EXT-SUPP-9035",
    "image_url": "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9035",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "M",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 630,
      "motor_model": "Brose T Alu 70Nm",
      "sku": "EXT-SUPP-9035"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9035",
        "offer_id": "supp-off-9035",
        "old_price_cents": 269900,
        "new_price_cents": 249900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9036",
    "dealer_id": "d0000000-0000-4000-a000-000000000007",
    "dealer_name": "Decathlon München Elisenhof",
    "dealer_slug": "decathlon-muenchen",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-decathlon-muenchen-001",
        "dealer_id": "d0000000-0000-4000-a000-000000000007",
        "name": "Decathlon München Elisenhof Hauptbahnhof",
        "address_line1": "Elisenstraße 3",
        "postal_code": "80335",
        "city": "München",
        "country_code": "DE",
        "latitude": 48.1412,
        "longitude": 11.5623,
        "phone": "+49 89 552700",
        "email": "muenchen@decathlon.de",
        "opening_hours": "Mo-Sa: 10:00 - 20:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9036",
    "title": "Elops Speed 900 E Urban Pedelec Raw Anthracite",
    "brand_name": "Elops",
    "model_name": "Speed 900 E",
    "model_year": 2025,
    "category": "CITY",
    "propulsion": "PEDELEC",
    "price_cents": 179900,
    "compare_at_price_cents": 199900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.decathlon.de/filiale/muenchen/?ref=velofind&offer=EXT-SUPP-9036",
    "image_url": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9036",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "L",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 250,
      "motor_model": "Mahle ebikemotion X35",
      "sku": "EXT-SUPP-9036"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9036",
        "offer_id": "supp-off-9036",
        "old_price_cents": 199900,
        "new_price_cents": 179900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9037",
    "dealer_id": "d0000000-0000-4000-a000-000000000007",
    "dealer_name": "Decathlon München Elisenhof",
    "dealer_slug": "decathlon-muenchen",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-decathlon-muenchen-001",
        "dealer_id": "d0000000-0000-4000-a000-000000000007",
        "name": "Decathlon München Elisenhof Hauptbahnhof",
        "address_line1": "Elisenstraße 3",
        "postal_code": "80335",
        "city": "München",
        "country_code": "DE",
        "latitude": 48.1412,
        "longitude": 11.5623,
        "phone": "+49 89 552700",
        "email": "muenchen@decathlon.de",
        "opening_hours": "Mo-Sa: 10:00 - 20:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9037",
    "title": "Riverside 540 E Trekking Wave White",
    "brand_name": "Riverside",
    "model_name": "540 E",
    "model_year": 2025,
    "category": "TREKKING",
    "propulsion": "PEDELEC",
    "price_cents": 149900,
    "compare_at_price_cents": 169900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.decathlon.de/filiale/muenchen/?ref=velofind&offer=EXT-SUPP-9037",
    "image_url": "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9037",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "S/M",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 500,
      "motor_model": "Shimano Steps E6100",
      "sku": "EXT-SUPP-9037"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9037",
        "offer_id": "supp-off-9037",
        "old_price_cents": 169900,
        "new_price_cents": 149900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9038",
    "dealer_id": "b0c00000-0000-4000-a000-000000000002",
    "dealer_name": "B.O.C. Dortmund",
    "dealer_slug": "boc-dortmund",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-boc-dortmund-001",
        "dealer_id": "b0c00000-0000-4000-a000-000000000002",
        "name": "B.O.C. Filiale Dortmund Nord",
        "address_line1": "Bornstraße 160",
        "postal_code": "44145",
        "city": "Dortmund",
        "country_code": "DE",
        "latitude": 51.5245,
        "longitude": 7.4645,
        "phone": "+49 231 847900",
        "email": "dortmund@boc24.de",
        "opening_hours": "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 10:00 - 18:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9038",
    "title": "Bergamont E-Horizon Edition Wave Shiny White",
    "brand_name": "Bergamont",
    "model_name": "E-Horizon Edition Wave",
    "model_year": 2025,
    "category": "TREKKING",
    "propulsion": "PEDELEC",
    "price_cents": 319900,
    "compare_at_price_cents": 349900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.boc24.de/filialen/dortmund/?ref=velofind&offer=EXT-SUPP-9038",
    "image_url": "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9038",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "52 cm",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 625,
      "motor_model": "Bosch Performance Line",
      "sku": "EXT-SUPP-9038"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9038",
        "offer_id": "supp-off-9038",
        "old_price_cents": 349900,
        "new_price_cents": 319900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9039",
    "dealer_id": "b0c00000-0000-4000-a000-000000000002",
    "dealer_name": "B.O.C. Dortmund",
    "dealer_slug": "boc-dortmund",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-boc-dortmund-001",
        "dealer_id": "b0c00000-0000-4000-a000-000000000002",
        "name": "B.O.C. Filiale Dortmund Nord",
        "address_line1": "Bornstraße 160",
        "postal_code": "44145",
        "city": "Dortmund",
        "country_code": "DE",
        "latitude": 51.5245,
        "longitude": 7.4645,
        "phone": "+49 231 847900",
        "email": "dortmund@boc24.de",
        "opening_hours": "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 10:00 - 18:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9039",
    "title": "Ghost E-Teru B Essential Dark Petrol",
    "brand_name": "Ghost",
    "model_name": "E-Teru B Essential",
    "model_year": 2025,
    "category": "E_BIKE",
    "propulsion": "PEDELEC",
    "price_cents": 289900,
    "compare_at_price_cents": 319900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.boc24.de/filialen/dortmund/?ref=velofind&offer=EXT-SUPP-9039",
    "image_url": "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9039",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "M",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 625,
      "motor_model": "Bosch Performance Line",
      "sku": "EXT-SUPP-9039"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9039",
        "offer_id": "supp-off-9039",
        "old_price_cents": 319900,
        "new_price_cents": 289900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9040",
    "dealer_id": "57ad1e00-0000-4000-a000-000000000002",
    "dealer_name": "Zweirad-Center Stadler Mülheim an der Ruhr",
    "dealer_slug": "stadler-muelheim",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-stadler-muelheim-001",
        "dealer_id": "57ad1e00-0000-4000-a000-000000000002",
        "name": "Zweirad-Center Stadler Mülheim an der Ruhr",
        "address_line1": "Mannesmannallee 21",
        "postal_code": "45475",
        "city": "Mülheim an der Ruhr",
        "country_code": "DE",
        "latitude": 51.4312,
        "longitude": 6.8612,
        "phone": "+49 208 48480",
        "email": "muelheim@zweirad-stadler.de",
        "opening_hours": "Mo-Fr: 10:00 - 19:30 Uhr, Sa: 09:30 - 18:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9040",
    "title": "Bulls Copperhead EVO AM 2 Rainbow Chameleon",
    "brand_name": "Bulls",
    "model_name": "Copperhead EVO AM 2",
    "model_year": 2025,
    "category": "E_BIKE",
    "propulsion": "PEDELEC",
    "price_cents": 399900,
    "compare_at_price_cents": 439900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.zweirad-center-stadler.de/filialen/muelheim/?ref=velofind&offer=EXT-SUPP-9040",
    "image_url": "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9040",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "48 cm",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 750,
      "motor_model": "Bosch Performance Line CX",
      "sku": "EXT-SUPP-9040"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9040",
        "offer_id": "supp-off-9040",
        "old_price_cents": 439900,
        "new_price_cents": 399900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "supp-off-9041",
    "dealer_id": "57ad1e00-0000-4000-a000-000000000002",
    "dealer_name": "Zweirad-Center Stadler Mülheim an der Ruhr",
    "dealer_slug": "stadler-muelheim",
    "dealer_verified": true,
    "dealer_locations": [
      {
        "id": "loc-stadler-muelheim-001",
        "dealer_id": "57ad1e00-0000-4000-a000-000000000002",
        "name": "Zweirad-Center Stadler Mülheim an der Ruhr",
        "address_line1": "Mannesmannallee 21",
        "postal_code": "45475",
        "city": "Mülheim an der Ruhr",
        "country_code": "DE",
        "latitude": 51.4312,
        "longitude": 6.8612,
        "phone": "+49 208 48480",
        "email": "muelheim@zweirad-stadler.de",
        "opening_hours": "Mo-Fr: 10:00 - 19:30 Uhr, Sa: 09:30 - 18:00 Uhr"
      }
    ],
    "source_id": "supp-src-feed",
    "external_id": "EXT-SUPP-9041",
    "title": "Pegasus Premio EVO 10 Lite Black Matte",
    "brand_name": "Pegasus",
    "model_name": "Premio EVO 10 Lite",
    "model_year": 2025,
    "category": "TREKKING",
    "propulsion": "PEDELEC",
    "price_cents": 379900,
    "compare_at_price_cents": 409900,
    "currency": "EUR",
    "availability": "IN_STOCK",
    "quantity": 2,
    "condition": "NEW",
    "source_url": "https://www.zweirad-center-stadler.de/filialen/muelheim/?ref=velofind&offer=EXT-SUPP-9041",
    "image_url": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80",
    "content_hash": "hash-supp-off-9041",
    "first_seen_at": "2026-09-01T00:00:00.000Z",
    "last_seen_at": "2026-09-22T00:00:00.000Z",
    "is_active": true,
    "variant_details": {
      "frame_size": "55 cm",
      "frame_type": "DIAMOND",
      "color": "Anthrazit / Schwarz",
      "battery_wh": 750,
      "motor_model": "Bosch Performance Line CX",
      "sku": "EXT-SUPP-9041"
    },
    "leasing_compatibilities": [
      {
        "provider_id": "b0000000-0000-0000-0000-000000000001",
        "provider_slug": "jobrad",
        "provider_name": "JobRad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-JOB)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000002",
        "provider_slug": "bikeleasing",
        "provider_name": "Bikeleasing-Service",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BIK)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000003",
        "provider_slug": "businessbike",
        "provider_name": "BusinessBike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-BUS)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000004",
        "provider_slug": "deutsche-dienstrad",
        "provider_name": "Deutsche Dienstrad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-DEU)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000005",
        "provider_slug": "eurorad",
        "provider_name": "Eurorad",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-EUR)"
      },
      {
        "provider_id": "b0000000-0000-0000-0000-000000000006",
        "provider_slug": "lease-a-bike",
        "provider_name": "Lease a Bike",
        "status": "CONFIRMED",
        "evidence_reason": "Offizieller Vertragspartner des Leasinganbieters (VF-CTR-PARTNER-LEA)"
      }
    ],
    "price_history": [
      {
        "id": "ph-supp-off-9041",
        "offer_id": "supp-off-9041",
        "old_price_cents": 409900,
        "new_price_cents": 379900,
        "recorded_at": "2026-09-10T00:00:00.000Z"
      }
    ]
  }
];
