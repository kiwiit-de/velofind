/**
 * Localized City Cycling Guides & Programmatic SEO Data for Germany
 * Generates tailored editorial content, cycling profiles, route recommendations,
 * and FAQ schema for all German cities and towns.
 */

import { ALL_GERMAN_CITIES, GermanCity } from './germanCities';

export interface CityCyclingProfile {
  city: GermanCity;
  slug: string;
  tagline: string;
  topography: 'flach' | 'leicht-hügelig' | 'hügelig-anspruchsvoll' | 'alpenvorland';
  topographyDesc: string;
  recommendedBikeTypes: string[];
  recommendedMotorTorque: string;
  popularRoutes: { name: string; distance: string; highlight: string }[];
  subsidyProgram: { name: string; amount: string; description: string };
  localTips: string[];
  faqs: { question: string; answer: string }[];
}

// Convert German city name to URL-safe slug
export function getCitySlug(cityName: string): string {
  return cityName
    .toLowerCase()
    .trim()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function findCityBySlugOrName(slugOrName: string): GermanCity | undefined {
  const normalized = getCitySlug(slugOrName);
  return ALL_GERMAN_CITIES.find(
    (c) => getCitySlug(c.name) === normalized || c.code === slugOrName || c.name.toLowerCase() === slugOrName.toLowerCase()
  );
}

// Curated city-specific cycling profiles for German metropolises
const CURATED_CITY_PROFILES: Record<string, Partial<CityCyclingProfile>> = {
  berlin: {
    tagline: 'Hauptstadt des urbanen Radverkehrs: Von Tempelhof bis zum Mauerweg',
    topography: 'flach',
    topographyDesc: 'Weitläufige, ebene Stadtstruktur mit breiten Fahrradachsen und ausgedehnten Parks.',
    recommendedBikeTypes: ['Urban E-Bike', 'Gravelbike', 'E-Lastenrad', 'Citybike'],
    recommendedMotorTorque: '50 – 65 Nm (Bosch Performance Line oder Bafang City)',
    popularRoutes: [
      { name: 'Berliner Mauerweg', distance: '160 km (Etappen 15–30 km)', highlight: 'Historische Grenzroute entlang geschichtsträchtiger Monumente' },
      { name: 'Tempelhofer Feld Rundkurs', distance: '6 km Rundkurs', highlight: 'Breiteste asphaltierte Fahrradpiste Europas ohne Autoverkehr' },
      { name: 'Kronprinzessinnenweg (Grunewald)', distance: '8 km reine Fahrradstraße', highlight: 'Rennrad- und Gravel-Hotspot mitten im Wald' },
      { name: 'Spree-Radweg (Mitte bis Treptow)', distance: '12 km', highlight: 'Uferpanorama vorbei an Regierungsviertel und East Side Gallery' }
    ],
    subsidyProgram: {
      name: 'Berliner Lastenrad-Zuschuss (IBB)',
      amount: 'Bis zu 1.000 € Zuschuss',
      description: 'Gefördert werden gewerbliche und private Lastenräder mit und ohne E-Antrieb durch das Land Berlin.'
    },
    localTips: [
      'Nutze Fahrradstraßen wie die Linienstraße in Mitte für entspanntes Vorankommen abseits des Hauptverkehrs.',
      'Sicheres Abstellen: Nutze die bewachten Fahrradparkhäuser an Bahnhöfen wie Ostkreuz und Südkreuz.',
      'Im Winter: Schutzbleche und gute Beleuchtung (mind. 50 Lux) sind auf den feuchten Asphaltwegen unverzichtbar.'
    ]
  },
  muenchen: {
    tagline: 'Radlhauptstadt München: Alpin inspiriertes Pendeln entlang der Isar',
    topography: 'leicht-hügelig',
    topographyDesc: 'Überwiegend eben im Tal, im Umland Richtung Voralpen mit sportlichen Steigungen.',
    recommendedBikeTypes: ['Trekking E-Bike', 'E-SUV', 'Gravelbike', 'E-Mountainbike'],
    recommendedMotorTorque: '75 – 85 Nm (Bosch Performance CX oder Shimano EP8)',
    popularRoutes: [
      { name: 'Isarradweg (Nord-Süd-Querung)', distance: '22 km durch München', highlight: 'Grüner Highway vom Englischen Garten bis nach Wolfratshausen' },
      { name: 'Rund um den Starnberger See', distance: '48 km Seerunde', highlight: 'Klassiker mit Alpenblick und zahlreichen Badestopps' },
      { name: 'Forstenrieder Park Panoramaweg', distance: '18 km Rundweg', highlight: 'Asphaltierte, autofreie Waldachsen ideal für E-Bikes' }
    ],
    subsidyProgram: {
      name: 'Münchner Förderprogramm Klimaneutrale Mobilität',
      amount: 'Bis zu 1.500 € (max. 25 % des Kaufpreises)',
      description: 'München fördert Pedelecs, Lastenräder und Fahrradanhänger für Bürger und Gewerbetreibende.'
    },
    localTips: [
      'Für Pendler: Die Isartrasse ist ganzjährig geräumt und verbindet München kreuzungsfrei von Nord nach Süd.',
      'Achte auf ein Schloss mit Sicherheitsstufe 10+, besonders im Umkreis der LMU und am Hauptbahnhof.',
      'Dienstrad-Leasing spart dank bayerischer Gehaltsumwandlung bis zu 40 % gegenüber dem Sofortkauf.'
    ]
  },
  hamburg: {
    tagline: 'Fahrradfahren an Elbe & Alster: Windfest, maritim und urban vernetzt',
    topography: 'flach',
    topographyDesc: 'Ebenes Küstenklima mit spürbarem Gegenwind und gut ausgebauten Velorouten.',
    recommendedBikeTypes: ['Allwetter-Trekkingrad', 'Urban E-Bike mit Riemenantrieb', 'E-Lastenrad'],
    recommendedMotorTorque: '65 – 85 Nm (kräftiger Drehmoment ideal bei steifem Gegenwind)',
    popularRoutes: [
      { name: 'Alster-Rundweg', distance: '7,5 km klassische Alsterrunde', highlight: 'Bester Blick auf die Hamburger Skyline und Segelboote' },
      { name: 'Elberadweg (Landungsbrücken nach Wedel)', distance: '24 km', highlight: 'Fahrt entlang von Sandstränden, Falkensteiner Ufer und Elbhang' },
      { name: 'Altes Land Obstgarten-Tour', distance: '35 km', highlight: 'Radeln durch Europas größtes zusammenhängendes Obstanbaugebiet' }
    ],
    subsidyProgram: {
      name: 'Hamburg E-Lastenrad Förderung (IFB Hamburg)',
      amount: 'Bis zu 2.000 € für gewerbliche und private Nutzer',
      description: 'Zuschüsse für Lastenräder mit elektrischer Tretunterstützung zur Entlastung des Hamburger Stadtverkehrs.'
    },
    localTips: [
      'Wähle wartungsarme Komponenten: Gates-Zahnriemen und Nabenschaltungen sind unempfindlich gegen feuchtes Nordseewetter.',
      'Der Alte Elbtunnel ermöglicht kostenlose Elbquerung für Radfahrer rund um die Uhr.',
      'Die 14 Hamburger Velorouten verbinden die Bezirke mit dem Rathausmarkt – folge den roten Schildern.'
    ]
  },
  koeln: {
    tagline: 'Kölsche Radkultur: Entspannt am Rhein, flink durch die Veedel',
    topography: 'flach',
    topographyDesc: 'Flaches Rheinland-Territorium mit hoher Veedel-Dichte und erstklassiger Rheinpromenade.',
    recommendedBikeTypes: ['City E-Bike', 'Urban Bike', 'Gravelbike', 'Kompakt-Lastenrad'],
    recommendedMotorTorque: '50 – 75 Nm',
    popularRoutes: [
      { name: 'Rheinradweg Köln (Nord- & Südtour)', distance: '18 km Rundkurs über 2 Brücken', highlight: 'Hohenzollernbrücke, Dom-Blick und Rheinauhafen' },
      { name: 'Grüngürtel-Rundweg', distance: '28 km Halbkreis', highlight: 'Grüne Lunge Kölns von Riehl bis Klettenberg' },
      { name: 'Königsforst Natur-Runde', distance: '32 km', highlight: 'Schattige Waldwege für Gravel- und E-Trekking-Begeisterte' }
    ],
    subsidyProgram: {
      name: 'Köln Klimaschutz-Zuschuss Lastenräder',
      amount: 'Bis zu 1.250 € (max. 30 %)',
      description: 'Förderung von E-Cargobikes für Familien, Vereine und Selbstständige im Stadtgebiet Köln.'
    },
    localTips: [
      'In den engen Veedeln (Südstadt, Ehrenfeld, Belgisches Viertel) sind Kompakt-E-Bikes und 20-Zoll-Flitzer unschlagbar wendig.',
      'Die Fahrradstraße Friesenwall bietet eine entspannte Umfahrung der Kölner Ringe.',
      'Über 30 Fahrrad XXL, B.O.C. und Fachhändler in Köln & Umland bieten autorisierte Übergabeinspektionen.'
    ]
  },
  frankfurt: {
    tagline: 'Mainmetropole auf zwei Rädern: Zwischen Skyline und Taunus-Hügeln',
    topography: 'leicht-hügelig',
    topographyDesc: 'Ebene Innenstadt am Mainufer, sportlich ansteigend in Richtung Vordertaunus.',
    recommendedBikeTypes: ['Speed-Pedelec (S-Pedelec)', 'Gravelbike', 'E-Trekkingrad', 'E-MTB'],
    recommendedMotorTorque: '75 – 85 Nm',
    popularRoutes: [
      { name: 'Mainufer-Highway (Osthafen bis Höchst)', distance: '16 km', highlight: 'Kreuzungsfreier Radschnellweg direkt am Wasser' },
      { name: 'Frankfurter Grüngürtel Rundweg', distance: '64 km rund um die Stadt', highlight: 'Komplett beschilderter Natur-Rundweg mit Skyline-Blick' },
      { name: 'Feldberg-Anstieg (Taunus)', distance: '28 km mit 700 Höhenmetern', highlight: 'Klassische Herausforderung für Rennrad und E-MTB' }
    ],
    subsidyProgram: {
      name: 'Frankfurt Lastenrad-Förderung',
      amount: 'Bis zu 1.000 € Zuschuss',
      description: 'Kommunales Programm zur Steigerung des Radverkehrsanteils bei städtischen Wegen.'
    },
    localTips: [
      'Pendler ins Bankenviertel: S-Pedelecs (45 km/h) aus dem Umland sparen täglich bis zu 45 Minuten Stau.',
      'Kombiniere Dienstrad-Leasing mit Firmen-Lademöglichkeiten am Arbeitsplatz.',
      'Nutze die Mainbrücken (Holbeinsteg, Eiserner Steg) für autofreie Flussquerungen.'
    ]
  },
  stuttgart: {
    tagline: 'Kessellage meisterhaft bezwingen: Die E-Bike-Hauptstadt der Topographie',
    topography: 'hügelig-anspruchsvoll',
    topographyDesc: 'Ausgeprägte Kessellage mit bis zu 300 Höhenmetern Differenz zwischen Neckar und Filderebene.',
    recommendedBikeTypes: ['Kraftvolles E-Trekkingrad', 'E-Mountainbike', 'E-SUV mit starker Bremsanlage'],
    recommendedMotorTorque: '85 – 90 Nm (z. B. Bosch Cargo Line oder Performance CX)',
    popularRoutes: [
      { name: 'Neckartal-Radweg (Esslingen bis Bad Cannstatt)', distance: '14 km flach am Fluss', highlight: 'Idyllische Uferwege vorbei an Weinbergen' },
      { name: 'Bärenseen & Solitude Schlossrunde', distance: '24 km hügelig', highlight: 'Waldwege und Schloss Solitude mit weiter Aussicht' },
      { name: 'Rund um den Stuttgarter Kessel', distance: '38 km sportlich', highlight: 'Spektakuläre Panoramablicke von den Höhenlagen' }
    ],
    subsidyProgram: {
      name: 'Baden-Württemberg E-Lastenrad Bonus',
      amount: 'Bis zu 1.500 €',
      description: 'Landesweites Programm zur Unterstützung emissionsfreier Mobilitätslösungen.'
    },
    localTips: [
      'In Stuttgart ist ein Mittelmotor mit mindestens 75–85 Nm Pflicht, um die berühmten „Stäffele“-Steigungen mühelos zu meistern.',
      'Achte auf 4-Kolben-Scheibenbremsen für zuverlässige Verzögerung bei steilen Kesselfahrten.',
      'Die Zahnradbahn („Zacke“) befördert Fahrräder auf speziellen Vorstellwagen bequem nach Degerloch.'
    ]
  },
  dortmund: {
    tagline: 'Metropole Ruhr: Grüne Industriekultur auf stillgelegten Bahntrassen',
    topography: 'flach',
    topographyDesc: 'Ausgedehnte kreuzungsfreie Bahntrassen und grüne Keile zwischen Emscher und Ruhr.',
    recommendedBikeTypes: ['Trekking E-Bike', 'Gravelbike', 'E-Cityrad', 'E-SUV'],
    recommendedMotorTorque: '65 – 85 Nm',
    popularRoutes: [
      { name: 'Radschnellweg Ruhr (RS1) Dortmund', distance: 'Abschnitte bis Unna & Bochum', highlight: 'Autofreie Schnellverbindung quer durch die Metropole' },
      { name: 'Phoenix-See Rundkurs & Hochofen-Areal', distance: '12 km', highlight: 'Modernes See-Flair verbunden mit historischer Industriegeschichte' },
      { name: 'Emscher-Weg (Hörder Burg nach Mengede)', distance: '21 km', highlight: 'Renaturierter Flusslauf durch den neuen Emscherland-Park' }
    ],
    subsidyProgram: {
      name: 'Progres.nrw Lastenrad-Förderung',
      amount: 'Bis zu 1.000 € für Privat, bis zu 2.100 € für Gewerbe',
      description: 'Förderung des Landes NRW für emissionsfreie Lastenräder im Ruhrgebiet.'
    },
    localTips: [
      'Das Ruhrgebiet besitzt das dichteste Radwegenetz auf ehemaligen Bahntrassen in ganz Europa.',
      'Nutze Dienstrad-Leasing über lokale Fachmarktketten wie B.O.C. oder Lucky Bike für volle Garantie.',
      'Perfekt für Pendler: Der RS1 verbindet Dortmund direkt mit Bochum, Essen und Mülheim.'
    ]
  },
  bochum: {
    tagline: 'Im Herzen des Ruhrgebiets: Kürzeste Wege zu den Radrevier-Highlights',
    topography: 'leicht-hügelig',
    topographyDesc: 'Welliges Terrain zwischen Emscher-Tiefland und malerischen Ruhrtal-Hängen.',
    recommendedBikeTypes: ['Trekking E-Bike', 'Gravelbike', 'Allround E-SUV', 'Citybike'],
    recommendedMotorTorque: '65 – 85 Nm',
    popularRoutes: [
      { name: 'Erzbahntrasse (Jahrhunderthalle zum Rhein-Herne-Kanal)', distance: '10 km komplett autofrei', highlight: 'Spektakuläre Erzbahnbrücke und Zoom Erlebniswelt' },
      { name: 'Kemnader See Seerunde', distance: '8 km Uferrundweg', highlight: 'Freizeit-Mekka mit Skater- und separater Fahrradspur' },
      { name: 'Kruppwald & Schlosspark Weitmar Tour', distance: '15 km', highlight: 'Grüne Oasen mitten im städtischen Süden' }
    ],
    subsidyProgram: {
      name: 'Klima-Initiative Stadt Bochum',
      amount: 'Zuschüsse für Lastenräder & E-Mobilität',
      description: 'Unterstützung von CO2-neutralen Transportlösungen in Kooperation mit den Stadtwerken.'
    },
    localTips: [
      'Über die Erzbahntrasse gelangst du ohne eine einzige rote Ampel von Bochum-Mitte bis nach Gelsenkirchen.',
      'Große Händler-Präsenz: B.O.C., Zweirad Bock und Partnerbetriebe bieten direkte Werkstattkapazitäten.',
      'Probefahrten sind an den autofreien Trassenzugängen direkt vor Ort möglich.'
    ]
  }
};

// Generates complete localized profile for any city in Germany
export function getCityCyclingProfile(city: GermanCity): CityCyclingProfile {
  const slug = getCitySlug(city.name);
  const curated = CURATED_CITY_PROFILES[slug] || {};

  // Infer regional characteristics based on Bundesland & metropolis status
  const isSouth = ['Bayern', 'Baden-Württemberg'].includes(city.state);
  const isCoast = ['Schleswig-Holstein', 'Niedersachsen', 'Mecklenburg-Vorpommern', 'Bremen', 'Hamburg'].includes(city.state);
  const isEast = ['Sachsen', 'Sachsen-Anhalt', 'Thüringen', 'Brandenburg', 'Berlin'].includes(city.state);

  const defaultTopography = isSouth ? 'hügelig-anspruchsvoll' : isCoast ? 'flach' : 'leicht-hügelig';
  const defaultTopoDesc = isSouth
    ? `Hügelige und abwechslungsreiche Landschaft in ${city.state} mit landschaftlich reizvollen Steigungen im Umland.`
    : isCoast
    ? `Vorwiegend ebenes Gelände in ${city.state} mit frischer Brise – ideal für ausgedehnte Tagestouren.`
    : `Ausgewogene Stadt- und Landschaftstopographie mit sanften Steigungen im Umland von ${city.name}.`;

  const recommendedBikeTypes = curated.recommendedBikeTypes || (
    isSouth
      ? ['E-Mountainbike', 'Trekking E-Bike', 'Gravelbike', 'E-SUV']
      : isCoast
      ? ['Trekking E-Bike (windstabil)', 'Allwetter-Citybike', 'E-Lastenrad', 'Gravelbike']
      : ['Trekking E-Bike', 'City E-Bike', 'Gravelbike', 'E-Lastenrad']
  );

  const recommendedMotorTorque = curated.recommendedMotorTorque || (
    isSouth ? '75 – 85 Nm (z. B. Bosch Performance CX, Yamaha PW-X3)' : '65 – 75 Nm (z. B. Bosch Performance Line)'
  );

  const popularRoutes = curated.popularRoutes || [
    {
      name: `${city.name}er Umland- und Naturrunde`,
      distance: '25 km Rundtour',
      highlight: `Wunderschöne Streckenführung durch das Umland von ${city.name} mit zahlreichen Einkehrmöglichkeiten`
    },
    {
      name: `Stadt- und Kulturroute ${city.name}`,
      distance: '15 km City-Erkundung',
      highlight: `Autofreie Parks, historische Sehenswürdigkeiten und grüne Korridore in ${city.name}`
    },
    {
      name: `Regionale Radwander-Etappe (${city.state})`,
      distance: '35–45 km',
      highlight: `Gut ausgeschilderte Radwegeverbindung in die Nachbarorte rund um ${city.name}`
    }
  ];

  const subsidyProgram = curated.subsidyProgram || {
    name: `Klimaschutz- und Lastenradförderung ${city.state}`,
    amount: 'Bis zu 1.000 € Zuschuss möglich',
    description: `Im Bundesland ${city.state} stehen diverse Förderprogramme für private und gewerbliche E-Cargobikes sowie Dienstfahrräder zur Verfügung.`
  };

  const localTips = curated.localTips || [
    `Nutze autorisierte Meisterwerkstätten in ${city.name} für die vorgeschriebene jährliche UVV- und Dienstrad-Inspektion.`,
    `Fahrradversicherung & Diebstahlschutz: Registriere dein neues Bike direkt beim Fachhändler oder bei der örtlichen Polizei.`,
    `Dienstrad-Leasing: Mitarbeiter von Unternehmen in ${city.name} sparen durch 0,25 % Gehaltsumwandlung bis zu 40 % im Vergleich zum Barkauf.`
  ];

  const faqs = [
    {
      question: `Wo kann ich in ${city.name} ein Fahrrad oder E-Bike kaufen und Probe fahren?`,
      answer: `Über VeloFind findest du verifizierte Fahrrad-Fachhändler und Partnerbetriebe in ${city.name} (${city.code}) und Umgebung. Alle gelisteten Räder sind mit echtem Händlerbestand hinterlegt und stehen vor Ort für Probefahrten und professionelle Fachberatung bereit.`
    },
    {
      question: `Welche Dienstrad-Leasinganbieter werden bei Händlern in ${city.name} unterstützt?`,
      answer: `Die meisten Partnerhändler in ${city.name} kooperieren mit allen führenden deutschen Leasinggesellschaften, darunter JobRad, BusinessBike, Deutsche Dienstrad, Bikeleasing-Service, Eurorad und Lease a Bike. Du kannst dein Wunschrad bequem über deinen Arbeitgeber leasen.`
    },
    {
      question: `Wird mein in ${city.name} gekauftes Rad fahrfertig montiert übergeben?`,
      answer: `Ja. Beim Kauf über teilnehmende Fachhändler in ${city.name} erhältst du dein Fahrrad oder E-Bike immer fertig montiert, durchgecheckt und mit einer professionellen Übergabeinspektion. Zudem wird die optimale Sitzposition individuell auf dich eingestellt.`
    },
    {
      question: `Gibt es in ${city.name} oder ${city.state} Förderungen für E-Bikes oder Lastenräder?`,
      answer: `Viele Städte und Kommunen in ${city.state} bieten Förderprogramme für E-Lastenräder und gewerbliche Cargobikes an. Zuschüsse liegen oft zwischen 500 € und 1.500 €. Informiere dich am besten direkt beim städtischen Umweltamt oder der IHK vor Ort.`
    },
    {
      question: `Kann ich mein online reserviertes Fahrrad direkt in ${city.name} abholen?`,
      answer: `Absolut. Mit dem Click & Collect Service kannst du dein Wunschfahrrad online reservieren und bei deinem ausgewählten Partnerhändler in ${city.name} persönlich abholen, testen und auf Wunsch direkt dort servicieren lassen.`
    }
  ];

  return {
    city,
    slug,
    tagline: curated.tagline || `Dein Fahrrad- & E-Bike Hub für ${city.name} in ${city.state}`,
    topography: (curated.topography as any) || defaultTopography,
    topographyDesc: curated.topographyDesc || defaultTopoDesc,
    recommendedBikeTypes,
    recommendedMotorTorque,
    popularRoutes,
    subsidyProgram,
    localTips,
    faqs
  };
}

// Get neighboring cities in the same Bundesland or geographically close
export function getNearbyCities(city: GermanCity, maxCount = 6): GermanCity[] {
  // First prefer same state, then sort by approx Euclidean distance
  return ALL_GERMAN_CITIES
    .filter((c) => c.name !== city.name)
    .map((c) => {
      const dLat = c.lat - city.lat;
      const dLng = c.lng - city.lng;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      return { city: c, dist, sameState: c.state === city.state };
    })
    .sort((a, b) => {
      if (a.sameState && !b.sameState) return -1;
      if (!a.sameState && b.sameState) return 1;
      return a.dist - b.dist;
    })
    .slice(0, maxCount)
    .map((item) => item.city);
}

// Get all unique Bundesländer
export function getAllBundeslaender(): string[] {
  const set = new Set<string>();
  ALL_GERMAN_CITIES.forEach((c) => set.add(c.state));
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'de'));
}

// Get cities grouped by Bundesland
export function getCitiesByState(state: string): GermanCity[] {
  return ALL_GERMAN_CITIES
    .filter((c) => c.state === state)
    .sort((a, b) => (b.isMetropolis ? 1 : 0) - (a.isMetropolis ? 1 : 0) || a.name.localeCompare(b.name, 'de'));
}
