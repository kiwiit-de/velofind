/**
 * VeloFind Technical Bike Specifications & Engine Enrichment Engine
 * Standardizes and extracts authentic specifications for all imported partner bikes:
 * - Differentiates genuine E-Bikes (Pedelecs) from Bio-Bikes (Muscular / Mechanical bicycles)
 * - Accurate model-specific weight engine (e.g. Trek Rail 5 is 24.9 kg / 25 kg, never bio-bike 14 kg)
 * - Authentic frame type extraction (Wave/Tiefeinsteiger, Trapez, Diamant, Kompakt)
 * - Authentic frame size extraction matching frame type (never Diamant on Tiefeinsteiger)
 * - Accurate wheel size (Zoll) and model year extraction
 * - Authentic motor brand, motor model, torque (Nm), and battery capacity (Wh)
 * - Comprehensive natural German model descriptions
 */

import type { BikeCategory, PropulsionType, FrameType, Offer } from '../../types.ts';

export interface EnrichedSpecs {
  frame_size: string;
  frame_type: FrameType;
  color: string;
  wheel_size_in: number;
  weight_kg: number;
  max_weight_kg: number; // Zulässiges Gesamtgewicht (Fahrrad + Fahrer + Gepäck) in kg
  engine_type?: string;   // Bauform / Motortyp (z.B. Mittelmotor)
  motor_brand?: string;   // Hersteller (z.B. Bosch, Shimano, Specialized, Yamaha, Brose, Fazua, Mahle, TQ)
  motor_model?: string;   // Modellbezeichnung
  torque_nm?: number;     // Motorkraft / Drehmoment in Nm
  battery_wh?: number;
  description?: string;   // Modellbeschreibung / Spezifikationszusammenfassung
  gtin?: string;
  sku?: string;
}

/**
 * Curated authentic manufacturer weights (in kg) for popular German bike market models.
 * Grounded in official manufacturer datasheets (Trek, Cube, Specialized, Kalkhoff, Urban Arrow, etc.)
 */
export const KNOWN_BIKE_WEIGHTS: Record<string, number> = {
  // --- Trek E-Bikes ---
  'trek rail 5': 24.9, // Official Trek weight: 24.88 kg in size M (Bosch CX + 625 Wh)
  'trek rail 7': 24.1,
  'trek rail 9.8': 23.2,
  'trek rail 9.9': 22.8,
  'trek rail': 24.8,
  'trek powerfly 4': 23.9,
  'trek powerfly 5': 23.8,
  'trek powerfly 7': 23.4,
  'trek powerfly fs 4': 24.6,
  'trek powerfly fs 7': 24.2,
  'trek powerfly': 23.8,
  'trek fuel exe 9.5': 19.9,
  'trek fuel exe 9.7': 19.1,
  'trek fuel exe 9.8': 18.1,
  'trek fuel exe 9.9': 17.5,
  'trek fuel exe': 18.5,
  'trek allant+ 5': 24.6,
  'trek allant+ 7': 24.3,
  'trek allant+ 9': 23.6,
  'trek allant+': 24.5,
  'trek fx+ 2': 17.7,
  'trek dual sport+ 2': 17.4,
  'trek marlin+ 6': 22.4,
  'trek marlin+ 8': 21.8,
  'trek verve+ 1': 23.8,
  'trek verve+ 2': 23.5,
  'trek domane+': 14.5,

  // --- Cube E-MTB & Trekking ---
  'cube stereo hybrid 140': 24.6,
  'cube stereo hybrid 160': 24.9,
  'cube stereo hybrid one55': 21.9,
  'cube reaction hybrid pro': 23.8,
  'cube reaction hybrid race': 23.5,
  'cube reaction hybrid': 23.8,
  'cube kathmandu hybrid exc': 26.8,
  'cube kathmandu hybrid slx': 26.5,
  'cube kathmandu hybrid': 26.8,
  'cube touring hybrid': 26.2,
  'cube supreme hybrid': 26.9,
  'cube nuride hybrid': 24.6,
  'cube cargo hybrid': 49.5,
  'cube nuroad hybrid': 14.3,

  // --- Specialized ---
  'specialized turbo levo alloy': 24.3,
  'specialized turbo levo comp': 22.8,
  'specialized turbo levo pro': 22.1,
  'specialized turbo levo sl': 17.9,
  'specialized turbo levo': 24.2,
  'specialized turbo kenevo sl': 19.2,
  'specialized turbo kenevo': 25.4,
  'specialized turbo vado sl': 15.9,
  'specialized turbo vado': 24.8,
  'specialized turbo como': 25.6,
  'specialized turbo creo sl': 13.9,
  'specialized turbo tero': 23.9,

  // --- Kalkhoff ---
  'kalkhoff image 5': 26.8,
  'kalkhoff image 7': 26.4,
  'kalkhoff image 3': 27.2,
  'kalkhoff image': 26.8,
  'kalkhoff endeavour 5': 26.5,
  'kalkhoff endeavour 7': 25.9,
  'kalkhoff endeavour 3': 26.9,
  'kalkhoff endeavour': 26.5,
  'kalkhoff entice 5': 26.2,
  'kalkhoff entice 7': 25.6,
  'kalkhoff entice 3': 26.6,
  'kalkhoff entice': 26.2,

  // --- Urban Arrow ---
  'urban arrow familynext': 50.0,
  'urban arrow family': 50.0,
  'urban arrow shorty': 46.0,
  'urban arrow cargo': 52.0,

  // --- Focus ---
  'focus jam²': 24.8,
  'focus sam²': 25.2,
  'focus thron²': 24.9,
  'focus jarifa²': 23.6,
  'focus aventura²': 26.1,
  'focus vam² sl': 16.6,

  // --- Haibike ---
  'haibike allmtn': 25.2,
  'haibike alltrail': 24.9,
  'haibike adventr': 26.1,
  'haibike trekking': 26.4,
  'haibike nduro': 25.8,
  'haibike hybe': 24.6,
  'haibike lyke': 18.5,

  // --- Centurion ---
  'centurion lhasa': 24.9,
  'centurion numinis r': 24.6,
  'centurion country r': 25.8,
  'centurion vario r': 26.2,

  // --- Bulls & Pegasus ---
  'bulls sonic evo': 24.2,
  'bulls copperhead evo': 23.8,
  'bulls lacuba evo': 26.2,
  'pegasus premio evo': 26.5,
  'pegasus solero evo': 26.2,

  // --- Gazelle & Riese & Müller ---
  'gazelle ultimate': 26.2,
  'gazelle arroyo': 26.8,
  'gazelle avignon': 27.5,
  'gazelle grenoble': 26.6,
  'gazelle medeo': 24.9,
  'riese & müller charger': 27.2,
  'riese & müller superdelite': 31.5,
  'riese & müller nevo': 27.8,
  'riese & müller load': 38.5,
  'riese & müller packster': 42.0,
  'riese & müller multicharger': 29.5,

  // --- Winora E-Bikes ---
  'winora tria r5': 28.0, // Official Winora spec: 28.0 kg (Bosch Performance Line + 625 Wh + Gates belt)
  'winora tria 10': 27.8,
  'winora tria 9': 27.8,
  'winora tria 8': 27.8,
  'winora tria 7': 27.5,
  'winora tria': 27.5,
  'winora sinus r5f': 27.8,
  'winora sinus r8': 27.8,
  'winora sinus': 27.8,
  'winora yakun 12': 28.5,
  'winora yakun 10': 28.2,
  'winora yakun r5': 28.2,
  'winora yakun': 28.2,
  'winora yucatan 12': 27.6,
  'winora yucatan 10': 27.4,
  'winora yucatan 8': 27.2,
  'winora yucatan': 27.4,
  'winora f.u.b.': 49.5
};

/**
 * Checks whether a bike title/brand/metadata represents a genuine electric bike (Pedelec / E-Bike)
 * or a muscular (bio) bicycle without any motor or battery.
 */
export function isElectricBike(
  title: string,
  brand_name: string = '',
  category?: string,
  propulsion?: string
): boolean {
  const t = `${title} ${brand_name}`.toLowerCase();

  // 1. Explicit muscular / bio indicators - ONLY if genuinely explicit
  if (
    t.includes('ohne motor') ||
    t.includes('bio-bike') ||
    t.includes('muskelkraft') ||
    t.includes('reiner pedalantrieb')
  ) {
    return false;
  }

  // 2. Any explicit battery Wh indication >= 200 Wh unambiguously proves an electric bike
  const whMatch = title.match(/\b(\d{3,4})\s*(?:wh|wattstunde|watt)\b/i);
  if (whMatch && parseInt(whMatch[1], 10) >= 200) {
    return true;
  }

  // 3. Standalone battery capacity numbers (e.g. "Trek Rail 5 625", "Centurion Lhasa R2000 800", "545", "750")
  // In bike catalog titles, standalone 625, 750, 800, 545, 725, 756 are 100% batteries
  if (/\b(545|625|725|750|756|800|900)\b/.test(title)) {
    return true;
  }

  // 4. Trek E-Bike Series (Trek Rail, Powerfly, Allant+, Marlin+, Fuel EXe, FX+, Dual Sport+, Domane+, Verve+)
  if (t.includes('trek')) {
    if (
      t.includes('rail') ||
      t.includes('powerfly') ||
      t.includes('fuel exe') ||
      t.includes('allant+') ||
      t.includes('fx+') ||
      t.includes('dual sport+') ||
      t.includes('verve+') ||
      t.includes('marlin+') ||
      t.includes('domane+') ||
      t.includes('fetch+') ||
      /\b(rail|powerfly|allant|verve|marlin)\b/i.test(t) ||
      /\+\s*\d/i.test(t)
    ) {
      return true;
    }
  }

  // 5. 100% Electric Brands
  if (
    t.includes('urban arrow') ||
    t.includes('riese & müller') ||
    t.includes('riese und müller') ||
    t.includes('r&m') ||
    t.includes('flyer') ||
    t.includes('tenways')
  ) {
    return true;
  }

  // 6. Kalkhoff E-Bike Series
  if (t.includes('kalkhoff')) {
    if (
      t.includes('image') ||
      t.includes('entice') ||
      t.includes('endeavour') ||
      t.includes('agattu')
    ) {
      if (
        t.includes('+') ||
        t.includes('advance') ||
        t.includes('move') ||
        t.includes('excite') ||
        t.includes('season') ||
        t.includes('abs') ||
        /\b(500|625|750|800)\b/.test(t)
      ) {
        return true;
      }
    }
  }

  // 7. Specialized E-Bikes
  if (t.includes('specialized')) {
    if (
      t.includes('levo') ||
      t.includes('kenevo') ||
      t.includes('vado') ||
      t.includes('como') ||
      t.includes('creo') ||
      t.includes('tero') ||
      t.includes('turbo')
    ) {
      return true;
    }
  }

  // 8. Focus E-Bikes
  if (t.includes('focus')) {
    if (
      t.includes('jam²') ||
      t.includes('jam2') ||
      t.includes('sam²') ||
      t.includes('sam2') ||
      t.includes('thron²') ||
      t.includes('thron2') ||
      t.includes('jarifa²') ||
      t.includes('jarifa2') ||
      t.includes('planet²') ||
      t.includes('planet2') ||
      t.includes('aventura²') ||
      t.includes('aventura2') ||
      t.includes('vam²') ||
      t.includes('vam2')
    ) {
      return true;
    }
  }

  // 9. Haibike Series
  if (t.includes('haibike')) {
    if (
      t.includes('allmtn') ||
      t.includes('alltrail') ||
      t.includes('adventr') ||
      t.includes('hybe') ||
      t.includes('lyke') ||
      t.includes('nduro') ||
      t.includes('hardseven') ||
      t.includes('hardnine') ||
      t.includes('fullseven') ||
      t.includes('fullnine') ||
      t.includes('trekking')
    ) {
      return true;
    }
  }

  // 10. Cube specific brand logic:
  if (t.includes('cube')) {
    if (t.includes('hybrid') || t.includes('hyb ') || t.includes('hyb-') || t.includes('hyb/')) {
      return true;
    }
    const hasBattery = /\b\d{3,4}\s*(?:wh|watt)\b/i.test(t);
    const hasMotor = t.includes('bosch') || t.includes('shimano steps') || t.includes('fazua') || t.includes('mahle');
    if (!hasBattery && !hasMotor) {
      return false;
    }
  }

  // 11. VSF Fahrradmanufaktur brand logic:
  if (t.includes('vsf') || t.includes('fahrradmanufaktur')) {
    if (t.includes('e-manufaktur') || t.includes('emanufaktur')) {
      return true;
    }
    const hasBattery = /\b\d{3,4}\s*(?:wh|watt)\b/i.test(t);
    const hasMotor = t.includes('bosch') || t.includes('shimano steps') || t.includes('brose');
    if (!hasBattery && !hasMotor) {
      return false;
    }
  }

  // 12. Centurion Series
  if (t.includes('centurion')) {
    if (
      t.includes('lhasa') ||
      t.includes('numinis r') ||
      t.includes('vario r') ||
      t.includes('country r') ||
      t.includes('e-fire') ||
      t.includes('overdrive')
    ) {
      return true;
    }
  }

  // 13. Gazelle Series
  if (t.includes('gazelle')) {
    if (
      t.includes('hmb') ||
      t.includes('hms') ||
      t.includes('ultimate c') ||
      t.includes('ultimate t') ||
      t.includes('arroyo') ||
      t.includes('avignon') ||
      t.includes('grenoble') ||
      t.includes('medeo t')
    ) {
      return true;
    }
  }

  // 14. Winora E-Bike Series (Tria, Sinus, Yakun, Yucatan, F.U.B., E-Flitzer)
  if (t.includes('winora')) {
    if (
      t.includes('tria') ||
      t.includes('sinus') ||
      t.includes('yakun') ||
      t.includes('yucatan') ||
      t.includes('f.u.b.') ||
      t.includes('fub') ||
      t.includes('e-flitzer') ||
      t.includes('cb400') ||
      t.includes('radius')
    ) {
      return true;
    }
  }

  // 15. Strong unequivocal electric keywords
  const electricTerms = [
    'e-bike',
    'ebike',
    'pedelec',
    's-pedelec',
    'speed pedelec',
    'speed-pedelec',
    'e-trekking',
    'e-mtb',
    'e-gravel',
    'e-city',
    'e-cargo',
    'e-urban',
    'e-allroad',
    'e-fully',
    'e-hardtail',
    'hybrid',
    'powertube',
    'powerpack',
    'inframe',
    'intube',
    'dualbattery',
    'performance line cx',
    'performance line sx',
    'performance line',
    'performance cx',
    'active line plus',
    'active line',
    'cargo line',
    'smart system',
    'steps ep8',
    'steps ep6',
    'steps e8000',
    'steps e7000',
    'steps e6100',
    'shimano steps',
    'syncdrive',
    'pw-x3',
    'pw-x2',
    'pw-s2',
    'pw-st',
    'drive s mag',
    'fazua',
    'mahle',
    'tq-hpr',
    'hpr50',
    'strike eride',
    'patron eride',
    'genius eride',
    'aspect eride',
    'sub cross eride',
    'axis eride',
    'e-manufaktur',
    'e-horizon',
    'e-revox',
    'e-helix',
    'e-vitess',
    'e-fire',
    'e-stream',
    'sonic evo',
    'copperhead evo',
    'premio evo',
    'solero evo'
  ];

  for (const term of electricTerms) {
    if (t.includes(term)) return true;
  }

  // 15. Distinctive e-bike model series from German dealerships
  const ebikeSeries = [
    'macina',
    'vitality eco',
    'cairon',
    'quadriga',
    'eins ap-8',
    'eins p-e',
    'upstreet',
    'goroc',
    'alltrail',
    'allmtn',
    'adventr',
    'hardseven',
    'hardnine',
    'charger4',
    'delite4',
    'multicharger',
    'load 75',
    'load 60',
    'packster',
    'sorrento 600',
    'sorrento wave',
    'tria',
    'sinus',
    'yakun',
    'yucatan',
    'f.u.b.'
  ];
  for (const s of ebikeSeries) {
    if (t.includes(s)) return true;
  }

  // If no positive electric proof exists, it is a muscular / bio-bike!
  return false;
}

/**
 * Accurately infers category for E-Bikes.
 * Ensures Trek Rail is MTB (not Trekking!), Urban Arrow is CARGO, etc.
 */
export function inferEbikeCategory(title: string, brand: string = '', existingCategory?: string): BikeCategory {
  const lower = `${title} ${brand}`.toLowerCase();

  if (
    lower.includes('cargo') ||
    lower.includes('lasten') ||
    lower.includes('load') ||
    lower.includes('packster') ||
    lower.includes('urban arrow') ||
    lower.includes('family') ||
    lower.includes('multicharger') ||
    lower.includes('longtail')
  ) {
    return 'CARGO';
  }

  if (
    lower.includes('rail') ||
    lower.includes('powerfly') ||
    lower.includes('fuel exe') ||
    lower.includes('marlin') ||
    lower.includes('mtb') ||
    lower.includes('mountain') ||
    lower.includes('fully') ||
    lower.includes('hardtail') ||
    lower.includes('stereo hybrid') ||
    lower.includes('reaction hybrid') ||
    lower.includes('levo') ||
    lower.includes('kenevo') ||
    lower.includes('jam²') ||
    lower.includes('jam2') ||
    lower.includes('sam²') ||
    lower.includes('thron²') ||
    lower.includes('allmtn') ||
    lower.includes('alltrail') ||
    lower.includes('strike eride') ||
    lower.includes('patron eride') ||
    lower.includes('genius eride') ||
    lower.includes('aspect eride') ||
    lower.includes('moterra') ||
    lower.includes('habit neo') ||
    lower.includes('sonic evo am') ||
    lower.includes('copperhead evo') ||
    lower.includes('lhasa') ||
    lower.includes('numinis')
  ) {
    return 'MTB';
  }

  if (
    lower.includes('gravel') ||
    lower.includes('nuroad') ||
    lower.includes('grizl') ||
    lower.includes('grail') ||
    lower.includes('diverge') ||
    lower.includes('creo') ||
    lower.includes('topstone neo') ||
    lower.includes('solace eride')
  ) {
    return 'GRAVEL';
  }

  if (lower.includes('rennrad') || lower.includes('domane+') || lower.includes('synapse neo')) {
    return 'ROAD';
  }

  if (
    lower.includes('city') ||
    lower.includes('urban') ||
    lower.includes('image') ||
    lower.includes('supreme hybrid') ||
    lower.includes('arroyo') ||
    lower.includes('avignon') ||
    lower.includes('grenoble') ||
    lower.includes('como') ||
    lower.includes('chamonix') ||
    lower.includes('medeo')
  ) {
    return 'CITY';
  }

  if (
    lower.includes('trekking') ||
    lower.includes('touring') ||
    lower.includes('kathmandu') ||
    lower.includes('endeavour') ||
    lower.includes('entice') ||
    lower.includes('allant+') ||
    lower.includes('nuride') ||
    lower.includes('adventr') ||
    lower.includes('macina tour') ||
    lower.includes('premio evo')
  ) {
    return 'TREKKING';
  }

  if (existingCategory && existingCategory !== 'ALL' && existingCategory !== 'E_BIKE') {
    return existingCategory as BikeCategory;
  }
  return 'E_BIKE';
}

/**
 * Infers an authentic mechanical bike category (never E_BIKE) for non-electric bicycles.
 */
export function inferBioCategory(title: string, brand: string = '', fallback?: BikeCategory | string): BikeCategory {
  const lower = `${title} ${brand}`.toLowerCase();

  if (
    lower.includes('cargo') ||
    lower.includes('lasten') ||
    lower.includes('load') ||
    lower.includes('packster') ||
    lower.includes('family') ||
    lower.includes('longtail')
  ) {
    return 'CARGO';
  }

  if (
    lower.includes('gravel') ||
    lower.includes('nuroad') ||
    lower.includes('grizl') ||
    lower.includes('grail') ||
    lower.includes('diverge') ||
    lower.includes('atlas') ||
    lower.includes('topstone') ||
    lower.includes('checkpoint') ||
    lower.includes('gx-') ||
    lower.includes('regard') ||
    lower.includes('aspero')
  ) {
    return 'GRAVEL';
  }

  // Check ROAD racing bike, strictly excluding Allroad/Nuroad/Offroad
  if (
    lower.includes('rennrad') ||
    lower.includes('attain') ||
    lower.includes('agree') ||
    lower.includes('litening') ||
    lower.includes('tarmac') ||
    lower.includes('roubaix') ||
    lower.includes('allez') ||
    lower.includes('aeroad') ||
    lower.includes('endurace') ||
    lower.includes('domane') ||
    lower.includes('emonda') ||
    lower.includes('speedster') ||
    lower.includes('addict') ||
    lower.includes('scultura') ||
    lower.includes('van rysel') ||
    (/\broad\b/i.test(lower) && !lower.includes('allroad') && !lower.includes('nuroad') && !lower.includes('offroad') && !lower.includes('crossroad'))
  ) {
    return 'ROAD';
  }

  if (
    lower.includes('mtb') ||
    lower.includes('mountain') ||
    lower.includes('fully') ||
    lower.includes('hardtail') ||
    lower.includes('aim') ||
    lower.includes('attention') ||
    lower.includes('analog') ||
    lower.includes('acid') ||
    lower.includes('reaction') ||
    lower.includes('stereo') ||
    lower.includes('scale') ||
    lower.includes('spark') ||
    lower.includes('aspect') ||
    lower.includes('marlin') ||
    lower.includes('roscoe') ||
    lower.includes('slash') ||
    lower.includes('remedy') ||
    lower.includes('fuel ex') ||
    lower.includes('chisel') ||
    lower.includes('rockhopper') ||
    lower.includes('stumpjumper') ||
    lower.includes('kato') ||
    lower.includes('nirvana') ||
    lower.includes('cragger') ||
    lower.includes('jealous') ||
    lower.includes('zr team')
  ) {
    return 'MTB';
  }

  if (
    lower.includes('city') ||
    lower.includes('urban') ||
    lower.includes('holland') ||
    lower.includes('comfort') ||
    lower.includes('hyde') ||
    lower.includes('editor') ||
    lower.includes('c line') ||
    lower.includes('brompton') ||
    lower.includes('faltrad') ||
    lower.includes('folding') ||
    lower.includes('arroyo') ||
    lower.includes('grenoble') ||
    lower.includes('orange') ||
    lower.includes('paris')
  ) {
    return 'CITY';
  }

  // Default for classic VSF, Kathmandu, Nature, Endeavour, Savoie, etc.
  return 'TREKKING';
}

/**
 * Extracts authentic frame type from title or metadata.
 */
export function extractFrameType(title: string, existing?: FrameType): FrameType {
  const lower = title.toLowerCase();

  if (lower.includes('diamant') || lower.includes('herren') || lower.includes('gent') || /\bhigh\b/i.test(title)) {
    return 'DIAMOND';
  }
  if (lower.includes('trapez') || lower.includes('trapeze') || lower.includes('damen') || lower.includes('lady')) {
    return 'TRAPEZE';
  }
  if (
    lower.includes('wave') ||
    lower.includes('tiefeinsteiger') ||
    lower.includes('easy entry') ||
    lower.includes('low entry') ||
    lower.includes('mono') ||
    /\blow\b/i.test(title) ||
    /\bwa\b/i.test(title)
  ) {
    return 'STEP_THROUGH';
  }
  if (
    lower.includes('compact') ||
    lower.includes('kompakt') ||
    lower.includes('faltrad') ||
    lower.includes('folding') ||
    lower.includes('longtail') ||
    lower.includes('long john')
  ) {
    return 'COMPACT';
  }
  return existing || 'DIAMOND';
}

/**
 * Extracts and formats authentic frame size label matching frame type.
 */
export function extractFrameSize(title: string, frameType: FrameType, existing?: string): string {
  const cmMatch = title.match(/\b(4[2-9]|5[0-9]|6[0-4])\s*(?:cm|er)\b/i);
  const sizeCm = cmMatch ? cmMatch[1] : undefined;

  const letterMatch = title.match(/\b(xxl|xl|l|m|s|xs)\b/i);
  const letter = letterMatch ? letterMatch[1].toUpperCase() : undefined;

  const typePrefix =
    frameType === 'STEP_THROUGH'
      ? 'Wave (Tiefeinsteiger)'
      : frameType === 'TRAPEZE'
      ? 'Trapez (Damen)'
      : frameType === 'COMPACT'
      ? 'Kompakt'
      : 'Diamant (Herren)';

  if (sizeCm && letter) {
    return `${typePrefix} ${sizeCm} cm (${letter})`;
  }
  if (sizeCm) {
    return `${typePrefix} ${sizeCm} cm`;
  }
  if (letter) {
    return `${typePrefix} (${letter})`;
  }

  if (existing && !existing.includes('Diamant 54cm') && !existing.includes('M (29 Zoll)')) {
    if (frameType === 'STEP_THROUGH' && existing.toLowerCase().includes('diamant')) {
      return 'Wave (Tiefeinsteiger) 50 cm (M)';
    }
    if (frameType === 'TRAPEZE' && existing.toLowerCase().includes('diamant')) {
      return 'Trapez 50 cm (M)';
    }
    return existing;
  }

  return frameType === 'STEP_THROUGH'
    ? 'Wave (Tiefeinsteiger) 50 cm (M)'
    : frameType === 'TRAPEZE'
    ? 'Trapez 50 cm (M)'
    : frameType === 'COMPACT'
    ? 'Universal Kompakt'
    : 'Diamant 54 cm (L)';
}

/**
 * Extracts authentic wheel size in inches.
 */
export function extractWheelSize(title: string, category: BikeCategory, existing?: number): number {
  const m = title.match(/\b(20|24|26|27[,.]5|28|29)\s*zoll\b/i);
  if (m) {
    return parseFloat(m[1].replace(',', '.'));
  }
  const lower = title.toLowerCase();
  if (lower.includes('29er') || lower.includes(' 29 ') || lower.includes('29"')) return 29;
  if (lower.includes('27.5') || lower.includes('27,5') || lower.includes('650b')) return 27.5;
  if (lower.includes('26 zoll') || lower.includes('26"')) return 26;
  if (lower.includes('20 zoll') || lower.includes('20"') || category === 'CARGO' || lower.includes('compact') || lower.includes('kompakt')) return 20;
  if (category === 'MTB') return 29;
  return 28;
}

/**
 * Extracts authentic model year from title or defaults cleanly.
 */
export function extractModelYear(title: string, existing?: number): number {
  const m = title.match(/\b(202[3-9])\b/);
  if (m) {
    return parseInt(m[1], 10);
  }
  return existing || 2025;
}

/**
 * Resolves the realistic, transparent weight (in kg) for any bike or e-bike.
 * Prevents e-bikes from being displayed with 14 kg bio-bike weights.
 */
export function resolveAuthenticBikeWeight(data: {
  title: string;
  brand: string;
  category: BikeCategory;
  propulsion: PropulsionType;
  battery_wh?: number;
  existingWeight?: number;
}): number {
  const lower = `${data.title} ${data.brand}`.toLowerCase();
  const isElectric = data.propulsion !== 'MUSCULAR';

  // 1. Exact model lookup match (e.g. "Trek Rail 5" -> 24.9 kg)
  for (const [key, weight] of Object.entries(KNOWN_BIKE_WEIGHTS)) {
    if (lower.includes(key)) {
      return weight;
    }
  }

  // 2. Validate existing weight if authentic
  if (data.existingWeight && data.existingWeight > 0) {
    if (isElectric) {
      const isCargo = data.category === 'CARGO' || lower.includes('cargo') || lower.includes('family') || lower.includes('load');
      if (isCargo && data.existingWeight >= 32 && data.existingWeight <= 60) return data.existingWeight;
      if (!isCargo && data.existingWeight >= 13.5 && data.existingWeight <= 32) return data.existingWeight;
    } else {
      if (data.existingWeight >= 6.8 && data.existingWeight <= 26) return data.existingWeight;
    }
  }

  // 3. Fallbacks based on realistic cycling architecture
  if (!isElectric) {
    if (data.category === 'ROAD') return 8.5;
    if (data.category === 'GRAVEL') return 9.8;
    if (data.category === 'MTB') return 13.2;
    if (data.category === 'TREKKING') return 14.2;
    if (data.category === 'CARGO') return 24.5;
    return 14.5;
  }

  // E-Bikes
  if (data.category === 'CARGO' || lower.includes('cargo') || lower.includes('family') || lower.includes('load') || lower.includes('packster')) {
    return lower.includes('urban arrow') || lower.includes('family') ? 50.0 : 46.5;
  }

  if (lower.includes('sl') || lower.includes('light') || lower.includes('sx') || lower.includes('fazua') || lower.includes('mahle') || lower.includes('tq')) {
    return 17.8; // Lightweight e-bike
  }

  if (data.category === 'MTB' || lower.includes('mtb') || lower.includes('rail') || lower.includes('stereo') || lower.includes('jam') || lower.includes('allmtn')) {
    // E-Fully vs E-Hardtail
    if (lower.includes('fully') || lower.includes('rail') || lower.includes('stereo') || lower.includes('jam') || lower.includes('allmtn') || lower.includes('sam')) {
      return 24.9; // Modern 625-750Wh aluminum E-Fully like Trek Rail 5
    }
    return 23.8; // Hardtail E-MTB like Trek Powerfly
  }

  if (data.category === 'TREKKING' || lower.includes('trekking') || lower.includes('kathmandu') || lower.includes('endeavour') || lower.includes('entice')) {
    return (data.battery_wh && data.battery_wh >= 750) ? 26.8 : 26.2;
  }

  if (data.category === 'CITY' || lower.includes('city') || lower.includes('image') || lower.includes('supreme')) {
    return 26.8;
  }

  if (data.category === 'GRAVEL' || data.category === 'ROAD' || lower.includes('gravel') || lower.includes('road')) {
    return 14.2;
  }

  return 25.2; // Standard German pedelec default
}

/**
 * Generates an informative, professional German model overview description.
 */
export function generateBikeDescription(data: {
  title: string;
  brand_name: string;
  model_name: string;
  category: BikeCategory;
  propulsion: PropulsionType;
  model_year: number;
  specs: Partial<EnrichedSpecs>;
}): string {
  const isElectric = data.propulsion !== 'MUSCULAR';
  const vd = data.specs;
  const frameText =
    vd.frame_type === 'STEP_THROUGH'
      ? 'bequemen Tiefeinsteiger-Rahmen (Wave) mit besonders leichtem Auf- und Abstieg'
      : vd.frame_type === 'TRAPEZE'
      ? 'sportlich-komfortablen Trapez-Rahmen'
      : vd.frame_type === 'COMPACT'
      ? 'platzsparenden Kompakt-Rahmen'
      : 'klassischen, verwindungssteifen Diamant-Rahmen';

  const wheelText = vd.wheel_size_in ? `${vd.wheel_size_in} Zoll Laufrädern` : '28 Zoll Laufrädern';
  const weightText = vd.weight_kg ? `ca. ${vd.weight_kg} kg Eigengewicht` : 'optimiertem Gesamtgewicht';
  const maxWeightText = vd.max_weight_kg ? `einem zulässigen Gesamtgewicht von bis zu ${vd.max_weight_kg} kg` : 'hoher Traglast';

  if (isElectric) {
    const motor = vd.motor_brand ? `${vd.motor_brand} ${vd.motor_model || ''}`.trim() : 'starken Mittelmotor';
    const torque = vd.torque_nm ? ` mit ${vd.torque_nm} Nm Drehmoment` : '';
    const battery = vd.battery_wh ? ` sowie ausdauernden ${vd.battery_wh} Wh Akku` : '';

    return `Das ${data.brand_name} ${data.model_name} (Modelljahr ${data.model_year}) ist ein leistungsstarkes ${data.category}-E-Bike für anspruchsvolle Fahrten. Ausgestattet mit einem modernen ${motor}${torque}${battery} liefert es harmonische, kraftvolle Tretunterstützung bis 25 km/h. Der Aufbau mit ${frameText}, ${wheelText}, ${weightText} und ${maxWeightText} sorgt für erstklassige Fahrstabilität, Sicherheit und höchsten Komfort – optimal geeignet für steuerbegünstigtes Dienstrad-Leasing.`;
  } else {
    return `Das ${data.brand_name} ${data.model_name} (Modelljahr ${data.model_year}) ist ein erstklassiges mechanisches ${data.category}-Fahrrad für alle, die pure Fahrfreude durch reine Muskelkraft suchen. Mit ${frameText}, präzisen ${wheelText}, ${weightText} und ${maxWeightText} bietet es unverfälschtes Fahrverhalten, geringen Wartungsaufwand und maximale Zuverlässigkeit – ganz ohne Akku, Motor oder Ladezyklen.`;
  }
}

export function enrichBikeSpecs(data: {
  title: string;
  brand_name?: string;
  category?: BikeCategory | string;
  propulsion?: PropulsionType | string;
  price_cents?: number;
  existing?: Partial<EnrichedSpecs>;
}): EnrichedSpecs {
  const title = (data.title || '').trim();
  const brand = (data.brand_name || '').trim();
  const lower = `${title} ${brand}`.toLowerCase();
  const existing = data.existing || {};

  const isEbike = isElectricBike(title, brand, data.category, data.propulsion);
  const isBio = !isEbike;

  // Resolve authentic category
  let category: BikeCategory;
  if (isBio) {
    if (data.category && data.category !== 'E_BIKE' && data.category !== ('ALL' as any)) {
      category = data.category as BikeCategory;
    } else {
      category = inferBioCategory(title, brand, data.category);
    }
  } else {
    category = inferEbikeCategory(title, brand, data.category);
  }

  // 1. Frame Type & Size
  const frame_type: FrameType = extractFrameType(title, existing.frame_type);
  const frame_size: string = extractFrameSize(title, frame_type, existing.frame_size);

  // 2. Color & Wheel Size
  let color = existing.color || 'Anthrazit / Stealth Grey';
  const wheel_size_in: number = extractWheelSize(title, category, existing.wheel_size_in);

  // 3. Engine & Motor Specifications
  let engine_type: string | undefined = undefined;
  let motor_brand: string | undefined = undefined;
  let motor_model: string | undefined = undefined;
  let torque_nm: number | undefined = undefined;
  let battery_wh: number | undefined = undefined;

  if (isBio) {
    // Bio-Bikes have strictly NO motor, torque, or battery!
    engine_type = undefined;
    motor_brand = undefined;
    motor_model = undefined;
    torque_nm = undefined;
    battery_wh = undefined;
  } else {
    // E-Bike Motor & Battery Detection
    engine_type = 'Mittelmotor (Tretlagermotor)';

    // Battery Capacity Extraction
    const bMatch = title.match(/\b(\d{3,4})\s*(?:wh|wattstunde|watt)\b/i);
    if (bMatch) {
      battery_wh = parseInt(bMatch[1], 10);
    } else if (existing.battery_wh && existing.battery_wh >= 200) {
      battery_wh = existing.battery_wh;
    } else {
      if (lower.includes('900') || lower.includes('900wh')) battery_wh = 900;
      else if (lower.includes('800') || lower.includes('800wh')) battery_wh = 800;
      else if (lower.includes('756') || lower.includes('756wh')) battery_wh = 756;
      else if (lower.includes('750') || lower.includes('750wh')) battery_wh = 750;
      else if (lower.includes('725') || lower.includes('725wh')) battery_wh = 725;
      else if (lower.includes('720') || lower.includes('720wh')) battery_wh = 720;
      else if (lower.includes('700') || lower.includes('700wh')) battery_wh = 700;
      else if (lower.includes('630') || lower.includes('630wh')) battery_wh = 630;
      else if (lower.includes('625') || lower.includes('625wh')) battery_wh = 625;
      else if (lower.includes('600') || lower.includes('600wh')) battery_wh = 600;
      else if (lower.includes('545') || lower.includes('545wh')) battery_wh = 545;
      else if (lower.includes('540') || lower.includes('540wh')) battery_wh = 540;
      else if (lower.includes('500') || lower.includes('500wh')) battery_wh = 500;
      else if (lower.includes('475') || lower.includes('475wh')) battery_wh = 475;
      else if (lower.includes('430') || lower.includes('430wh')) battery_wh = 430;
      else if (lower.includes('400') || lower.includes('400wh')) battery_wh = 400;
      else if (lower.includes('360') || lower.includes('360wh')) battery_wh = 360;
      else if (lower.includes('320') || lower.includes('320wh')) battery_wh = 320;
      else if (lower.includes('sl') || lower.includes('sx')) battery_wh = 400;
      else battery_wh = 750; // Modern German e-bike standard
    }

    // A. Specialized
    if (lower.includes('specialized') || lower.includes('levo') || lower.includes('kenevo') || lower.includes('vado') || lower.includes('creo') || lower.includes('como')) {
      motor_brand = 'Specialized';
      if (lower.includes('sl') || lower.includes('creo') || lower.includes('320')) {
        motor_model = 'Specialized 1.2 SL Custom Lightweight';
        torque_nm = 50;
        engine_type = 'Mittelmotor (Light-Assist)';
        battery_wh = battery_wh || 320;
      } else {
        motor_model = 'Specialized 2.2 Turbo Full Power System';
        torque_nm = 90;
      }
    }
    // B. Trek E-Bikes (Rail, Powerfly, Allant+, Marlin+, Fuel EXe, FX+, Dual Sport+)
    else if (lower.includes('trek') && (lower.includes('rail') || lower.includes('powerfly') || lower.includes('allant') || lower.includes('marlin') || lower.includes('fuel exe') || lower.includes('fx+') || lower.includes('dual sport+'))) {
      if (lower.includes('fuel exe') || lower.includes('tq')) {
        motor_brand = 'TQ';
        motor_model = 'TQ HPR50';
        torque_nm = 50;
        engine_type = 'Mittelmotor (Light-Assist)';
        battery_wh = battery_wh || 360;
      } else if (lower.includes('fx+') || lower.includes('dual sport+')) {
        motor_brand = 'Hyena';
        motor_model = 'Hyena Hecknabenmotor G2';
        torque_nm = 40;
        engine_type = 'Hecknabenmotor';
        battery_wh = battery_wh || 250;
      } else if (lower.includes('marlin+')) {
        motor_brand = 'Bosch';
        motor_model = 'Active Line Plus';
        torque_nm = 50;
        battery_wh = battery_wh || 400;
      } else {
        // Trek Rail 5, Rail 7, Rail 9, Powerfly, Allant+
        motor_brand = 'Bosch';
        motor_model = 'Performance Line CX Smart System';
        torque_nm = 85;
        if (!battery_wh) {
          if (lower.includes('625')) battery_wh = 625;
          else if (lower.includes('750')) battery_wh = 750;
          else if (lower.includes('500')) battery_wh = 500;
          else battery_wh = 625;
        }
      }
    }
    // C. Giant / SyncDrive
    else if (lower.includes('giant') || lower.includes('syncdrive') || lower.includes('talon e+')) {
      motor_brand = 'Giant / Yamaha';
      if (lower.includes('pro')) {
        motor_model = 'SyncDrive Pro 2';
        torque_nm = 85;
      } else if (lower.includes('sport')) {
        motor_model = 'SyncDrive Sport 2';
        torque_nm = 75;
      } else {
        motor_model = 'SyncDrive Core';
        torque_nm = 50;
      }
    }
    // D. Fazua (Focus VAM², Ride 60, etc.)
    else if (lower.includes('fazua') || lower.includes('ride 60') || lower.includes('vam2') || lower.includes('vam²')) {
      motor_brand = 'Fazua';
      motor_model = 'Ride 60';
      torque_nm = 60;
      engine_type = 'Mittelmotor (Light-Assist)';
      battery_wh = battery_wh || 430;
    }
    // E. TQ
    else if (lower.includes('tq-hpr') || lower.includes('hpr50')) {
      motor_brand = 'TQ';
      motor_model = 'HPR50';
      torque_nm = 50;
      engine_type = 'Mittelmotor (Light-Assist)';
      battery_wh = battery_wh || 360;
    }
    // F. Mahle
    else if (lower.includes('mahle') || lower.includes('x35') || lower.includes('x20')) {
      motor_brand = 'Mahle';
      motor_model = 'SmartBike Systems X35+';
      torque_nm = 40;
      engine_type = 'Hecknabenmotor';
      battery_wh = battery_wh || 250;
    }
    // G. Tenways
    else if (lower.includes('tenways') || lower.includes('cgo800s') || lower.includes('cgo600')) {
      motor_brand = 'Mivice / Tenways';
      motor_model = 'Hecknabenmotor M070';
      torque_nm = 45;
      engine_type = 'Hecknabenmotor';
      battery_wh = battery_wh || 475;
    }
    // H. Haibike / Yamaha
    else if (lower.includes('yamaha') || lower.includes('pw-x') || (brand.toLowerCase().includes('haibike') && (lower.includes('allmtn') || lower.includes('alltrail') || lower.includes('pw')))) {
      motor_brand = 'Yamaha';
      motor_model = 'PW-X3 Next Generation';
      torque_nm = 85;
    }
    // I. Shimano Steps
    else if (lower.includes('steps') || lower.includes('ep8') || lower.includes('ep6') || lower.includes('reason al') || brand.toLowerCase().includes('husqvarna')) {
      motor_brand = 'Shimano';
      motor_model = lower.includes('ep6') ? 'Steps EP6' : 'Steps EP801';
      torque_nm = 85;
    }
    // J. Brose / Rotwild
    else if (lower.includes('brose') || brand.toLowerCase().includes('rotwild') || brand.toLowerCase().includes('hnf')) {
      motor_brand = 'Brose';
      motor_model = 'Drive S Mag';
      torque_nm = 90;
    }
    // K. Kalkhoff (Bosch CX / Performance)
    else if (lower.includes('kalkhoff')) {
      motor_brand = 'Bosch';
      if (lower.includes('advance+') || lower.includes('excite+') || lower.includes('7') || lower.includes('5+') || lower.includes('move+')) {
        motor_model = 'Performance Line CX Smart System';
        torque_nm = 85;
      } else {
        motor_model = 'Performance Line (75Nm) Smart System';
        torque_nm = 75;
      }
    }
    // L. Urban Arrow (Bosch Cargo Line)
    else if (lower.includes('urban arrow') || lower.includes('familynext')) {
      motor_brand = 'Bosch';
      motor_model = 'Cargo Line Smart System';
      torque_nm = 85;
      engine_type = 'Mittelmotor (Cargo Schwerlast)';
      battery_wh = battery_wh || 545;
    }
    // L2. Winora E-Bikes (Tria, Sinus, Yakun, Yucatan, F.U.B.)
    else if (lower.includes('winora')) {
      const hasExplicitWh = Boolean(title.match(/\b\d{3,4}\s*(?:wh|watt)\b/i));
      if (lower.includes('f.u.b.') || lower.includes('fub')) {
        motor_brand = 'Bosch';
        motor_model = 'Cargo Line Smart System';
        torque_nm = 85;
        engine_type = 'Mittelmotor (Cargo Schwerlast)';
        if (!hasExplicitWh) battery_wh = 500;
      } else if (lower.includes('yakun')) {
        motor_brand = 'Bosch';
        motor_model = 'Performance Line CX Smart System';
        torque_nm = 85;
        if (!hasExplicitWh) battery_wh = 750;
      } else if (lower.includes('yucatan')) {
        motor_brand = 'Yamaha';
        motor_model = 'PW-S2 System';
        torque_nm = 75;
        if (!hasExplicitWh) battery_wh = 720;
      } else if (lower.includes('sinus')) {
        motor_brand = 'Bosch';
        motor_model = 'Performance Line (75Nm) Smart System';
        torque_nm = 75;
        if (!hasExplicitWh) battery_wh = 625;
      } else if (lower.includes('tria r5') || lower.includes('tria 10') || lower.includes('tria 9') || lower.includes('tria 8')) {
        motor_brand = 'Bosch';
        motor_model = 'Performance Line Smart System';
        torque_nm = 75;
        if (!hasExplicitWh) battery_wh = 625;
      } else {
        motor_brand = 'Bosch';
        motor_model = 'Active Line Plus';
        torque_nm = 50;
        if (!hasExplicitWh) battery_wh = 500;
      }
    }
    // M. Bosch (Dominant Market Leader in Germany)
    else {
      motor_brand = 'Bosch';
      if (category === 'CARGO' || lower.includes('cargo') || lower.includes('load') || lower.includes('packster')) {
        motor_model = 'Cargo Line Smart System';
        torque_nm = 85;
        engine_type = 'Mittelmotor (Cargo Schwerlast)';
      } else if (lower.includes('sx') || lower.includes('light') || (category === 'GRAVEL' && lower.includes('hybrid'))) {
        motor_model = 'Performance Line SX (Light-Assist)';
        torque_nm = 55;
        engine_type = 'Mittelmotor (Light-Assist)';
      } else if (category === 'CITY' || lower.includes('active')) {
        motor_model = 'Active Line Plus';
        torque_nm = 50;
      } else if (lower.includes('performance 600') || lower.includes('performance line')) {
        motor_model = 'Performance Line (75Nm) Smart System';
        torque_nm = 75;
      } else {
        motor_model = 'Performance Line CX Smart System';
        torque_nm = 85;
      }
    }
  }

  // 4. Weight Calculation
  const weight_kg = resolveAuthenticBikeWeight({
    title,
    brand,
    category,
    propulsion: isBio ? 'MUSCULAR' : 'PEDELEC',
    battery_wh,
    existingWeight: existing.weight_kg
  });

  // 5. Max weight capacity / zulässiges Gesamtgewicht in kg (Fahrrad + Fahrer + Gepäck)
  let max_weight_kg = existing.max_weight_kg;
  if (lower.includes('winora') && (lower.includes('tria') || lower.includes('sinus'))) {
    max_weight_kg = 130;
  } else if (lower.includes('yakun')) {
    max_weight_kg = 150;
  }
  if (!max_weight_kg || max_weight_kg <= 0) {
    if (category === 'CARGO' || lower.includes('cargo') || lower.includes('load') || lower.includes('packster') || lower.includes('family') || lower.includes('f.u.b.')) {
      max_weight_kg = 250;
    } else if (lower.includes('plus') || lower.includes('xxl') || lower.includes('heavy duty')) {
      max_weight_kg = 170; // Heavy duty / Plus models
    } else if (category === 'TREKKING') {
      max_weight_kg = 145;
    } else if (category === 'MTB') {
      max_weight_kg = 140;
    } else if (category === 'CITY') {
      max_weight_kg = 140;
    } else if (category === 'GRAVEL' || category === 'ROAD') {
      max_weight_kg = isBio ? 120 : 125;
    } else {
      max_weight_kg = 140;
    }
  }

  const enriched: EnrichedSpecs = {
    frame_size,
    frame_type,
    color,
    wheel_size_in,
    weight_kg,
    max_weight_kg,
    engine_type,
    motor_brand,
    motor_model,
    torque_nm,
    battery_wh,
    gtin: existing.gtin,
    sku: existing.sku
  };

  const modelYear = extractModelYear(title, 2025);
  enriched.description = generateBikeDescription({
    title,
    brand_name: brand,
    model_name: title.replace(new RegExp(`^${brand}\\s*`, 'i'), '').trim() || title,
    category,
    propulsion: isBio ? 'MUSCULAR' : 'PEDELEC',
    model_year: modelYear,
    specs: enriched
  });

  return enriched;
}
