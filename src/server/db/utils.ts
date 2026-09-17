/**
 * VeloFind Server Utilities
 * Geocoding reference, geodesic calculations, sanitization, and UUID generation.
 */

// Approximate German city coordinates for geocoding PLZ / city search
export const GERMAN_LOCATIONS: Record<string, { lat: number; lng: number; name: string }> = {
  '10115': { lat: 52.5200, lng: 13.4050, name: 'Berlin Mitte' },
  'berlin': { lat: 52.5200, lng: 13.4050, name: 'Berlin' },
  '80331': { lat: 48.1371, lng: 11.5754, name: 'München Altstadt' },
  'münchen': { lat: 48.1371, lng: 11.5754, name: 'München' },
  'munich': { lat: 48.1371, lng: 11.5754, name: 'München' },
  '20095': { lat: 53.5511, lng: 9.9937, name: 'Hamburg City' },
  'hamburg': { lat: 53.5511, lng: 9.9937, name: 'Hamburg' },
  '50667': { lat: 50.9375, lng: 6.9603, name: 'Köln Innenstadt' },
  'köln': { lat: 50.9375, lng: 6.9603, name: 'Köln' },
  'cologne': { lat: 50.9375, lng: 6.9603, name: 'Köln' },
  '60311': { lat: 50.1109, lng: 8.6821, name: 'Frankfurt am Main' },
  'frankfurt': { lat: 50.1109, lng: 8.6821, name: 'Frankfurt am Main' },
  '70173': { lat: 48.7758, lng: 9.1829, name: 'Stuttgart Mitte' },
  'stuttgart': { lat: 48.7758, lng: 9.1829, name: 'Stuttgart' },
  '04109': { lat: 51.3397, lng: 12.3731, name: 'Leipzig Zentrum' },
  'leipzig': { lat: 51.3397, lng: 12.3731, name: 'Leipzig' },
  '40213': { lat: 51.2277, lng: 6.7735, name: 'Düsseldorf Altstadt' },
  'düsseldorf': { lat: 51.2277, lng: 6.7735, name: 'Düsseldorf' },
  '44137': { lat: 51.5136, lng: 7.4653, name: 'Dortmund' },
  'dortmund': { lat: 51.5136, lng: 7.4653, name: 'Dortmund' },
  '48143': { lat: 51.9607, lng: 7.6261, name: 'Münster' },
  'münster': { lat: 51.9607, lng: 7.6261, name: 'Münster' },
  '79098': { lat: 47.9990, lng: 7.8421, name: 'Freiburg im Breisgau' },
  'freiburg': { lat: 47.9990, lng: 7.8421, name: 'Freiburg im Breisgau' },
  '30159': { lat: 52.3759, lng: 9.7320, name: 'Hannover' },
  'hannover': { lat: 52.3759, lng: 9.7320, name: 'Hannover' },
  '90403': { lat: 49.4521, lng: 11.0767, name: 'Nürnberg' },
  'nürnberg': { lat: 49.4521, lng: 11.0767, name: 'Nürnberg' },
  '33602': { lat: 52.0302, lng: 8.5325, name: 'Bielefeld' },
  'bielefeld': { lat: 52.0302, lng: 8.5325, name: 'Bielefeld' },
  '33098': { lat: 51.7189, lng: 8.7575, name: 'Paderborn' },
  'paderborn': { lat: 51.7189, lng: 8.7575, name: 'Paderborn' },
  '59065': { lat: 51.6811, lng: 7.8184, name: 'Hamm' },
  'hamm': { lat: 51.6811, lng: 7.8184, name: 'Hamm' },
  '34117': { lat: 51.3127, lng: 9.4797, name: 'Kassel' },
  'kassel': { lat: 51.3127, lng: 9.4797, name: 'Kassel' },
  '38100': { lat: 52.2689, lng: 10.5268, name: 'Braunschweig' },
  'braunschweig': { lat: 52.2689, lng: 10.5268, name: 'Braunschweig' },
  '39104': { lat: 52.1205, lng: 11.6276, name: 'Magdeburg' },
  'magdeburg': { lat: 52.1205, lng: 11.6276, name: 'Magdeburg' },
  '37073': { lat: 51.5413, lng: 9.9158, name: 'Göttingen' },
  'göttingen': { lat: 51.5413, lng: 9.9158, name: 'Göttingen' },
  'goettingen': { lat: 51.5413, lng: 9.9158, name: 'Göttingen' },
  '59494': { lat: 51.5714, lng: 8.1067, name: 'Soest' },
  'soest': { lat: 51.5714, lng: 8.1067, name: 'Soest' },
  '59929': { lat: 51.3957, lng: 8.5746, name: 'Brilon' },
  'brilon': { lat: 51.3957, lng: 8.5746, name: 'Brilon' },
  '59457': { lat: 51.5528, lng: 7.9137, name: 'Werl' },
  'werl': { lat: 51.5528, lng: 7.9137, name: 'Werl' },
  '59269': { lat: 51.7554, lng: 8.0412, name: 'Beckum' },
  'beckum': { lat: 51.7554, lng: 8.0412, name: 'Beckum' },
  '31785': { lat: 52.1030, lng: 9.3564, name: 'Hameln' },
  'hameln': { lat: 52.1030, lng: 9.3564, name: 'Hameln' },
  '37574': { lat: 51.8167, lng: 9.8667, name: 'Einbeck' },
  'einbeck': { lat: 51.8167, lng: 9.8667, name: 'Einbeck' },
  '37154': { lat: 51.7064, lng: 10.0006, name: 'Northeim' },
  'northeim': { lat: 51.7064, lng: 10.0006, name: 'Northeim' },
  '99734': { lat: 51.5050, lng: 10.7933, name: 'Nordhausen' },
  'nordhausen': { lat: 51.5050, lng: 10.7933, name: 'Nordhausen' },
  '59846': { lat: 51.3283, lng: 8.0039, name: 'Sundern' },
  'sundern': { lat: 51.3283, lng: 8.0039, name: 'Sundern' },
  '59955': { lat: 51.1969, lng: 8.5333, name: 'Winterberg' },
  'winterberg': { lat: 51.1969, lng: 8.5333, name: 'Winterberg' },
  '34508': { lat: 51.2961, lng: 8.6111, name: 'Willingen' },
  'willingen': { lat: 51.2961, lng: 8.6111, name: 'Willingen' },
  '38640': { lat: 51.9060, lng: 10.4292, name: 'Goslar' },
  'goslar': { lat: 51.9060, lng: 10.4292, name: 'Goslar' },
  'harz': { lat: 51.9060, lng: 10.4292, name: 'Harz' },
  '58636': { lat: 51.3769, lng: 7.6975, name: 'Iserlohn' },
  'iserlohn': { lat: 51.3769, lng: 7.6975, name: 'Iserlohn' }
};

// Geodesic distance calculation matching PostGIS ST_Distance(geography, geography)
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
}

// Generate deterministic UUIDv4
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Formula Injection Defense for CSV imports and export sanitization
export function sanitizeCSVField(val: string): string {
  if (!val) return '';
  const trimmed = val.trim();
  if (['=', '+', '-', '@', '\t', '\r'].includes(trimmed.charAt(0))) {
    return "'" + trimmed;
  }
  return trimmed;
}
