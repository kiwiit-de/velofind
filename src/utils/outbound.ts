/**
 * Partner Outbound Link & Click Attribution Utility
 * Ensures that clicking an offer always opens the bike's direct partner offer URL,
 * while safely dispatching non-blocking click tracking to the backend.
 */

import { Offer } from '../types.ts';
import { apiUrl } from '../lib/api.ts';

export function getDirectOfferUrl(offer: Offer): string {
  if (offer.source_url && offer.source_url.startsWith('http')) {
    // If it's a specific product link, return directly
    return offer.source_url;
  }

  const queryTerm = `${offer.brand_name || ''} ${offer.title || ''}`.trim();
  const slug = (offer.dealer_slug || '').toLowerCase();
  const urlLower = (offer.source_url || '').toLowerCase();

  // Smart partner search fallbacks
  if (slug.includes('boc') || slug.includes('b-o-c') || urlLower.includes('boc24')) {
    return `https://www.boc24.de/search?q=${encodeURIComponent(queryTerm)}`;
  }
  if (slug.includes('fahrrad-xxl') || urlLower.includes('fahrrad-xxl')) {
    return `https://www.fahrrad-xxl.de/suche/?q=${encodeURIComponent(queryTerm)}`;
  }
  if (slug.includes('lucky-bike') || urlLower.includes('lucky-bike')) {
    return `https://www.lucky-bike.de/suche/?query=${encodeURIComponent(queryTerm)}`;
  }
  if (slug.includes('decathlon') || urlLower.includes('decathlon')) {
    return `https://www.decathlon.de/search?Ntt=${encodeURIComponent(queryTerm)}`;
  }

  if (offer.source_url && offer.source_url.trim() !== '') {
    return offer.source_url.startsWith('http') ? offer.source_url : `https://${offer.source_url}`;
  }

  return `https://www.google.com/search?q=${encodeURIComponent(queryTerm + ' ' + (offer.dealer_name || ''))}`;
}

export function openPartnerOffer(offer: Offer): void {
  const directUrl = getDirectOfferUrl(offer);

  // Directly open the partner website in a secure new tab
  try {
    window.open(directUrl, '_blank', 'noopener,noreferrer');
  } catch (e) {
    // Fallback if popup blocked
    window.location.href = directUrl;
  }

  // Non-blocking background click attribution ping
  try {
    fetch(apiUrl(`/api/out/${encodeURIComponent(offer.id)}?json=true`), {
      method: 'GET',
      keepalive: true
    }).catch(() => {
      // Ignore background tracking network issues
    });
  } catch {
    // Non-blocking
  }
}
