import fs from 'fs';
import path from 'path';
import { PARTNER_DEALERS_DATA, PARTNER_OFFERS_DATA, LEASING_PROVIDERS_DATA } from '../src/server/db/dealer-registry.ts';
import { enrichBikeSpecs, isElectricBike, inferBioCategory, extractModelYear } from '../src/server/services/spec-enricher.service.ts';
import type { BikeCategory, PropulsionType, Offer } from '../src/types.ts';

console.log('Starting full specification & price enrichment...');
console.log(`Initial total offers: ${PARTNER_OFFERS_DATA.length}`);

// Strictly keep only bikes and ebikes with price over 648€ (> 64800 cents)
const eligibleOffers = PARTNER_OFFERS_DATA.filter((o) => o.price_cents > 64800);
console.log(`Eligible offers (> 648 EUR): ${eligibleOffers.length}`);

let bioCount = 0;
let ebikeCount = 0;

const enrichedOffers: Offer[] = eligibleOffers.map((o) => {
  const isEbike = isElectricBike(o.title, o.brand_name, o.category, o.propulsion);
  const correctPropulsion: PropulsionType = isEbike ? 'PEDELEC' : 'MUSCULAR';
  
  let correctCategory: BikeCategory;
  if (!isEbike) {
    bioCount++;
    if (o.category && o.category !== 'E_BIKE' && o.category !== ('ALL' as any)) {
      correctCategory = o.category as BikeCategory;
    } else {
      correctCategory = inferBioCategory(o.title, o.brand_name, o.category);
    }
  } else {
    ebikeCount++;
    correctCategory = (o.category && o.category !== ('ALL' as any)) ? (o.category as BikeCategory) : 'E_BIKE';
  }

  const enrichedVd = enrichBikeSpecs({
    title: o.title,
    brand_name: o.brand_name,
    category: correctCategory,
    propulsion: correctPropulsion,
    price_cents: o.price_cents,
    existing: o.variant_details
  });

  const correctYear = extractModelYear(o.title, o.model_year || 2025);

  return {
    ...o,
    model_year: correctYear,
    category: correctCategory,
    propulsion: correctPropulsion,
    description: enrichedVd.description,
    variant_details: enrichedVd
  };
});

console.log(`Classification complete: ${bioCount} Bio-Bikes (muscular), ${ebikeCount} E-Bikes (electric).`);
console.log(`Enriched ${enrichedOffers.length} offers with authentic weight, max_weight_kg, engine_type, motor_brand, torque_nm.`);

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
