/**
 * VeloFind Partner Bike Consolidation & General Offer Link Resolution
 * 
 * Ensures:
 * 1. Direct, robust general offer links to partner shops (boc24.de, fahrrad-xxl.de, lucky-bike.de, etc.)
 * 2. Grouping identical bikes from the same partner across multiple physical locations:
 *    - In catalog/search: view the bike once
 *    - In product details: view all branches and locations where the bike is in stock/available
 */

import type { Offer, AvailableBranch } from '../types.ts';

/**
 * Extracts normalized partner identifier (e.g. 'boc', 'fahrrad-xxl', 'lucky-bike', 'decathlon')
 */
export function getPartnerKey(item: { dealer_slug?: string; source_url?: string; dealer_name?: string }): string {
  const slug = (item.dealer_slug || '').toLowerCase();
  const url = (item.source_url || '').toLowerCase();
  const name = (item.dealer_name || '').toLowerCase();

  if (slug.includes('boc') || slug.includes('b-o-c') || slug.includes('zweirad-bock') || url.includes('boc24') || name.includes('b.o.c')) {
    return 'boc';
  }
  if (slug.includes('fahrrad-xxl') || slug.includes('xxl') || url.includes('fahrrad-xxl') || name.includes('fahrrad xxl')) {
    return 'fahrrad-xxl';
  }
  if (slug.includes('lucky-bike') || slug.includes('lucky') || url.includes('lucky-bike') || name.includes('lucky bike')) {
    return 'lucky-bike';
  }
  if (slug.includes('decathlon') || url.includes('decathlon') || name.includes('decathlon')) {
    return 'decathlon';
  }

  if (url) {
    try {
      const hostname = new URL(url).hostname.replace(/^www\./, '');
      return hostname.split('.')[0] || slug;
    } catch {
      // ignore
    }
  }

  return slug || 'partner';
}

/**
 * Returns the direct general offer URL on the partner's original shop.
 * Guarantees a working destination for the bike.
 */
export function getPartnerGeneralOfferUrl(offer: Partial<Offer>): string {
  if (offer.source_url && offer.source_url.startsWith('http')) {
    let clean = offer.source_url.trim();
    if (clean.startsWith('http://')) {
      clean = 'https://' + clean.slice(7);
    }
    try {
      const parsed = new URL(clean);
      // If product has a meaningful path beyond root '/', return canonical product path
      if (parsed.pathname && parsed.pathname.length > 1) {
        return parsed.origin + parsed.pathname;
      }
    } catch {
      return clean;
    }
  }

  const partner = getPartnerKey(offer as any);
  const searchTerm = encodeURIComponent(`${offer.brand_name || ''} ${offer.model_name || offer.title || ''}`.trim());

  switch (partner) {
    case 'boc':
      return `https://boc24.de/search?q=${searchTerm}`;
    case 'fahrrad-xxl':
      return `https://www.fahrrad-xxl.de/suche/?q=${searchTerm}`;
    case 'lucky-bike':
      return `https://www.lucky-bike.de/index.php?lang=0&cl=search&searchparam=${searchTerm}`;
    case 'decathlon':
      return `https://www.decathlon.de/search?Ntt=${searchTerm}`;
    default:
      return `https://www.google.com/search?q=${searchTerm}+Fahrrad`;
  }
}

/**
 * Unique identity key for a specific bike model under a partner
 */
export function getBikeIdentityKey(offer: Partial<Offer>): string {
  const partner = getPartnerKey(offer as any);
  
  if (offer.source_url && offer.source_url.startsWith('http')) {
    try {
      const parsed = new URL(offer.source_url);
      const cleanPath = parsed.pathname.replace(/\/+$/, '').toLowerCase();
      if (cleanPath.length > 2) {
        return `${partner}::${cleanPath}`;
      }
    } catch {
      // fallback to title
    }
  }

  const cleanBrand = (offer.brand_name || '').trim().toLowerCase();
  const cleanTitle = (offer.title || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\s*-\s*\d+\s*wh/g, '') // ignore minor battery suffix differences if needed
    .replace(/\s*-\s*\d+\s*zoll/g, '');

  return `${partner}::${cleanBrand}::${cleanTitle}`;
}

/**
 * Consolidates multiple offers of the same bike from the same partner across multiple locations.
 * - In search catalog: views the bike only ONCE
 * - Populates available_branches with every location/branch where that bike is in stock
 */
export function groupPartnerOffers(
  offers: Offer[],
  options?: { selectedDealerSlug?: string; userLat?: number; userLng?: number }
): Offer[] {
  if (!offers || offers.length === 0) return [];

  const groups = new Map<string, Offer[]>();

  for (const offer of offers) {
    const key = getBikeIdentityKey(offer);
    const existing = groups.get(key);
    if (!existing) {
      groups.set(key, [offer]);
    } else {
      existing.push(offer);
    }
  }

  const consolidated: Offer[] = [];

  for (const [, groupOffers] of groups.entries()) {
    if (groupOffers.length === 1) {
      const single = groupOffers[0];
      const singleBranch: AvailableBranch = {
        dealer_id: single.dealer_id,
        dealer_name: single.dealer_name,
        dealer_slug: single.dealer_slug,
        city: single.dealer_locations?.[0]?.city || '',
        postal_code: single.dealer_locations?.[0]?.postal_code || '',
        address: single.dealer_locations?.[0]?.address_line1 || '',
        distance_km: single.distance_km,
        availability: single.availability,
        source_url: getPartnerGeneralOfferUrl(single)
      };

      consolidated.push({
        ...single,
        source_url: getPartnerGeneralOfferUrl(single),
        available_branches: single.available_branches && single.available_branches.length > 1
          ? single.available_branches
          : [singleBranch],
        branches_count: single.available_branches?.length || 1
      });
      continue;
    }

    // Multiple offers exist for the exact same bike from the same partner!
    // Consolidate branches across all store locations
    const branchMap = new Map<string, AvailableBranch>();
    const allLocations: any[] = [];

    groupOffers.forEach((o) => {
      // Collect dealer locations
      if (o.dealer_locations && o.dealer_locations.length > 0) {
        o.dealer_locations.forEach((loc) => {
          if (!allLocations.some((l) => l.id === loc.id || (l.city === loc.city && l.address_line1 === loc.address_line1))) {
            allLocations.push(loc);
          }
        });
      }

      // Add as branch
      const branchKey = o.dealer_slug || o.dealer_id;
      if (!branchMap.has(branchKey)) {
        branchMap.set(branchKey, {
          dealer_id: o.dealer_id,
          dealer_name: o.dealer_name,
          dealer_slug: o.dealer_slug,
          city: o.dealer_locations?.[0]?.city || '',
          postal_code: o.dealer_locations?.[0]?.postal_code || '',
          address: o.dealer_locations?.[0]?.address_line1 || '',
          distance_km: o.distance_km,
          availability: o.availability,
          source_url: getPartnerGeneralOfferUrl(o)
        });
      }
    });

    const available_branches = Array.from(branchMap.values()).sort((a, b) => {
      if (a.distance_km !== undefined && b.distance_km !== undefined) {
        return a.distance_km - b.distance_km;
      }
      if (a.distance_km !== undefined) return -1;
      if (b.distance_km !== undefined) return 1;
      return a.dealer_name.localeCompare(b.dealer_name);
    });

    // Select the best representative offer for primary display:
    // 1. If user filtered by a specific dealer slug, pick that one if present
    // 2. Otherwise pick the one closest to the user (lowest distance_km)
    // 3. Otherwise prefer the central online store or first in list
    let primary = groupOffers[0];
    if (options?.selectedDealerSlug) {
      const match = groupOffers.find((o) => o.dealer_slug === options.selectedDealerSlug);
      if (match) primary = match;
    } else {
      const sortedByDistance = [...groupOffers].sort((a, b) => (a.distance_km ?? 99999) - (b.distance_km ?? 99999));
      if (sortedByDistance[0].distance_km !== undefined) {
        primary = sortedByDistance[0];
      } else {
        const onlineShop = groupOffers.find((o) => 
          o.dealer_slug.includes('online') || o.dealer_slug.includes('grossmarkt') || o.dealer_slug.includes('fachmarkt')
        );
        if (onlineShop) primary = onlineShop;
      }
    }

    consolidated.push({
      ...primary,
      source_url: getPartnerGeneralOfferUrl(primary),
      dealer_locations: allLocations.length > 0 ? allLocations : primary.dealer_locations,
      available_branches,
      branches_count: available_branches.length
    });
  }

  return consolidated;
}
