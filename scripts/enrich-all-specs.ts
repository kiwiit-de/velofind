import fs from 'fs';
import path from 'path';
import { PARTNER_DEALERS_DATA, PARTNER_OFFERS_DATA, LEASING_PROVIDERS_DATA } from '../src/server/db/dealer-registry.ts';
import { enrichBikeSpecs } from '../src/server/services/spec-enricher.service.ts';

console.log('Starting full specification & price enrichment...');
console.log(`Initial total offers: ${PARTNER_OFFERS_DATA.length}`);

// Strictly keep only bikes and ebikes with price over 648€ (> 64800 cents)
const eligibleOffers = PARTNER_OFFERS_DATA.filter((o) => o.price_cents > 64800);
console.log(`Eligible offers (> 648 EUR): ${eligibleOffers.length}`);

const enrichedOffers = eligibleOffers.map((o) => {
  const enrichedVd = enrichBikeSpecs({
    title: o.title,
    brand_name: o.brand_name,
    category: o.category,
    propulsion: o.propulsion,
    price_cents: o.price_cents,
    existing: o.variant_details
  });

  return {
    ...o,
    variant_details: enrichedVd
  };
});

console.log(`Enriched ${enrichedOffers.length} offers with weight, max_weight_kg, engine_type, motor_brand, torque_nm.`);

const filePath = path.resolve(process.cwd(), 'src/server/db/dealer-registry.ts');

const outputCode = `// @ts-nocheck
/**
 * VeloFind Partner Dealers Registry Database
 * Synchronized catalog including all Bochum bicycle dealerships & authentic partner stock.
 * Only bikes and e-bikes with price over 648€ are included.
 * Fully enriched with authentic weight, max weight capacity (systemgewicht), engine type, motor brand, torque (Nm), and battery.
 */

import type { Dealer, Offer, LeasingProvider } from "../../types.ts";

export const LEASING_PROVIDERS_DATA: LeasingProvider[] = ${JSON.stringify(LEASING_PROVIDERS_DATA, null, 2)};

export const PARTNER_DEALERS_DATA: Dealer[] = ${JSON.stringify(PARTNER_DEALERS_DATA, null, 2)};

const RAW_OFFERS: any[] = ${JSON.stringify(enrichedOffers, null, 2)};

// Strictly keep only bikes and ebikes with price over 648€ (> 64800 cents)
export const PARTNER_OFFERS_DATA: Offer[] = RAW_OFFERS.filter((o: any) => o.price_cents > 64800) as Offer[];
`;

fs.writeFileSync(filePath, outputCode, 'utf8');
console.log(`Successfully updated ${filePath}. File size: ${(fs.statSync(filePath).size / (1024 * 1024)).toFixed(2)} MB`);
