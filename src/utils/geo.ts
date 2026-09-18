/**
 * Geolocation & Geodesic Calculation Utilities for VeloFind
 * Provides coordinates resolution for German postal codes and cities,
 * Haversine distance calculations, and proximity filtering.
 */

import { Dealer, DealerLocation } from '../types';

export interface GeoLocation {
  lat: number;
  lng: number;
  name: string;
  isApproximate?: boolean;
}

export interface DealerWithDistance extends Dealer {
  primaryLocation: DealerLocation;
  distanceKm: number;
}

// Major German Postal Codes and Cities Reference
export const GERMAN_GEO_REFERENCE: Record<string, { lat: number; lng: number; name: string }> = {
  // Cities by name (lowercase)
  'berlin': { lat: 52.5200, lng: 13.4050, name: 'Berlin' },
  'münchen': { lat: 48.1371, lng: 11.5754, name: 'München' },
  'muenchen': { lat: 48.1371, lng: 11.5754, name: 'München' },
  'munich': { lat: 48.1371, lng: 11.5754, name: 'München' },
  'hamburg': { lat: 53.5511, lng: 9.9937, name: 'Hamburg' },
  'köln': { lat: 50.9375, lng: 6.9603, name: 'Köln' },
  'koeln': { lat: 50.9375, lng: 6.9603, name: 'Köln' },
  'cologne': { lat: 50.9375, lng: 6.9603, name: 'Köln' },
  'frankfurt': { lat: 50.1109, lng: 8.6821, name: 'Frankfurt am Main' },
  'stuttgart': { lat: 48.7758, lng: 9.1829, name: 'Stuttgart' },
  'leipzig': { lat: 51.3397, lng: 12.3731, name: 'Leipzig' },
  'düsseldorf': { lat: 51.2277, lng: 6.7735, name: 'Düsseldorf' },
  'duesseldorf': { lat: 51.2277, lng: 6.7735, name: 'Düsseldorf' },
  'dortmund': { lat: 51.5136, lng: 7.4653, name: 'Dortmund' },
  'essen': { lat: 51.4556, lng: 7.0116, name: 'Essen' },
  'bremen': { lat: 53.0793, lng: 8.8017, name: 'Bremen' },
  'dresden': { lat: 51.0504, lng: 13.7373, name: 'Dresden' },
  'hannover': { lat: 52.3759, lng: 9.7320, name: 'Hannover' },
  'nürnberg': { lat: 49.4521, lng: 11.0767, name: 'Nürnberg' },
  'nuernberg': { lat: 49.4521, lng: 11.0767, name: 'Nürnberg' },
  'duisburg': { lat: 51.4344, lng: 6.7623, name: 'Duisburg' },
  'bochum': { lat: 51.4818, lng: 7.2162, name: 'Bochum' },
  'wuppertal': { lat: 51.2562, lng: 7.1508, name: 'Wuppertal' },
  'bielefeld': { lat: 52.0302, lng: 8.5325, name: 'Bielefeld' },
  'bonn': { lat: 50.7374, lng: 7.0982, name: 'Bonn' },
  'münster': { lat: 51.9607, lng: 7.6261, name: 'Münster' },
  'muenster': { lat: 51.9607, lng: 7.6261, name: 'Münster' },
  'karlsruhe': { lat: 49.0069, lng: 8.4037, name: 'Karlsruhe' },
  'mannheim': { lat: 49.4875, lng: 8.4660, name: 'Mannheim' },
  'augsburg': { lat: 48.3705, lng: 10.8978, name: 'Augsburg' },
  'wiesbaden': { lat: 50.0826, lng: 8.2400, name: 'Wiesbaden' },
  'gelsenkirchen': { lat: 51.5177, lng: 7.0857, name: 'Gelsenkirchen' },
  'mönchengladbach': { lat: 51.1805, lng: 6.4428, name: 'Mönchengladbach' },
  'braunschweig': { lat: 52.2689, lng: 10.5268, name: 'Braunschweig' },
  'chemnitz': { lat: 50.8278, lng: 12.9214, name: 'Chemnitz' },
  'kiel': { lat: 54.3233, lng: 10.1228, name: 'Kiel' },
  'aachen': { lat: 50.7753, lng: 6.0839, name: 'Aachen' },
  'halle': { lat: 51.4828, lng: 11.9697, name: 'Halle (Saale)' },
  'magdeburg': { lat: 52.1205, lng: 11.6276, name: 'Magdeburg' },
  'freiburg': { lat: 47.9990, lng: 7.8421, name: 'Freiburg im Breisgau' },
  'krefeld': { lat: 51.3388, lng: 6.5853, name: 'Krefeld' },
  'mainz': { lat: 49.9929, lng: 8.2473, name: 'Mainz' },
  'lübeck': { lat: 53.8655, lng: 10.6866, name: 'Lübeck' },
  'erfurt': { lat: 50.9848, lng: 11.0299, name: 'Erfurt' },
  'oberhausen': { lat: 51.4963, lng: 6.8638, name: 'Oberhausen' },
  'rostock': { lat: 54.0924, lng: 12.0991, name: 'Rostock' },
  'kassel': { lat: 51.3127, lng: 9.4797, name: 'Kassel' },
  'hagen': { lat: 51.3671, lng: 7.4633, name: 'Hagen' },
  'potsdam': { lat: 52.3906, lng: 13.0645, name: 'Potsdam' },
  'saarbrücken': { lat: 49.2402, lng: 6.9969, name: 'Saarbrücken' },
  'hamm': { lat: 51.6811, lng: 7.8184, name: 'Hamm' },
  'paderborn': { lat: 51.7189, lng: 8.7575, name: 'Paderborn' },
  'heidelberg': { lat: 49.3988, lng: 8.6724, name: 'Heidelberg' },
  'darmstadt': { lat: 49.8728, lng: 8.6512, name: 'Darmstadt' },
  'würzburg': { lat: 49.7913, lng: 9.9534, name: 'Würzburg' },
  'regensburg': { lat: 49.0134, lng: 12.1016, name: 'Regensburg' },
  'göttingen': { lat: 51.5413, lng: 9.9158, name: 'Göttingen' },
  'ulm': { lat: 48.4011, lng: 9.9876, name: 'Ulm' },
  'heilbronn': { lat: 49.1427, lng: 9.2109, name: 'Heilbronn' },
  'pforzheim': { lat: 48.8932, lng: 8.7049, name: 'Pforzheim' },
  'wolfsburg': { lat: 52.4227, lng: 10.7865, name: 'Wolfsburg' },
  'ingolstadt': { lat: 48.7665, lng: 11.4258, name: 'Ingolstadt' },
  'offenbach': { lat: 50.1055, lng: 8.7612, name: 'Offenbach am Main' },
  'f蓮th': { lat: 49.4774, lng: 10.9886, name: 'Fürth' },
  'fürth': { lat: 49.4774, lng: 10.9886, name: 'Fürth' },
  'reutlingen': { lat: 48.4833, lng: 9.2167, name: 'Reutlingen' },
  'soest': { lat: 51.5714, lng: 8.1067, name: 'Soest' },
  'brilon': { lat: 51.3957, lng: 8.5746, name: 'Brilon' },

  // Key Postal Codes (5-digit)
  '10115': { lat: 52.5200, lng: 13.4050, name: 'Berlin Mitte' },
  '10117': { lat: 52.5170, lng: 13.3889, name: 'Berlin Unter den Linden' },
  '10178': { lat: 52.5219, lng: 13.4132, name: 'Berlin Alexanderplatz' },
  '10785': { lat: 52.5050, lng: 13.3650, name: 'Berlin Tiergarten' },
  '20095': { lat: 53.5511, lng: 9.9937, name: 'Hamburg City' },
  '20354': { lat: 53.5580, lng: 9.9880, name: 'Hamburg Neustadt' },
  '22083': { lat: 53.5810, lng: 10.0270, name: 'Hamburg Barmbek' },
  '28195': { lat: 53.0793, lng: 8.8017, name: 'Bremen Mitte' },
  '30159': { lat: 52.3759, lng: 9.7320, name: 'Hannover Mitte' },
  '33602': { lat: 52.0302, lng: 8.5325, name: 'Bielefeld Zentrum' },
  '33098': { lat: 51.7189, lng: 8.7575, name: 'Paderborn' },
  '34117': { lat: 51.3127, lng: 9.4797, name: 'Kassel Zentrum' },
  '37073': { lat: 51.5413, lng: 9.9158, name: 'Göttingen' },
  '38100': { lat: 52.2689, lng: 10.5268, name: 'Braunschweig' },
  '39104': { lat: 52.1205, lng: 11.6276, name: 'Magdeburg' },
  '40213': { lat: 51.2277, lng: 6.7735, name: 'Düsseldorf Altstadt' },
  '44137': { lat: 51.5136, lng: 7.4653, name: 'Dortmund' },
  '45127': { lat: 51.4556, lng: 7.0116, name: 'Essen Stadtkern' },
  '48143': { lat: 51.9607, lng: 7.6261, name: 'Münster' },
  '50667': { lat: 50.9375, lng: 6.9603, name: 'Köln Altstadt' },
  '53111': { lat: 50.7374, lng: 7.0982, name: 'Bonn Zentrum' },
  '59065': { lat: 51.6811, lng: 7.8184, name: 'Hamm' },
  '59494': { lat: 51.5714, lng: 8.1067, name: 'Soest' },
  '60311': { lat: 50.1109, lng: 8.6821, name: 'Frankfurt Innenstadt' },
  '65183': { lat: 50.0826, lng: 8.2400, name: 'Wiesbaden' },
  '68159': { lat: 49.4875, lng: 8.4660, name: 'Mannheim' },
  '69115': { lat: 49.3988, lng: 8.6724, name: 'Heidelberg' },
  '70173': { lat: 48.7758, lng: 9.1829, name: 'Stuttgart Mitte' },
  '76133': { lat: 49.0069, lng: 8.4037, name: 'Karlsruhe' },
  '79098': { lat: 47.9990, lng: 7.8421, name: 'Freiburg im Breisgau' },
  '80331': { lat: 48.1371, lng: 11.5754, name: 'München Altstadt' },
  '80333': { lat: 48.1450, lng: 11.5710, name: 'München Maxvorstadt' },
  '86150': { lat: 48.3705, lng: 10.8978, name: 'Augsburg' },
  '88045': { lat: 47.6542, lng: 9.4792, name: 'Friedrichshafen' },
  '89073': { lat: 48.4011, lng: 9.9876, name: 'Ulm' },
  '90403': { lat: 49.4521, lng: 11.0767, name: 'Nürnberg Altstadt' },
  '93047': { lat: 49.0134, lng: 12.1016, name: 'Regensburg' },
  '97070': { lat: 49.7913, lng: 9.9534, name: 'Würzburg' },
  '99084': { lat: 50.9848, lng: 11.0299, name: 'Erfurt' }
};

// Approximate coordinates by 2-digit German Leitregion (PLZ zone)
export const PLZ_2DIGIT_REGIONS: Record<string, { lat: number; lng: number; name: string }> = {
  '01': { lat: 51.0504, lng: 13.7373, name: 'Region Dresden' },
  '02': { lat: 51.1815, lng: 14.4244, name: 'Region Bautzen / Görlitz' },
  '03': { lat: 51.7563, lng: 14.3329, name: 'Region Cottbus' },
  '04': { lat: 51.3397, lng: 12.3731, name: 'Region Leipzig' },
  '06': { lat: 51.4828, lng: 11.9697, name: 'Region Halle / Dessau' },
  '07': { lat: 50.9271, lng: 11.5892, name: 'Region Jena / Gera' },
  '08': { lat: 50.7189, lng: 12.4922, name: 'Region Zwickau / Plauen' },
  '09': { lat: 50.8278, lng: 12.9214, name: 'Region Chemnitz' },
  '10': { lat: 52.5200, lng: 13.4050, name: 'Berlin Zentrum' },
  '12': { lat: 52.4500, lng: 13.5000, name: 'Berlin Süd / Köpenick' },
  '13': { lat: 52.5800, lng: 13.3500, name: 'Berlin Nord / Reinickendorf' },
  '14': { lat: 52.3906, lng: 13.0645, name: 'Region Potsdam' },
  '15': { lat: 52.3414, lng: 14.5510, name: 'Region Frankfurt (Oder)' },
  '16': { lat: 52.7533, lng: 13.2386, name: 'Region Oranienburg' },
  '17': { lat: 53.5574, lng: 13.2610, name: 'Region Neubrandenburg' },
  '18': { lat: 54.0924, lng: 12.0991, name: 'Region Rostock' },
  '19': { lat: 53.6355, lng: 11.4012, name: 'Region Schwerin' },
  '20': { lat: 53.5511, lng: 9.9937, name: 'Hamburg City' },
  '21': { lat: 53.3000, lng: 10.1000, name: 'Region Lüneburg / Harburg' },
  '22': { lat: 53.6000, lng: 10.0500, name: 'Hamburg Nord' },
  '23': { lat: 53.8655, lng: 10.6866, name: 'Region Lübeck' },
  '24': { lat: 54.3233, lng: 10.1228, name: 'Region Kiel / Flensburg' },
  '25': { lat: 54.0000, lng: 9.1000, name: 'Region Elmshorn / Nordsee' },
  '26': { lat: 53.1435, lng: 8.2146, name: 'Region Oldenburg / Ostfriesland' },
  '27': { lat: 53.5396, lng: 8.5809, name: 'Region Bremerhaven / Cuxhaven' },
  '28': { lat: 53.0793, lng: 8.8017, name: 'Bremen & Umland' },
  '29': { lat: 52.6248, lng: 10.0815, name: 'Region Celle / Uelzen' },
  '30': { lat: 52.3759, lng: 9.7320, name: 'Region Hannover' },
  '31': { lat: 52.1548, lng: 9.9579, name: 'Region Hildesheim / Hameln' },
  '32': { lat: 52.1158, lng: 8.6719, name: 'Region Herford / Minden' },
  '33': { lat: 52.0302, lng: 8.5325, name: 'Region Bielefeld / Paderborn' },
  '34': { lat: 51.3127, lng: 9.4797, name: 'Region Kassel' },
  '35': { lat: 50.5873, lng: 8.6755, name: 'Region Gießen / Marburg' },
  '36': { lat: 50.5528, lng: 9.6757, name: 'Region Fulda' },
  '37': { lat: 51.5413, lng: 9.9158, name: 'Region Göttingen' },
  '38': { lat: 52.2689, lng: 10.5268, name: 'Region Braunschweig / Wolfsburg' },
  '39': { lat: 52.1205, lng: 11.6276, name: 'Region Magdeburg' },
  '40': { lat: 51.2277, lng: 6.7735, name: 'Region Düsseldorf' },
  '41': { lat: 51.1805, lng: 6.4428, name: 'Region Mönchengladbach / Neuss' },
  '42': { lat: 51.2562, lng: 7.1508, name: 'Region Wuppertal / Solingen' },
  '44': { lat: 51.5136, lng: 7.4653, name: 'Region Dortmund' },
  '45': { lat: 51.4556, lng: 7.0116, name: 'Region Essen / Gelsenkirchen' },
  '46': { lat: 51.4963, lng: 6.8638, name: 'Region Oberhausen / Bottrop' },
  '47': { lat: 51.4344, lng: 6.7623, name: 'Region Duisburg / Krefeld' },
  '48': { lat: 51.9607, lng: 7.6261, name: 'Region Münster' },
  '49': { lat: 52.2799, lng: 8.0472, name: 'Region Osnabrück' },
  '50': { lat: 50.9375, lng: 6.9603, name: 'Region Köln' },
  '51': { lat: 50.9856, lng: 7.1328, name: 'Region Leverkusen / Bergisch Gladbach' },
  '52': { lat: 50.7753, lng: 6.0839, name: 'Region Aachen' },
  '53': { lat: 50.7374, lng: 7.0982, name: 'Region Bonn' },
  '54': { lat: 49.7597, lng: 6.6414, name: 'Region Trier' },
  '55': { lat: 49.9929, lng: 8.2473, name: 'Region Mainz' },
  '56': { lat: 50.3569, lng: 7.5890, name: 'Region Koblenz' },
  '57': { lat: 50.8744, lng: 8.0243, name: 'Region Siegen' },
  '58': { lat: 51.3671, lng: 7.4633, name: 'Region Hagen / Iserlohn' },
  '59': { lat: 51.6811, lng: 7.8184, name: 'Region Hamm / Soest / Arnsberg' },
  '60': { lat: 50.1109, lng: 8.6821, name: 'Region Frankfurt am Main' },
  '61': { lat: 50.2274, lng: 8.6148, name: 'Region Bad Homburg' },
  '63': { lat: 50.1332, lng: 8.9288, name: 'Region Hanau / Aschaffenburg' },
  '64': { lat: 49.8728, lng: 8.6512, name: 'Region Darmstadt' },
  '65': { lat: 50.0826, lng: 8.2400, name: 'Region Wiesbaden' },
  '66': { lat: 49.2402, lng: 6.9969, name: 'Region Saarbrücken' },
  '67': { lat: 49.4447, lng: 8.3587, name: 'Region Ludwigshafen / Kaiserslautern' },
  '68': { lat: 49.4875, lng: 8.4660, name: 'Region Mannheim' },
  '69': { lat: 49.3988, lng: 8.6724, name: 'Region Heidelberg' },
  '70': { lat: 48.7758, lng: 9.1829, name: 'Region Stuttgart' },
  '71': { lat: 48.8974, lng: 9.1919, name: 'Region Ludwigsburg / Böblingen' },
  '72': { lat: 48.4833, lng: 9.2167, name: 'Region Reutlingen / Tübingen' },
  '73': { lat: 48.7058, lng: 9.6586, name: 'Region Göppingen / Esslingen' },
  '74': { lat: 49.1427, lng: 9.2109, name: 'Region Heilbronn' },
  '75': { lat: 48.8932, lng: 8.7049, name: 'Region Pforzheim' },
  '76': { lat: 49.0069, lng: 8.4037, name: 'Region Karlsruhe' },
  '77': { lat: 48.4738, lng: 7.9449, name: 'Region Offenburg' },
  '78': { lat: 48.0645, lng: 8.4601, name: 'Region Villingen-Schwenningen / Konstanz' },
  '79': { lat: 47.9990, lng: 7.8421, name: 'Region Freiburg im Breisgau' },
  '80': { lat: 48.1371, lng: 11.5754, name: 'Region München' },
  '82': { lat: 48.0000, lng: 11.4000, name: 'Region Starnberg / Fürstenfeldbruck' },
  '83': { lat: 47.8564, lng: 12.1289, name: 'Region Rosenheim' },
  '84': { lat: 48.5369, lng: 12.1522, name: 'Region Landshut' },
  '85': { lat: 48.7665, lng: 11.4258, name: 'Region Ingolstadt / Freising' },
  '86': { lat: 48.3705, lng: 10.8978, name: 'Region Augsburg' },
  '87': { lat: 47.7267, lng: 10.3139, name: 'Region Kempten (Allgäu)' },
  '88': { lat: 47.6542, lng: 9.4792, name: 'Region Friedrichshafen / Ravensburg' },
  '89': { lat: 48.4011, lng: 9.9876, name: 'Region Ulm' },
  '90': { lat: 49.4521, lng: 11.0767, name: 'Region Nürnberg' },
  '91': { lat: 49.5978, lng: 11.0037, name: 'Region Erlangen / Fürth' },
  '92': { lat: 49.6766, lng: 12.1642, name: 'Region Weiden / Amberg' },
  '93': { lat: 49.0134, lng: 12.1016, name: 'Region Regensburg' },
  '94': { lat: 48.5748, lng: 13.4569, name: 'Region Passau' },
  '95': { lat: 49.9482, lng: 11.5783, name: 'Region Bayreuth / Hof' },
  '96': { lat: 49.8988, lng: 10.9028, name: 'Region Bamberg / Coburg' },
  '97': { lat: 49.7913, lng: 9.9534, name: 'Region Würzburg / Schweinfurt' },
  '98': { lat: 50.6094, lng: 10.6908, name: 'Region Suhl' },
  '99': { lat: 50.9848, lng: 11.0299, name: 'Region Erfurt / Weimar' }
};

// Geodesic distance calculation in kilometers (Haversine formula)
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Resolve geographic coordinates for an input string (Postal Code or City name).
 * Searches static coordinates, registered partner dealers, and 2-digit PLZ regions.
 */
export function resolveLocation(
  query: string,
  dealers: Dealer[] = []
): GeoLocation | null {
  if (!query || !query.trim()) return null;
  const clean = query.trim().toLowerCase();

  // 1. Direct match in dictionary (city name or exact PLZ)
  if (GERMAN_GEO_REFERENCE[clean]) {
    return { ...GERMAN_GEO_REFERENCE[clean], isApproximate: false };
  }

  // 2. Exact match in dealers catalog
  const exactDealerLoc = dealers
    .flatMap((d) => d.locations)
    .find((l) => l.postal_code.toLowerCase() === clean || l.city.toLowerCase() === clean);

  if (exactDealerLoc && exactDealerLoc.latitude && exactDealerLoc.longitude) {
    return {
      lat: exactDealerLoc.latitude,
      lng: exactDealerLoc.longitude,
      name: `${exactDealerLoc.postal_code} ${exactDealerLoc.city}`,
      isApproximate: false
    };
  }

  // 3. Partial match on dealer city name
  const cityDealerLoc = dealers
    .flatMap((d) => d.locations)
    .find((l) => l.city.toLowerCase().includes(clean) || clean.includes(l.city.toLowerCase()));

  if (cityDealerLoc && cityDealerLoc.latitude && cityDealerLoc.longitude) {
    return {
      lat: cityDealerLoc.latitude,
      lng: cityDealerLoc.longitude,
      name: cityDealerLoc.city,
      isApproximate: false
    };
  }

  // 4. 2-digit PLZ prefix fallback
  const numericDigits = clean.replace(/\D/g, '');
  if (numericDigits.length >= 2) {
    const prefix2 = numericDigits.slice(0, 2);
    if (PLZ_2DIGIT_REGIONS[prefix2]) {
      return {
        ...PLZ_2DIGIT_REGIONS[prefix2],
        isApproximate: true
      };
    }
  }

  // 5. Check if any dealer starts with the first digits
  if (numericDigits.length >= 1) {
    const matchingDealers = dealers
      .flatMap((d) => d.locations)
      .filter((l) => l.postal_code.startsWith(numericDigits.slice(0, 2)) || l.postal_code.startsWith(numericDigits.slice(0, 1)));

    if (matchingDealers.length > 0) {
      const avgLat = matchingDealers.reduce((sum, l) => sum + l.latitude, 0) / matchingDealers.length;
      const avgLng = matchingDealers.reduce((sum, l) => sum + l.longitude, 0) / matchingDealers.length;
      return {
        lat: avgLat,
        lng: avgLng,
        name: `PLZ ${query}`,
        isApproximate: true
      };
    }
  }

  // Default geographical center of Germany
  return {
    lat: 51.1657,
    lng: 10.4515,
    name: query,
    isApproximate: true
  };
}

/**
 * Filter and sort dealers by proximity to a given center coordinate.
 */
export function getNearbyDealers(
  dealers: Dealer[],
  centerLat: number,
  centerLng: number,
  radiusKm: number = 50
): DealerWithDistance[] {
  const result: DealerWithDistance[] = [];

  for (const dealer of dealers) {
    const loc = dealer.locations?.[0];
    if (!loc || !loc.latitude || !loc.longitude) continue;

    const dist = calculateDistanceKm(centerLat, centerLng, loc.latitude, loc.longitude);

    if (dist <= radiusKm) {
      result.push({
        ...dealer,
        primaryLocation: loc,
        distanceKm: dist
      });
    }
  }

  return result.sort((a, b) => a.distanceKm - b.distanceKm);
}
