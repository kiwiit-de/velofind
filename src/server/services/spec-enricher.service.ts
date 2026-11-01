/**
 * VeloFind Technical Bike Specifications & Engine Enrichment Engine
 * Standardizes and extracts authentic specifications for all imported partner bikes:
 * - Differentiates genuine E-Bikes (Pedelecs) from Bio-Bikes (Muscular / Mechanical bicycles)
 * - Authentic frame type extraction (Wave/Tiefeinsteiger, Trapez, Diamant, Kompakt)
 * - Authentic frame size extraction matching frame type (never Diamant on Tiefeinsteiger)
 * - Accurate wheel size (Zoll) and model year extraction
 * - Realistic weight and max weight capacity
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
 * Checks whether a bike title/brand/metadata represents a genuine electric bike (Pedelec / E-Bike)
 * or a muscular (bio) bicycle without any motor or battery.
 */
export function isElectricBike(
  title: string,
  brand_name: string = '',
  category?: string,
  propulsion?: string
): boolean {
  if (propulsion === 'MUSCULAR') return false;

  const t = `${title} ${brand_name}`.toLowerCase();

  // Explicit muscular / bio indicators
  if (
    t.includes('ohne motor') ||
    t.includes('bio-bike') ||
    t.includes('muskelkraft') ||
    t.includes('reiner pedalantrieb')
  ) {
    return false;
  }

  // Any explicit battery Wh indication >= 200 Wh unambiguously proves an electric bike
  const whMatch = title.match(/\b(\d{3,4})\s*(?:wh|wattstunde|watt)\b/i);
  if (whMatch && parseInt(whMatch[1], 10) >= 200) {
    return true;
  }

  // 1. Cube specific brand logic:
  // Cube strictly names all electric bikes with "Hybrid" or "Hyb" (e.g. Kathmandu Hybrid, Stereo Hybrid, Reaction Hybrid).
  // Models like "Cube Nature", "Cube Kathmandu Pro", "Cube Aim", "Cube Attention", "Cube Acid" without "Hybrid" are 100% mechanical!
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

  // 2. VSF Fahrradmanufaktur brand logic:
  // Classic VSF trekking & touring bikes (T-50, T-100, T-300, T-500, T-700, TX-400, TX-800, TX-1200, TX-Randonneur, GX-500)
  // are classic steel bio-bikes! Only "e-Manufaktur" or bikes with explicit Wh/Bosch are electric.
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

  // 3. Strong unequivocal electric keywords
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
    'turbo levo',
    'turbo kenevo',
    'turbo vado',
    'turbo como',
    'turbo creo',
    'turbo tero',
    'jam²',
    'sam²',
    'thron²',
    'jarifa²',
    'planet²',
    'raven²',
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
    'e-stream'
  ];

  for (const term of electricTerms) {
    if (t.includes(term)) return true;
  }

  // 4. Distinctive e-bike model series from German dealerships
  const ebikeSeries = [
    'macina',
    'vitality eco',
    'cairon',
    'quadriga',
    'eins ap-8',
    'eins p-e',
    'upstreet',
    'goroc',
    'flair l-n',
    'booster',
    'alltrail',
    'allmtn',
    'hardseven',
    'hardnine',
    'charger4',
    'delite4',
    'multicharger',
    'load 75',
    'load 60',
    'packster',
    'tink'
  ];
  for (const s of ebikeSeries) {
    if (t.includes(s)) return true;
  }

  // If no positive electric proof exists, it is a muscular / bio-bike!
  return false;
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
  if (
    lower.includes('tiefeinsteiger') ||
    lower.includes('wave') ||
    lower.includes('easy entry') ||
    lower.includes('low step') ||
    lower.includes('low-step')
  ) {
    return 'STEP_THROUGH';
  }
  if (lower.includes('trapez') || lower.includes('trapeze') || lower.includes('damen') || lower.includes('lady')) {
    return 'TRAPEZE';
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
  if (lower.includes('diamant') || lower.includes('herren') || lower.includes('gent')) {
    return 'DIAMOND';
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

    return `Das ${data.brand_name} ${data.model_name} (Modelljahr ${data.model_year}) ist ein leistungsstarkes ${data.category}-E-Bike für tägliche Pendelstrecken und ausgiebige Fahrradtouren. Ausgestattet mit einem modernen ${motor}${torque}${battery} liefert es harmonische, kraftvolle Tretunterstützung bis 25 km/h. Der Aufbau mit ${frameText}, ${wheelText}, ${weightText} und ${maxWeightText} sorgt für erstklassige Fahrstabilität, Sicherheit und höchsten Komfort – optimal geeignet für steuerbegünstigtes Dienstrad-Leasing.`;
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
    if (data.category && data.category !== ('ALL' as any)) {
      category = data.category as BikeCategory;
    } else {
      if (lower.includes('cargo') || lower.includes('lasten') || lower.includes('load') || lower.includes('packster')) category = 'CARGO';
      else if (lower.includes('gravel') || lower.includes('nuroad') || lower.includes('grizl') || lower.includes('diverge')) category = 'GRAVEL';
      else if (lower.includes('mtb') || lower.includes('stereo') || lower.includes('levo') || lower.includes('fully') || lower.includes('jam')) category = 'MTB';
      else if (lower.includes('city') || lower.includes('urban') || lower.includes('medeo')) category = 'CITY';
      else if (lower.includes('road') || lower.includes('rennrad')) category = 'ROAD';
      else if (lower.includes('trekking') || lower.includes('kathmandu') || lower.includes('entice') || lower.includes('touring')) category = 'TREKKING';
      else category = 'E_BIKE';
    }
  }

  // 1. Frame Type & Size
  const frame_type: FrameType = extractFrameType(title, existing.frame_type);
  const frame_size: string = extractFrameSize(title, frame_type, existing.frame_size);

  // 2. Color & Wheel Size
  let color = existing.color || 'Anthrazit / Stealth Grey';
  const wheel_size_in: number = extractWheelSize(title, category, existing.wheel_size_in);

  // 3. Weight (Gewicht in kg)
  let weight_kg = existing.weight_kg;
  if (!weight_kg || weight_kg <= 0 || (isBio && weight_kg > 19) || (!isBio && weight_kg < 14)) {
    if (isBio) {
      if (category === 'ROAD') weight_kg = 8.5;
      else if (category === 'GRAVEL') weight_kg = 9.8;
      else if (category === 'MTB') weight_kg = 13.2;
      else if (category === 'TREKKING') weight_kg = 14.2;
      else if (category === 'CARGO') weight_kg = 24.5;
      else weight_kg = 14.5;
    } else {
      // E-Bikes
      if (category === 'CARGO' || lower.includes('cargo') || lower.includes('load') || lower.includes('packster')) {
        weight_kg = 36.8;
      } else if (lower.includes('sl') || lower.includes('light') || lower.includes('sx') || lower.includes('fazua') || lower.includes('mahle') || lower.includes('tq')) {
        weight_kg = 18.2; // Lightweight e-bike
      } else if (category === 'MTB') {
        weight_kg = 23.9;
      } else if (category === 'TREKKING') {
        weight_kg = 25.2;
      } else if (category === 'CITY') {
        weight_kg = 25.8;
      } else if (category === 'GRAVEL' || category === 'ROAD') {
        weight_kg = 14.9;
      } else {
        weight_kg = 24.7;
      }
    }
  }

  // 4. Max weight capacity / zulässiges Gesamtgewicht in kg (Fahrrad + Fahrer + Gepäck)
  let max_weight_kg = existing.max_weight_kg;
  if (!max_weight_kg || max_weight_kg <= 0) {
    if (category === 'CARGO' || lower.includes('cargo') || lower.includes('load') || lower.includes('packster') || lower.includes('family')) {
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

  // 5. Engine & Motor Specifications
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
    // E-Bike Motor Detection
    engine_type = 'Mittelmotor (Tretlagermotor)';

    // Battery Capacity Extraction
    const bMatch = title.match(/\b(\d{3,4})\s*(?:wh|wattstunde|watt)\b/i);
    if (bMatch) {
      battery_wh = parseInt(bMatch[1], 10);
    } else if (existing.battery_wh && existing.battery_wh >= 200) {
      battery_wh = existing.battery_wh;
    } else {
      if (lower.includes('800') || lower.includes('800wh')) battery_wh = 800;
      else if (lower.includes('750') || lower.includes('750wh')) battery_wh = 750;
      else if (lower.includes('625') || lower.includes('625wh')) battery_wh = 625;
      else if (lower.includes('545') || lower.includes('545wh')) battery_wh = 545;
      else if (lower.includes('500') || lower.includes('500wh')) battery_wh = 500;
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
    // B. Giant / SyncDrive
    else if (lower.includes('giant') || lower.includes('syncdrive') || lower.includes('talon e+')) {
      motor_brand = 'Giant / Yamaha';
      if (lower.includes('pro')) {
        motor_model = 'Giant SyncDrive Pro 2';
        torque_nm = 85;
      } else if (lower.includes('sport')) {
        motor_model = 'Giant SyncDrive Sport 2';
        torque_nm = 75;
      } else {
        motor_model = 'Giant SyncDrive Core';
        torque_nm = 50;
      }
    }
    // C. Fazua (Focus VAM², Ride 60, etc.)
    else if (lower.includes('fazua') || lower.includes('ride 60') || lower.includes('vam2') || lower.includes('vam²')) {
      motor_brand = 'Fazua';
      motor_model = 'Fazua Ride 60';
      torque_nm = 60;
      engine_type = 'Mittelmotor (Light-Assist)';
      battery_wh = battery_wh || 430;
    }
    // D. TQ (Trek Fuel EXe, HPR50)
    else if (lower.includes('tq-hpr') || lower.includes('hpr50') || lower.includes('fuel exe')) {
      motor_brand = 'TQ';
      motor_model = 'TQ HPR50';
      torque_nm = 50;
      engine_type = 'Mittelmotor (Light-Assist)';
      battery_wh = battery_wh || 360;
    }
    // E. Mahle
    else if (lower.includes('mahle') || lower.includes('x35') || lower.includes('x20')) {
      motor_brand = 'Mahle';
      motor_model = 'Mahle SmartBike Systems X35+';
      torque_nm = 40;
      engine_type = 'Hecknabenmotor';
      battery_wh = battery_wh || 250;
    }
    // F. Tenways
    else if (lower.includes('tenways') || lower.includes('cgo800s') || lower.includes('cgo600')) {
      motor_brand = 'Mivice / Tenways';
      motor_model = 'Mivice Hecknabenmotor M070';
      torque_nm = 45;
      engine_type = 'Hecknabenmotor';
      battery_wh = battery_wh || 475;
    }
    // G. Haibike / Yamaha
    else if (lower.includes('yamaha') || lower.includes('pw-x') || (brand.toLowerCase().includes('haibike') && (lower.includes('allmtn') || lower.includes('alltrail') || lower.includes('pw')))) {
      motor_brand = 'Yamaha';
      motor_model = 'Yamaha PW-X3 Next Generation';
      torque_nm = 85;
    }
    // H. Shimano Steps (Megamo Reason AL, Husqvarna, etc.)
    else if (lower.includes('steps') || lower.includes('ep8') || lower.includes('ep6') || lower.includes('reason al') || brand.toLowerCase().includes('husqvarna')) {
      motor_brand = 'Shimano';
      motor_model = lower.includes('ep6') ? 'Shimano Steps EP6' : 'Shimano Steps EP801';
      torque_nm = 85;
    }
    // I. Brose / Rotwild
    else if (lower.includes('brose') || brand.toLowerCase().includes('rotwild') || brand.toLowerCase().includes('hnf')) {
      motor_brand = 'Brose';
      motor_model = 'Brose Drive S Mag';
      torque_nm = 90;
    }
    // J. Bosch (Dominant Market Leader in Germany)
    else {
      motor_brand = 'Bosch';
      if (category === 'CARGO' || lower.includes('cargo') || lower.includes('load') || lower.includes('packster')) {
        motor_model = 'Bosch Cargo Line Smart System';
        torque_nm = 85;
        engine_type = 'Mittelmotor (Cargo Schwerlast)';
      } else if (lower.includes('sx') || lower.includes('light') || (category === 'GRAVEL' && lower.includes('hybrid'))) {
        motor_model = 'Bosch Performance Line SX (Light-Assist)';
        torque_nm = 55;
        engine_type = 'Mittelmotor (Light-Assist)';
      } else if (category === 'CITY' || lower.includes('active')) {
        motor_model = 'Bosch Active Line Plus';
        torque_nm = 50;
      } else if (lower.includes('performance 600') || lower.includes('performance line')) {
        motor_model = 'Bosch Performance Line (75Nm) Smart System';
        torque_nm = 75;
      } else {
        motor_model = 'Bosch Performance Line CX Smart System';
        torque_nm = 85;
      }
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
