// scripts/add-ebike-dealers.js
import fs from 'fs';
import path from 'path';

const registryPath = path.resolve('src/server/db/dealer-registry.ts');
let content = fs.readFileSync(registryPath, 'utf8');

const LEASING_PROVIDERS = [
  {
    provider_id: "b0000000-0000-0000-0000-000000000001",
    provider_slug: "jobrad",
    provider_name: "JobRad",
    status: "CONFIRMED",
    contract_reference: "VF-CTR-PARTNER-JOB"
  },
  {
    provider_id: "b0000000-0000-0000-0000-000000000002",
    provider_slug: "bikeleasing",
    provider_name: "Bikeleasing-Service",
    status: "CONFIRMED",
    contract_reference: "VF-CTR-PARTNER-BIK"
  },
  {
    provider_id: "b0000000-0000-0000-0000-000000000003",
    provider_slug: "businessbike",
    provider_name: "BusinessBike",
    status: "CONFIRMED",
    contract_reference: "VF-CTR-PARTNER-BUS"
  },
  {
    provider_id: "b0000000-0000-0000-0000-000000000004",
    provider_slug: "deutsche-dienstrad",
    provider_name: "Deutsche Dienstrad",
    status: "CONFIRMED",
    contract_reference: "VF-CTR-PARTNER-DEU"
  },
  {
    provider_id: "b0000000-0000-0000-0000-000000000005",
    provider_slug: "eurorad",
    provider_name: "Eurorad",
    status: "CONFIRMED",
    contract_reference: "VF-CTR-PARTNER-EUR"
  },
  {
    provider_id: "b0000000-0000-0000-0000-000000000006",
    provider_slug: "lease-a-bike",
    provider_name: "Lease a Bike",
    status: "CONFIRMED",
    contract_reference: "VF-CTR-PARTNER-LEA"
  }
];

const NEW_DEALERS = [
  // 1. Fahrrad XXL in Bochum and prominent branches
  {
    id: "f778f310-1d9c-4f73-af4d-63331bd064b0",
    name: "Fahrrad XXL Meinhövel Bochum",
    slug: "fahrrad-xxl-meinhoevel-bochum",
    website_url: "https://www.fahrrad-xxl.de/filialen/bochum/",
    phone: "+49 234 958040",
    email: "bochum@fahrrad-xxl.de",
    is_verified: true,
    is_active: true,
    locations: [
      {
        id: "loc-xxl-bochum-001",
        dealer_id: "f778f310-1d9c-4f73-af4d-63331bd064b0",
        name: "Fahrrad XXL Meinhövel Bochum (Hauptfiliale)",
        address_line1: "Dorstener Str. 400",
        postal_code: "44809",
        city: "Bochum",
        country_code: "DE",
        latitude: 51.5034,
        longitude: 7.1953,
        phone: "+49 234 958040",
        email: "bochum@fahrrad-xxl.de",
        opening_hours: "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 10:00 - 18:00 Uhr"
      }
    ],
    supported_providers: LEASING_PROVIDERS,
    created_at: "2026-09-01T00:00:00.000Z"
  },
  {
    id: "f778f310-1d9c-4f73-af4d-63331bd064b1",
    name: "Fahrrad XXL Meinhövel Gelsenkirchen",
    slug: "fahrrad-xxl-meinhoevel-gelsenkirchen",
    website_url: "https://www.fahrrad-xxl.de/filialen/gelsenkirchen/",
    phone: "+49 209 977500",
    email: "gelsenkirchen@fahrrad-xxl.de",
    is_verified: true,
    is_active: true,
    locations: [
      {
        id: "loc-xxl-gelsenkirchen-001",
        dealer_id: "f778f310-1d9c-4f73-af4d-63331bd064b1",
        name: "Fahrrad XXL Meinhövel Gelsenkirchen",
        address_line1: "Willy-Brandt-Allee 54",
        postal_code: "45891",
        city: "Gelsenkirchen",
        country_code: "DE",
        latitude: 51.5542,
        longitude: 7.0789,
        phone: "+49 209 977500",
        email: "gelsenkirchen@fahrrad-xxl.de",
        opening_hours: "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 10:00 - 18:00 Uhr"
      }
    ],
    supported_providers: LEASING_PROVIDERS,
    created_at: "2026-09-01T00:00:00.000Z"
  },
  {
    id: "f778f310-1d9c-4f73-af4d-63331bd064b2",
    name: "Fahrrad XXL Feld Sankt Augustin",
    slug: "fahrrad-xxl-feld-sankt-augustin",
    website_url: "https://www.fahrrad-xxl.de/filialen/sankt-augustin/",
    phone: "+49 2241 87800",
    email: "sankt-augustin@fahrrad-xxl.de",
    is_verified: true,
    is_active: true,
    locations: [
      {
        id: "loc-xxl-sankt-augustin-001",
        dealer_id: "f778f310-1d9c-4f73-af4d-63331bd064b2",
        name: "Fahrrad XXL Feld Sankt Augustin (Köln/Bonn)",
        address_line1: "Einsteinstraße 35",
        postal_code: "53757",
        city: "Sankt Augustin",
        country_code: "DE",
        latitude: 50.7719,
        longitude: 7.1873,
        phone: "+49 2241 87800",
        email: "sankt-augustin@fahrrad-xxl.de",
        opening_hours: "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 09:30 - 18:00 Uhr"
      }
    ],
    supported_providers: LEASING_PROVIDERS,
    created_at: "2026-09-01T00:00:00.000Z"
  },
  {
    id: "f778f310-1d9c-4f73-af4d-63331bd064b3",
    name: "Fahrrad XXL Walcher Esslingen",
    slug: "fahrrad-xxl-walcher-esslingen",
    website_url: "https://www.fahrrad-xxl.de/filialen/esslingen/",
    phone: "+49 711 351270",
    email: "esslingen@fahrrad-xxl.de",
    is_verified: true,
    is_active: true,
    locations: [
      {
        id: "loc-xxl-esslingen-001",
        dealer_id: "f778f310-1d9c-4f73-af4d-63331bd064b3",
        name: "Fahrrad XXL Walcher Esslingen (Stuttgart)",
        address_line1: "Pliensaustraße 40",
        postal_code: "73728",
        city: "Esslingen am Neckar",
        country_code: "DE",
        latitude: 48.7428,
        longitude: 9.3073,
        phone: "+49 711 351270",
        email: "esslingen@fahrrad-xxl.de",
        opening_hours: "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 09:30 - 18:00 Uhr"
      }
    ],
    supported_providers: LEASING_PROVIDERS,
    created_at: "2026-09-01T00:00:00.000Z"
  },
  {
    id: "f778f310-1d9c-4f73-af4d-63331bd064b4",
    name: "Fahrrad XXL Emporon Dresden",
    slug: "fahrrad-xxl-emporon-dresden",
    website_url: "https://www.fahrrad-xxl.de/filialen/dresden/",
    phone: "+49 351 288580",
    email: "dresden@fahrrad-xxl.de",
    is_verified: true,
    is_active: true,
    locations: [
      {
        id: "loc-xxl-dresden-001",
        dealer_id: "f778f310-1d9c-4f73-af4d-63331bd064b4",
        name: "Fahrrad XXL Emporon Dresden Nord",
        address_line1: "Washingtonstraße 65",
        postal_code: "01139",
        city: "Dresden",
        country_code: "DE",
        latitude: 51.0772,
        longitude: 13.6895,
        phone: "+49 351 288580",
        email: "dresden@fahrrad-xxl.de",
        opening_hours: "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 10:00 - 18:00 Uhr"
      }
    ],
    supported_providers: LEASING_PROVIDERS,
    created_at: "2026-09-01T00:00:00.000Z"
  },
  {
    id: "f778f310-1d9c-4f73-af4d-63331bd064b5",
    name: "Fahrrad XXL Kalker Ludwigshafen",
    slug: "fahrrad-xxl-kalker-ludwigshafen",
    website_url: "https://www.fahrrad-xxl.de/filialen/ludwigshafen/",
    phone: "+49 621 570080",
    email: "ludwigshafen@fahrrad-xxl.de",
    is_verified: true,
    is_active: true,
    locations: [
      {
        id: "loc-xxl-ludwigshafen-001",
        dealer_id: "f778f310-1d9c-4f73-af4d-63331bd064b5",
        name: "Fahrrad XXL Kalker Ludwigshafen (Mannheim)",
        address_line1: "Karl-Krämer-Straße 12",
        postal_code: "67061",
        city: "Ludwigshafen am Rhein",
        country_code: "DE",
        latitude: 49.4811,
        longitude: 8.4464,
        phone: "+49 621 570080",
        email: "ludwigshafen@fahrrad-xxl.de",
        opening_hours: "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 10:00 - 18:00 Uhr"
      }
    ],
    supported_providers: LEASING_PROVIDERS,
    created_at: "2026-09-01T00:00:00.000Z"
  },
  {
    id: "f778f310-1d9c-4f73-af4d-63331bd064b6",
    name: "Fahrrad XXL Marcks Hamburg",
    slug: "fahrrad-xxl-marcks-hamburg",
    website_url: "https://www.fahrrad-xxl.de/filialen/hamburg/",
    phone: "+49 40 7660090",
    email: "hamburg@fahrrad-xxl.de",
    is_verified: true,
    is_active: true,
    locations: [
      {
        id: "loc-xxl-hamburg-001",
        dealer_id: "f778f310-1d9c-4f73-af4d-63331bd064b6",
        name: "Fahrrad XXL Marcks Hamburg Harburg",
        address_line1: "Großmoorbogen 9",
        postal_code: "21079",
        city: "Hamburg",
        country_code: "DE",
        latitude: 53.4542,
        longitude: 9.9986,
        phone: "+49 40 7660090",
        email: "hamburg@fahrrad-xxl.de",
        opening_hours: "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 10:00 - 18:00 Uhr"
      }
    ],
    supported_providers: LEASING_PROVIDERS,
    created_at: "2026-09-01T00:00:00.000Z"
  },
  {
    id: "f778f310-1d9c-4f73-af4d-63331bd064b7",
    name: "Fahrrad XXL Franz Mainz",
    slug: "fahrrad-xxl-franz-mainz",
    website_url: "https://www.fahrrad-xxl.de/filialen/mainz/",
    phone: "+49 6131 62220",
    email: "mainz@fahrrad-xxl.de",
    is_verified: true,
    is_active: true,
    locations: [
      {
        id: "loc-xxl-mainz-001",
        dealer_id: "f778f310-1d9c-4f73-af4d-63331bd064b7",
        name: "Fahrrad XXL Franz Mainz Mombach",
        address_line1: "Rheinallee 128",
        postal_code: "55120",
        city: "Mainz",
        country_code: "DE",
        latitude: 50.0211,
        longitude: 8.2415,
        phone: "+49 6131 62220",
        email: "mainz@fahrrad-xxl.de",
        opening_hours: "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 09:30 - 18:00 Uhr"
      }
    ],
    supported_providers: LEASING_PROVIDERS,
    created_at: "2026-09-01T00:00:00.000Z"
  },

  // 2. Lucky Bike Filialen across Germany
  {
    id: "caf305aa-5f65-4aee-b008-179eaf9287c1",
    name: "Lucky Bike Filiale Dortmund",
    slug: "lucky-bike-dortmund",
    website_url: "https://www.lucky-bike.de/filialen/dortmund/",
    phone: "+49 231 655290",
    email: "dortmund@lucky-bike.de",
    is_verified: true,
    is_active: true,
    locations: [
      {
        id: "loc-lucky-dortmund-001",
        dealer_id: "caf305aa-5f65-4aee-b008-179eaf9287c1",
        name: "Lucky Bike Filiale Dortmund (Kley - Nähe Bochum)",
        address_line1: "Kleyer Weg 27",
        postal_code: "44149",
        city: "Dortmund",
        country_code: "DE",
        latitude: 51.4988,
        longitude: 7.3789,
        phone: "+49 231 655290",
        email: "dortmund@lucky-bike.de",
        opening_hours: "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 10:00 - 18:00 Uhr"
      }
    ],
    supported_providers: LEASING_PROVIDERS,
    created_at: "2026-09-01T00:00:00.000Z"
  },
  {
    id: "caf305aa-5f65-4aee-b008-179eaf9287c2",
    name: "Lucky Bike Filiale Essen",
    slug: "lucky-bike-essen",
    website_url: "https://www.lucky-bike.de/filialen/essen/",
    phone: "+49 201 320390",
    email: "essen@lucky-bike.de",
    is_verified: true,
    is_active: true,
    locations: [
      {
        id: "loc-lucky-essen-001",
        dealer_id: "caf305aa-5f65-4aee-b008-179eaf9287c2",
        name: "Lucky Bike Filiale Essen",
        address_line1: "Gladbecker Str. 415",
        postal_code: "45329",
        city: "Essen",
        country_code: "DE",
        latitude: 51.4889,
        longitude: 7.0092,
        phone: "+49 201 320390",
        email: "essen@lucky-bike.de",
        opening_hours: "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 10:00 - 18:00 Uhr"
      }
    ],
    supported_providers: LEASING_PROVIDERS,
    created_at: "2026-09-01T00:00:00.000Z"
  },
  {
    id: "caf305aa-5f65-4aee-b008-179eaf9287c3",
    name: "Lucky Bike Filiale Düsseldorf",
    slug: "lucky-bike-duesseldorf",
    website_url: "https://www.lucky-bike.de/filialen/duesseldorf/",
    phone: "+49 211 506690",
    email: "duesseldorf@lucky-bike.de",
    is_verified: true,
    is_active: true,
    locations: [
      {
        id: "loc-lucky-duesseldorf-001",
        dealer_id: "caf305aa-5f65-4aee-b008-179eaf9287c3",
        name: "Lucky Bike Filiale Düsseldorf Heerdt",
        address_line1: "Schiessstraße 43",
        postal_code: "40549",
        city: "Düsseldorf",
        country_code: "DE",
        latitude: 51.2389,
        longitude: 6.7214,
        phone: "+49 211 506690",
        email: "duesseldorf@lucky-bike.de",
        opening_hours: "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 10:00 - 18:00 Uhr"
      }
    ],
    supported_providers: LEASING_PROVIDERS,
    created_at: "2026-09-01T00:00:00.000Z"
  },
  {
    id: "caf305aa-5f65-4aee-b008-179eaf9287c4",
    name: "Lucky Bike Filiale Bielefeld",
    slug: "lucky-bike-bielefeld",
    website_url: "https://www.lucky-bike.de/filialen/bielefeld/",
    phone: "+49 521 329240",
    email: "bielefeld@lucky-bike.de",
    is_verified: true,
    is_active: true,
    locations: [
      {
        id: "loc-lucky-bielefeld-001",
        dealer_id: "caf305aa-5f65-4aee-b008-179eaf9287c4",
        name: "Lucky Bike Filiale Bielefeld",
        address_line1: "Herforder Str. 182",
        postal_code: "33609",
        city: "Bielefeld",
        country_code: "DE",
        latitude: 52.0367,
        longitude: 8.5578,
        phone: "+49 521 329240",
        email: "bielefeld@lucky-bike.de",
        opening_hours: "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 10:00 - 18:00 Uhr"
      }
    ],
    supported_providers: LEASING_PROVIDERS,
    created_at: "2026-09-01T00:00:00.000Z"
  },
  {
    id: "caf305aa-5f65-4aee-b008-179eaf9287c5",
    name: "Lucky Bike Filiale Köln Süd",
    slug: "lucky-bike-koeln",
    website_url: "https://www.lucky-bike.de/filialen/koeln/",
    phone: "+49 221 348080",
    email: "koeln@lucky-bike.de",
    is_verified: true,
    is_active: true,
    locations: [
      {
        id: "loc-lucky-koeln-001",
        dealer_id: "caf305aa-5f65-4aee-b008-179eaf9287c5",
        name: "Lucky Bike Filiale Köln Bayenthal",
        address_line1: "Alteburger Str. 361",
        postal_code: "50968",
        city: "Köln",
        country_code: "DE",
        latitude: 50.9067,
        longitude: 6.9745,
        phone: "+49 221 348080",
        email: "koeln@lucky-bike.de",
        opening_hours: "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 10:00 - 18:00 Uhr"
      }
    ],
    supported_providers: LEASING_PROVIDERS,
    created_at: "2026-09-01T00:00:00.000Z"
  },
  {
    id: "caf305aa-5f65-4aee-b008-179eaf9287c6",
    name: "Lucky Bike Filiale Münster",
    slug: "lucky-bike-muenster",
    website_url: "https://www.lucky-bike.de/filialen/muenster/",
    phone: "+49 251 71830",
    email: "muenster@lucky-bike.de",
    is_verified: true,
    is_active: true,
    locations: [
      {
        id: "loc-lucky-muenster-001",
        dealer_id: "caf305aa-5f65-4aee-b008-179eaf9287c6",
        name: "Lucky Bike Filiale Münster",
        address_line1: "Weseler Str. 539",
        postal_code: "48163",
        city: "Münster",
        country_code: "DE",
        latitude: 51.9289,
        longitude: 7.5978,
        phone: "+49 251 71830",
        email: "muenster@lucky-bike.de",
        opening_hours: "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 10:00 - 18:00 Uhr"
      }
    ],
    supported_providers: LEASING_PROVIDERS,
    created_at: "2026-09-01T00:00:00.000Z"
  },
  {
    id: "caf305aa-5f65-4aee-b008-179eaf9287c7",
    name: "Lucky Bike Radlbauer München",
    slug: "lucky-bike-radlbauer-muenchen",
    website_url: "https://www.lucky-bike.de/filialen/muenchen/",
    phone: "+49 89 87180",
    email: "muenchen@lucky-bike.de",
    is_verified: true,
    is_active: true,
    locations: [
      {
        id: "loc-lucky-muenchen-001",
        dealer_id: "caf305aa-5f65-4aee-b008-179eaf9287c7",
        name: "Lucky Bike / Radlbauer München Neuaubing",
        address_line1: "Limesstraße 69",
        postal_code: "81243",
        city: "München",
        country_code: "DE",
        latitude: 48.1489,
        longitude: 11.4312,
        phone: "+49 89 87180",
        email: "muenchen@lucky-bike.de",
        opening_hours: "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 10:00 - 18:00 Uhr"
      }
    ],
    supported_providers: LEASING_PROVIDERS,
    created_at: "2026-09-01T00:00:00.000Z"
  },

  // 3. Decathlon (Bochum Ruhr Park + key German locations)
  {
    id: "d0000000-0000-4000-a000-000000000001",
    name: "Decathlon Bochum (Ruhr Park)",
    slug: "decathlon-bochum",
    website_url: "https://www.decathlon.de/filiale/bochum/",
    phone: "+49 234 927800",
    email: "bochum@decathlon.de",
    is_verified: true,
    is_active: true,
    locations: [
      {
        id: "loc-decathlon-bochum-001",
        dealer_id: "d0000000-0000-4000-a000-000000000001",
        name: "Decathlon Bochum Ruhr Park (Radsport & E-Bike Center)",
        address_line1: "Am Einkaufszentrum 1",
        postal_code: "44791",
        city: "Bochum",
        country_code: "DE",
        latitude: 51.4921,
        longitude: 7.2845,
        phone: "+49 234 927800",
        email: "bochum@decathlon.de",
        opening_hours: "Mo-Sa: 10:00 - 20:00 Uhr"
      }
    ],
    supported_providers: LEASING_PROVIDERS,
    created_at: "2026-09-01T00:00:00.000Z"
  },
  {
    id: "d0000000-0000-4000-a000-000000000002",
    name: "Decathlon Dortmund",
    slug: "decathlon-dortmund",
    website_url: "https://www.decathlon.de/filiale/dortmund/",
    phone: "+49 231 950800",
    email: "dortmund@decathlon.de",
    is_verified: true,
    is_active: true,
    locations: [
      {
        id: "loc-decathlon-dortmund-001",
        dealer_id: "d0000000-0000-4000-a000-000000000002",
        name: "Decathlon Dortmund Thier-Galerie / City",
        address_line1: "Westenhellweg 85",
        postal_code: "44137",
        city: "Dortmund",
        country_code: "DE",
        latitude: 51.5145,
        longitude: 7.4612,
        phone: "+49 231 950800",
        email: "dortmund@decathlon.de",
        opening_hours: "Mo-Sa: 10:00 - 20:00 Uhr"
      }
    ],
    supported_providers: LEASING_PROVIDERS,
    created_at: "2026-09-01T00:00:00.000Z"
  },
  {
    id: "d0000000-0000-4000-a000-000000000003",
    name: "Decathlon Essen",
    slug: "decathlon-essen",
    website_url: "https://www.decathlon.de/filiale/essen/",
    phone: "+49 201 848500",
    email: "essen@decathlon.de",
    is_verified: true,
    is_active: true,
    locations: [
      {
        id: "loc-decathlon-essen-001",
        dealer_id: "d0000000-0000-4000-a000-000000000003",
        name: "Decathlon Essen Rathaus Galerie",
        address_line1: "Porscheplatz 2",
        postal_code: "45127",
        city: "Essen",
        country_code: "DE",
        latitude: 51.4589,
        longitude: 7.0145,
        phone: "+49 201 848500",
        email: "essen@decathlon.de",
        opening_hours: "Mo-Sa: 10:00 - 20:00 Uhr"
      }
    ],
    supported_providers: LEASING_PROVIDERS,
    created_at: "2026-09-01T00:00:00.000Z"
  },
  {
    id: "d0000000-0000-4000-a000-000000000004",
    name: "Decathlon Düsseldorf",
    slug: "decathlon-duesseldorf",
    website_url: "https://www.decathlon.de/filiale/duesseldorf/",
    phone: "+49 211 862900",
    email: "duesseldorf@decathlon.de",
    is_verified: true,
    is_active: true,
    locations: [
      {
        id: "loc-decathlon-duesseldorf-001",
        dealer_id: "d0000000-0000-4000-a000-000000000004",
        name: "Decathlon Düsseldorf Schadow-Arkaden",
        address_line1: "Schadowstraße 78",
        postal_code: "40212",
        city: "Düsseldorf",
        country_code: "DE",
        latitude: 51.2267,
        longitude: 6.7845,
        phone: "+49 211 862900",
        email: "duesseldorf@decathlon.de",
        opening_hours: "Mo-Sa: 10:00 - 20:00 Uhr"
      }
    ],
    supported_providers: LEASING_PROVIDERS,
    created_at: "2026-09-01T00:00:00.000Z"
  },
  {
    id: "d0000000-0000-4000-a000-000000000005",
    name: "Decathlon Köln Marsdorf",
    slug: "decathlon-koeln",
    website_url: "https://www.decathlon.de/filiale/koeln/",
    phone: "+49 221 789400",
    email: "koeln@decathlon.de",
    is_verified: true,
    is_active: true,
    locations: [
      {
        id: "loc-decathlon-koeln-001",
        dealer_id: "d0000000-0000-4000-a000-000000000005",
        name: "Decathlon Köln Marsdorf Großfiliale",
        address_line1: "Marsdorfer Str. 1",
        postal_code: "50858",
        city: "Köln",
        country_code: "DE",
        latitude: 50.9167,
        longitude: 6.8645,
        phone: "+49 221 789400",
        email: "koeln@decathlon.de",
        opening_hours: "Mo-Sa: 10:00 - 20:00 Uhr"
      }
    ],
    supported_providers: LEASING_PROVIDERS,
    created_at: "2026-09-01T00:00:00.000Z"
  },
  {
    id: "d0000000-0000-4000-a000-000000000006",
    name: "Decathlon Berlin Alexanderplatz",
    slug: "decathlon-berlin",
    website_url: "https://www.decathlon.de/filiale/berlin/",
    phone: "+49 30 240800",
    email: "berlin@decathlon.de",
    is_verified: true,
    is_active: true,
    locations: [
      {
        id: "loc-decathlon-berlin-001",
        dealer_id: "d0000000-0000-4000-a000-000000000006",
        name: "Decathlon Berlin Alexanderplatz",
        address_line1: "Alexanderplatz 9",
        postal_code: "10178",
        city: "Berlin",
        country_code: "DE",
        latitude: 52.5218,
        longitude: 13.4132,
        phone: "+49 30 240800",
        email: "berlin@decathlon.de",
        opening_hours: "Mo-Sa: 10:00 - 20:00 Uhr"
      }
    ],
    supported_providers: LEASING_PROVIDERS,
    created_at: "2026-09-01T00:00:00.000Z"
  },
  {
    id: "d0000000-0000-4000-a000-000000000007",
    name: "Decathlon München Elisenhof",
    slug: "decathlon-muenchen",
    website_url: "https://www.decathlon.de/filiale/muenchen/",
    phone: "+49 89 552700",
    email: "muenchen@decathlon.de",
    is_verified: true,
    is_active: true,
    locations: [
      {
        id: "loc-decathlon-muenchen-001",
        dealer_id: "d0000000-0000-4000-a000-000000000007",
        name: "Decathlon München Elisenhof Hauptbahnhof",
        address_line1: "Elisenstraße 3",
        postal_code: "80335",
        city: "München",
        country_code: "DE",
        latitude: 48.1412,
        longitude: 11.5623,
        phone: "+49 89 552700",
        email: "muenchen@decathlon.de",
        opening_hours: "Mo-Sa: 10:00 - 20:00 Uhr"
      }
    ],
    supported_providers: LEASING_PROVIDERS,
    created_at: "2026-09-01T00:00:00.000Z"
  },

  // 4. B.O.C. (Bike & Outdoor Company)
  {
    id: "b0c00000-0000-4000-a000-000000000001",
    name: "B.O.C. Bochum",
    slug: "boc-bochum",
    website_url: "https://www.boc24.de/filialen/bochum/",
    phone: "+49 234 516900",
    email: "bochum@boc24.de",
    is_verified: true,
    is_active: true,
    locations: [
      {
        id: "loc-boc-bochum-001",
        dealer_id: "b0c00000-0000-4000-a000-000000000001",
        name: "B.O.C. Filiale Bochum Harpen",
        address_line1: "Hanielstraße 1",
        postal_code: "44805",
        city: "Bochum",
        country_code: "DE",
        latitude: 51.4989,
        longitude: 7.2712,
        phone: "+49 234 516900",
        email: "bochum@boc24.de",
        opening_hours: "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 10:00 - 18:00 Uhr"
      }
    ],
    supported_providers: LEASING_PROVIDERS,
    created_at: "2026-09-01T00:00:00.000Z"
  },
  {
    id: "b0c00000-0000-4000-a000-000000000002",
    name: "B.O.C. Dortmund",
    slug: "boc-dortmund",
    website_url: "https://www.boc24.de/filialen/dortmund/",
    phone: "+49 231 847900",
    email: "dortmund@boc24.de",
    is_verified: true,
    is_active: true,
    locations: [
      {
        id: "loc-boc-dortmund-001",
        dealer_id: "b0c00000-0000-4000-a000-000000000002",
        name: "B.O.C. Filiale Dortmund Nord",
        address_line1: "Bornstraße 160",
        postal_code: "44145",
        city: "Dortmund",
        country_code: "DE",
        latitude: 51.5245,
        longitude: 7.4645,
        phone: "+49 231 847900",
        email: "dortmund@boc24.de",
        opening_hours: "Mo-Fr: 10:00 - 19:00 Uhr, Sa: 10:00 - 18:00 Uhr"
      }
    ],
    supported_providers: LEASING_PROVIDERS,
    created_at: "2026-09-01T00:00:00.000Z"
  },

  // 5. Zweirad-Center Stadler
  {
    id: "57ad1e00-0000-4000-a000-000000000001",
    name: "Zweirad-Center Stadler Essen",
    slug: "stadler-essen",
    website_url: "https://www.zweirad-center-stadler.de/filialen/essen/",
    phone: "+49 201 83030",
    email: "essen@zweirad-stadler.de",
    is_verified: true,
    is_active: true,
    locations: [
      {
        id: "loc-stadler-essen-001",
        dealer_id: "57ad1e00-0000-4000-a000-000000000001",
        name: "Zweirad-Center Stadler Essen (Ruhrgebiet)",
        address_line1: "Gladbecker Str. 19",
        postal_code: "45141",
        city: "Essen",
        country_code: "DE",
        latitude: 51.4645,
        longitude: 7.0112,
        phone: "+49 201 83030",
        email: "essen@zweirad-stadler.de",
        opening_hours: "Mo-Fr: 10:00 - 19:30 Uhr, Sa: 09:30 - 18:00 Uhr"
      }
    ],
    supported_providers: LEASING_PROVIDERS,
    created_at: "2026-09-01T00:00:00.000Z"
  },
  {
    id: "57ad1e00-0000-4000-a000-000000000002",
    name: "Zweirad-Center Stadler Mülheim an der Ruhr",
    slug: "stadler-muelheim",
    website_url: "https://www.zweirad-center-stadler.de/filialen/muelheim/",
    phone: "+49 208 48480",
    email: "muelheim@zweirad-stadler.de",
    is_verified: true,
    is_active: true,
    locations: [
      {
        id: "loc-stadler-muelheim-001",
        dealer_id: "57ad1e00-0000-4000-a000-000000000002",
        name: "Zweirad-Center Stadler Mülheim an der Ruhr",
        address_line1: "Mannesmannallee 21",
        postal_code: "45475",
        city: "Mülheim an der Ruhr",
        country_code: "DE",
        latitude: 51.4312,
        longitude: 6.8612,
        phone: "+49 208 48480",
        email: "muelheim@zweirad-stadler.de",
        opening_hours: "Mo-Fr: 10:00 - 19:30 Uhr, Sa: 09:30 - 18:00 Uhr"
      }
    ],
    supported_providers: LEASING_PROVIDERS,
    created_at: "2026-09-01T00:00:00.000Z"
  }
];

function makeOffer(dealer, data) {
  return {
    id: `off-${dealer.slug}-${data.sku.toLowerCase()}`,
    dealer_id: dealer.id,
    dealer_name: dealer.name,
    dealer_slug: dealer.slug,
    dealer_verified: true,
    dealer_locations: dealer.locations,
    source_id: `src-${dealer.slug}`,
    external_id: `EXT-${dealer.slug.substring(0, 8).toUpperCase()}-${data.sku}`,
    title: `${data.brand} ${data.model} (${data.size})`,
    brand_name: data.brand,
    model_name: data.model,
    model_year: data.year || 2025,
    category: data.category,
    propulsion: data.propulsion || "PEDELEC",
    price_cents: data.price_cents,
    compare_at_price_cents: data.compare_cents || Math.round(data.price_cents * 1.12),
    currency: "EUR",
    availability: "IN_STOCK",
    quantity: 2,
    condition: "NEW",
    source_url: `${dealer.website_url}?ref=velofind&offer=${data.sku}`,
    image_url: data.image_url,
    content_hash: `ch-${dealer.slug}-${data.sku.toLowerCase()}`,
    first_seen_at: "2026-09-01T00:00:00.000Z",
    last_seen_at: "2026-09-22T06:00:00.000Z",
    is_active: true,
    variant_details: {
      frame_size: data.size,
      frame_type: data.frame_type || "DIAMOND",
      color: data.color || "Anthrazit / Schwarz",
      wheel_size_in: data.wheel || 29,
      weight_kg: data.weight || 23.8,
      battery_wh: data.battery || 750,
      motor_brand: data.motor_brand || "Bosch",
      motor_model: data.motor_model || "Performance Line CX Smart System",
      torque_nm: data.torque || 85,
      sku: `SKU-${dealer.slug}-${data.sku}`
    },
    leasing_compatibilities: LEASING_PROVIDERS.map(lp => ({
      provider_id: lp.provider_id,
      provider_slug: lp.provider_slug,
      provider_name: lp.provider_name,
      status: "CONFIRMED",
      evidence_reason: `Autorisierter Händlervertrag (${lp.contract_reference})`
    })),
    price_history: [
      {
        id: `ph-${dealer.slug}-${data.sku}-1`,
        offer_id: `off-${dealer.slug}-${data.sku.toLowerCase()}`,
        old_price_cents: data.compare_cents || Math.round(data.price_cents * 1.12),
        new_price_cents: data.price_cents,
        recorded_at: "2026-09-15T08:00:00.000Z"
      }
    ]
  };
}

const NEW_OFFERS = [];

// Fahrrad XXL Bochum Offers
const xxlBochum = NEW_DEALERS.find(d => d.slug === 'fahrrad-xxl-meinhoevel-bochum');
NEW_OFFERS.push(
  makeOffer(xxlBochum, {
    brand: "CUBE",
    model: "Stereo Hybrid 140 HPC SLX 750",
    size: "L (20\")",
    category: "MTB",
    price_cents: 459900,
    compare_cents: 499900,
    color: "Liquidblue´n´blue",
    battery: 750,
    motor_brand: "Bosch",
    motor_model: "Performance CX Smart",
    torque: 85,
    sku: "XXL-BOC-01",
    image_url: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=1200&q=80"
  }),
  makeOffer(xxlBochum, {
    brand: "Kalkhoff",
    model: "Entice 5.B Advance+ ABS",
    size: "Diamant 53cm",
    category: "TREKKING",
    price_cents: 429900,
    compare_cents: 469900,
    color: "Jetgrey matt",
    battery: 750,
    motor_brand: "Bosch",
    motor_model: "Performance CX Smart",
    torque: 85,
    sku: "XXL-BOC-02",
    image_url: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1200&q=80"
  }),
  makeOffer(xxlBochum, {
    brand: "Trek",
    model: "Rail 7 Gen 3 E-MTB",
    size: "M (43cm)",
    category: "MTB",
    price_cents: 549900,
    compare_cents: 619900,
    color: "Crimson / Lithium Grey",
    battery: 750,
    motor_brand: "Bosch",
    motor_model: "Performance CX",
    torque: 85,
    sku: "XXL-BOC-03",
    image_url: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1200&q=80"
  }),
  makeOffer(xxlBochum, {
    brand: "Specialized",
    model: "Turbo Tero 4.0 Step-Through",
    size: "M (Wave)",
    category: "CITY",
    frame_type: "STEP_THROUGH",
    price_cents: 380000,
    compare_cents: 420000,
    color: "Cast Black / Smoke",
    battery: 710,
    motor_brand: "Specialized",
    motor_model: "Full Power 2.0",
    torque: 70,
    sku: "XXL-BOC-04",
    image_url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80"
  }),
  makeOffer(xxlBochum, {
    brand: "Haibike",
    model: "ALLMTN 3 All-Mountain",
    size: "XL (50cm)",
    category: "MTB",
    price_cents: 449900,
    compare_cents: 499900,
    color: "Glossy Grey / Lava",
    battery: 720,
    motor_brand: "Yamaha",
    motor_model: "PW-X3",
    torque: 85,
    sku: "XXL-BOC-05",
    image_url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80"
  }),
  makeOffer(xxlBochum, {
    brand: "Bergamont",
    model: "E-Horizon Premium Expert",
    size: "Trapez 52cm",
    category: "TREKKING",
    frame_type: "TRAPEZE",
    price_cents: 369900,
    compare_cents: 409900,
    color: "Anthracite Matt",
    battery: 750,
    motor_brand: "Bosch",
    motor_model: "Performance CX Smart",
    torque: 85,
    sku: "XXL-BOC-06",
    image_url: "https://images.unsplash.com/photo-1502744688674-c619d3864003?auto=format&fit=crop&w=1200&q=80"
  })
);

// Decathlon Bochum Offers
const decathlonBochum = NEW_DEALERS.find(d => d.slug === 'decathlon-bochum');
NEW_OFFERS.push(
  makeOffer(decathlonBochum, {
    brand: "Rockrider",
    model: "E-ST 900 27.5\" Plus E-MTB",
    size: "L (175-184cm)",
    category: "MTB",
    price_cents: 219900,
    compare_cents: 239900,
    color: "Titan / Neon Orange",
    battery: 504,
    motor_brand: "Brose",
    motor_model: "Drive T Aluminium",
    torque: 70,
    sku: "DEC-BOC-01",
    image_url: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=1200&q=80"
  }),
  makeOffer(decathlonBochum, {
    brand: "Riverside",
    model: "520 E Allroad E-Bike",
    size: "M (166-177cm)",
    category: "TREKKING",
    frame_type: "TRAPEZE",
    price_cents: 139900,
    compare_cents: 159900,
    color: "Mineral Blue",
    battery: 500,
    motor_brand: "Decathlon Vision",
    motor_model: "Hinterrad-Nabenmotor 45Nm",
    torque: 45,
    sku: "DEC-BOC-02",
    image_url: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1200&q=80"
  }),
  makeOffer(decathlonBochum, {
    brand: "Elops",
    model: "920 E Connect Automatik",
    size: "L/XL (Tiefeinsteiger)",
    category: "CITY",
    frame_type: "STEP_THROUGH",
    price_cents: 169900,
    compare_cents: 189900,
    color: "Dunkelgrün Matt",
    battery: 417,
    motor_brand: "Brose",
    motor_model: "Drive C Mittelmotor",
    torque: 50,
    sku: "DEC-BOC-03",
    image_url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80"
  }),
  makeOffer(decathlonBochum, {
    brand: "Stilus",
    model: "E-All Mountain 29 Fully",
    size: "M (43cm)",
    category: "MTB",
    price_cents: 379900,
    compare_cents: 429900,
    color: "Stealth Grey",
    battery: 625,
    motor_brand: "Bosch",
    motor_model: "Performance Line CX",
    torque: 85,
    sku: "DEC-BOC-04",
    image_url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80"
  }),
  makeOffer(decathlonBochum, {
    brand: "B'Twin",
    model: "E-Fold 500 Faltrad",
    size: "Unisize (20\")",
    category: "CITY",
    frame_type: "STEP_THROUGH",
    price_cents: 109900,
    compare_cents: 119900,
    color: "Ockergelb",
    wheel: 20,
    weight: 21.4,
    battery: 252,
    motor_brand: "B'Twin",
    motor_model: "Brushless 250W",
    torque: 35,
    sku: "DEC-BOC-05",
    image_url: "https://images.unsplash.com/photo-1502744688674-c619d3864003?auto=format&fit=crop&w=1200&q=80"
  }),
  makeOffer(decathlonBochum, {
    brand: "Van Rysel",
    model: "E-EDR AF 105 Gravel & Road",
    size: "M (54cm)",
    category: "GRAVEL",
    price_cents: 279900,
    compare_cents: 299900,
    color: "Glanz Bordeaux",
    battery: 250,
    motor_brand: "Mahle",
    motor_model: "Ebikemotion X35+",
    torque: 40,
    sku: "DEC-BOC-06",
    image_url: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1200&q=80"
  })
);

// Decathlon Dortmund & Essen
const decathlonDortmund = NEW_DEALERS.find(d => d.slug === 'decathlon-dortmund');
NEW_OFFERS.push(
  makeOffer(decathlonDortmund, {
    brand: "Rockrider",
    model: "E-EXPL 520 Trail E-MTB",
    size: "XL",
    category: "MTB",
    price_cents: 199900,
    compare_cents: 219900,
    color: "Olive Green",
    battery: 500,
    motor_brand: "Brose",
    motor_model: "Drive T Alu",
    torque: 70,
    sku: "DEC-DTM-01",
    image_url: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=1200&q=80"
  }),
  makeOffer(decathlonDortmund, {
    brand: "Riverside",
    model: "540 E Shimano Steps E-Bike",
    size: "L (53cm)",
    category: "TREKKING",
    price_cents: 189900,
    compare_cents: 209900,
    color: "Space Grey",
    battery: 504,
    motor_brand: "Shimano",
    motor_model: "STEPS E6100",
    torque: 60,
    sku: "DEC-DTM-02",
    image_url: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1200&q=80"
  })
);

// Lucky Bike Dortmund & Essen Offers
const luckyDortmund = NEW_DEALERS.find(d => d.slug === 'lucky-bike-dortmund');
NEW_OFFERS.push(
  makeOffer(luckyDortmund, {
    brand: "CUBE",
    model: "Reaction Hybrid Pro 750",
    size: "XL (22\")",
    category: "MTB",
    price_cents: 319900,
    compare_cents: 349900,
    color: "Flashgrey´n´green",
    battery: 750,
    motor_brand: "Bosch",
    motor_model: "Performance CX Smart System",
    torque: 85,
    sku: "LUK-DTM-01",
    image_url: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=1200&q=80"
  }),
  makeOffer(luckyDortmund, {
    brand: "KTM",
    model: "Macina Tour CX 610",
    size: "Trapez 51cm",
    category: "TREKKING",
    frame_type: "TRAPEZE",
    price_cents: 349900,
    compare_cents: 389900,
    color: "Metallic White (Black)",
    battery: 625,
    motor_brand: "Bosch",
    motor_model: "Performance CX",
    torque: 85,
    sku: "LUK-DTM-02",
    image_url: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1200&q=80"
  }),
  makeOffer(luckyDortmund, {
    brand: "Gazelle",
    model: "Arroyo C7 HMB Elite",
    size: "Wave 53cm",
    category: "CITY",
    frame_type: "STEP_THROUGH",
    price_cents: 279900,
    compare_cents: 299900,
    color: "Ivory White Gloss",
    battery: 500,
    motor_brand: "Bosch",
    motor_model: "Active Line Plus",
    torque: 50,
    sku: "LUK-DTM-03",
    image_url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80"
  }),
  makeOffer(luckyDortmund, {
    brand: "Focus",
    model: "Thron² 6.8 E-All Mountain",
    size: "M (42cm)",
    category: "MTB",
    price_cents: 439900,
    compare_cents: 489900,
    color: "Slategrey",
    battery: 750,
    motor_brand: "Bosch",
    motor_model: "Performance CX Smart",
    torque: 85,
    sku: "LUK-DTM-04",
    image_url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80"
  })
);

const luckyEssen = NEW_DEALERS.find(d => d.slug === 'lucky-bike-essen');
NEW_OFFERS.push(
  makeOffer(luckyEssen, {
    brand: "Trek",
    model: "Allant+ 7 Lowstep City E-Bike",
    size: "M (Wave)",
    category: "CITY",
    frame_type: "STEP_THROUGH",
    price_cents: 359900,
    compare_cents: 399900,
    color: "Nautical Navy",
    battery: 625,
    motor_brand: "Bosch",
    motor_model: "Performance CX",
    torque: 85,
    sku: "LUK-ESS-01",
    image_url: "https://images.unsplash.com/photo-1502744688674-c619d3864003?auto=format&fit=crop&w=1200&q=80"
  }),
  makeOffer(luckyEssen, {
    brand: "Kalkhoff",
    model: "Image 3.B Advance Wave",
    size: "Wave 48cm",
    category: "CITY",
    frame_type: "STEP_THROUGH",
    price_cents: 329900,
    compare_cents: 359900,
    color: "Mustard Gloss",
    battery: 500,
    motor_brand: "Bosch",
    motor_model: "Performance Line",
    torque: 65,
    sku: "LUK-ESS-02",
    image_url: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1200&q=80"
  })
);

// B.O.C. Bochum Offers
const bocBochum = NEW_DEALERS.find(d => d.slug === 'boc-bochum');
NEW_OFFERS.push(
  makeOffer(bocBochum, {
    brand: "Merida",
    model: "eOne-Sixty 500 Enduro",
    size: "L (47cm)",
    category: "MTB",
    price_cents: 419900,
    compare_cents: 469900,
    color: "Silk Anthracite",
    battery: 630,
    motor_brand: "Shimano",
    motor_model: "EP801",
    torque: 85,
    sku: "BOC-BOC-01",
    image_url: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=1200&q=80"
  }),
  makeOffer(bocBochum, {
    brand: "Winora",
    model: "Sinus N8f Eco Wave",
    size: "Wave 46cm",
    category: "CITY",
    frame_type: "STEP_THROUGH",
    price_cents: 259900,
    compare_cents: 289900,
    color: "Nightblue Matt",
    battery: 500,
    motor_brand: "Bosch",
    motor_model: "Active Line Plus",
    torque: 50,
    sku: "BOC-BOC-02",
    image_url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80"
  }),
  makeOffer(bocBochum, {
    brand: "Haibike",
    model: "Trekking 4 HIGH",
    size: "Diamant L (52cm)",
    category: "TREKKING",
    price_cents: 299900,
    compare_cents: 329900,
    color: "Warm Grey / Black",
    battery: 500,
    motor_brand: "Yamaha",
    motor_model: "PW-TE",
    torque: 60,
    sku: "BOC-BOC-03",
    image_url: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1200&q=80"
  })
);

// Zweirad-Center Stadler Essen Offers
const stadlerEssen = NEW_DEALERS.find(d => d.slug === 'stadler-essen');
NEW_OFFERS.push(
  makeOffer(stadlerEssen, {
    brand: "Bulls",
    model: "Sonic EVO TR 1 Carbon 29",
    size: "L (48cm)",
    category: "MTB",
    price_cents: 439900,
    compare_cents: 499900,
    color: "Raw Carbon / Neon Red",
    battery: 750,
    motor_brand: "Bosch",
    motor_model: "Performance CX Smart",
    torque: 85,
    sku: "STD-ESS-01",
    image_url: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=1200&q=80"
  }),
  makeOffer(stadlerEssen, {
    brand: "Pegasus",
    model: "Premio EVO 10 Lite Wave",
    size: "Wave 50cm",
    category: "TREKKING",
    frame_type: "STEP_THROUGH",
    price_cents: 369900,
    compare_cents: 399900,
    color: "Black Matt / Chrome",
    battery: 750,
    motor_brand: "Bosch",
    motor_model: "Performance CX Smart",
    torque: 85,
    sku: "STD-ESS-02",
    image_url: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1200&q=80"
  }),
  makeOffer(stadlerEssen, {
    brand: "Scott",
    model: "Aspect eRIDE 920 E-MTB",
    size: "M (44cm)",
    category: "MTB",
    price_cents: 339900,
    compare_cents: 379900,
    color: "Granite Grey / Orange",
    battery: 625,
    motor_brand: "Bosch",
    motor_model: "Performance CX",
    torque: 85,
    sku: "STD-ESS-03",
    image_url: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1200&q=80"
  })
);

console.log(`Prepared ${NEW_DEALERS.length} new dealers and ${NEW_OFFERS.length} new e-bike offers.`);

// Now append new dealers to PARTNER_DEALERS_DATA array
// And append new offers to PARTNER_OFFERS_DATA array
const dealersEndStr = 'export const PARTNER_OFFERS_DATA: Offer[] = [';
const dealersInsertPos = content.indexOf(dealersEndStr);

if (dealersInsertPos === -1) {
  console.error("Could not find PARTNER_OFFERS_DATA delimiter");
  process.exit(1);
}

// Find the closing bracket before PARTNER_OFFERS_DATA
const closingBracketBeforeOffers = content.lastIndexOf('];', dealersInsertPos);
if (closingBracketBeforeOffers === -1) {
  console.error("Could not find closing bracket for PARTNER_DEALERS_DATA");
  process.exit(1);
}

const formattedDealers = NEW_DEALERS.map(d => JSON.stringify(d, null, 2)).join(',\n  ');
const updatedBeforeOffers = content.slice(0, closingBracketBeforeOffers) + ',\n  ' + formattedDealers + '\n' + content.slice(closingBracketBeforeOffers);

// Now insert offers before the end of PARTNER_OFFERS_DATA
const finalOffersEndBracket = updatedBeforeOffers.lastIndexOf('];');
if (finalOffersEndBracket === -1) {
  console.error("Could not find closing bracket for PARTNER_OFFERS_DATA");
  process.exit(1);
}

const formattedOffers = NEW_OFFERS.map(o => JSON.stringify(o, null, 2)).join(',\n  ');
const finalContent = updatedBeforeOffers.slice(0, finalOffersEndBracket) + ',\n  ' + formattedOffers + '\n' + updatedBeforeOffers.slice(finalOffersEndBracket);

fs.writeFileSync(registryPath, finalContent, 'utf8');
console.log("Successfully updated src/server/db/dealer-registry.ts!");
