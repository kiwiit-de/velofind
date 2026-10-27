/**
 * Server-Side SEO & Geo Dynamic Meta-Tag Injector
 * Resolves the SPA "Blank Shell" crawler vulnerability by dynamically injecting
 * personalized title, meta descriptions, canonical URLs, OpenGraph tags, and
 * Schema.org JSON-LD structured data into index.html BEFORE sending it to crawlers and browsers.
 */

import { ALL_GERMAN_CITIES, GermanCity } from '../data/germanCities';
import { getCityCyclingProfile, getCitySlug, findCityBySlugOrName } from '../data/cityBlogData';

export interface SeoMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
  ogType: string;
  ogImage?: string;
  jsonLd: any[];
}

export function resolveSeoMetadataForRequest(
  urlPath: string,
  searchParams: URLSearchParams,
  domain: string
): SeoMetadata {
  const cleanPath = urlPath.split('?')[0].toLowerCase();
  const tab = searchParams.get('tab') || '';
  const cityParam = searchParams.get('city') || '';
  const providerParam = searchParams.get('provider') || '';
  const categoryParam = searchParams.get('category') || '';

  // 1. City Guide & Local SEO Landing Page (/stadt/:slug or ?tab=cities&city=:city)
  let cityMatch: GermanCity | null = null;

  if (cleanPath.startsWith('/stadt/')) {
    const slug = cleanPath.replace('/stadt/', '').split('/')[0];
    cityMatch = findCityBySlugOrName(slug) || null;
  } else if ((tab === 'cities' || !tab) && cityParam) {
    cityMatch = findCityBySlugOrName(cityParam) || null;
  }

  if (cityMatch) {
    const profile = getCityCyclingProfile(cityMatch);
    const slug = getCitySlug(cityMatch.name);
    const pageUrl = `${domain}/stadt/${slug}`;
    const pageTitle = `Fahrrad & E-Bike kaufen in ${cityMatch.name} (${cityMatch.code}) | Händler & Leasing – VeloFind`;
    const pageDesc = `Fahrräder & E-Bikes in ${cityMatch.name} (${cityMatch.state}) sofort verfügbar vor Ort kaufen. Entdecke geprüfte Fachhändler, JobRad & BusinessBike Leasing sowie lokale Radrouten.`;

    const jsonLd = [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Startseite',
            'item': domain
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Städte & Regionen',
            'item': `${domain}/staedte`
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': cityMatch.state,
            'item': `${domain}/staedte?state=${encodeURIComponent(cityMatch.state)}`
          },
          {
            '@type': 'ListItem',
            'position': 4,
            'name': `Fahrrad kaufen in ${cityMatch.name}`,
            'item': pageUrl
          }
        ]
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': `Fahrrad & E-Bike kaufen in ${cityMatch.name}: Fachhändler, Vor-Ort-Angebote & Leasing-Partner`,
        'description': pageDesc,
        'author': {
          '@type': 'Organization',
          'name': 'VeloFind Deutschland Redaktion',
          'url': domain
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'VeloFind Deutschland GmbH',
          'url': domain,
          'logo': {
            '@type': 'ImageObject',
            'url': `${domain}/assets/velofind-logo.svg`
          }
        },
        'mainEntityOfPage': pageUrl,
        'datePublished': '2026-01-15T08:00:00+01:00',
        'dateModified': new Date().toISOString()
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Place',
        'name': cityMatch.name,
        'address': {
          '@type': 'PostalAddress',
          'postalCode': cityMatch.code,
          'addressLocality': cityMatch.name,
          'addressRegion': cityMatch.state,
          'addressCountry': 'DE'
        },
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': cityMatch.lat,
          'longitude': cityMatch.lng
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': profile.faqs.map((f) => ({
          '@type': 'Question',
          'name': f.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': f.answer
          }
        }))
      }
    ];

    return {
      title: pageTitle,
      description: pageDesc,
      canonicalUrl: pageUrl,
      ogType: 'article',
      jsonLd
    };
  }

  // 2. Leasing Providers Directory (/leasing/:provider or ?tab=leasing)
  if (cleanPath.startsWith('/leasing/') || tab === 'leasing') {
    const providerSlug = cleanPath.startsWith('/leasing/')
      ? cleanPath.replace('/leasing/', '').split('/')[0]
      : providerParam;

    const providerNames: Record<string, string> = {
      'jobrad': 'JobRad',
      'bikeleasing': 'Bikeleasing-Service',
      'businessbike': 'BusinessBike',
      'deutsche-dienstrad': 'Deutsche Dienstrad',
      'eurorad': 'Eurorad',
      'lease-a-bike': 'Lease a Bike'
    };

    const provName = providerNames[providerSlug.toLowerCase()] || 'Dienstrad-Leasing';
    const pageUrl = providerSlug ? `${domain}/leasing/${providerSlug}` : `${domain}/leasing`;
    const pageTitle = `${provName} Partnerhändler & Fahrrad-Leasing Rechner | VeloFind`;
    const pageDesc = `Finde autorisierte ${provName}-Partnerhändler in ganz Deutschland. Berechne deine monatliche Leasingrate mit 0,25%-Regel und bis zu 40% Steuerersparnis.`;

    return {
      title: pageTitle,
      description: pageDesc,
      canonicalUrl: pageUrl,
      ogType: 'website',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Startseite', 'item': domain },
            { '@type': 'ListItem', 'position': 2, 'name': 'Dienstrad-Leasing', 'item': `${domain}/leasing` },
            ...(providerSlug
              ? [{ '@type': 'ListItem', 'position': 3, 'name': provName, 'item': pageUrl }]
              : [])
          ]
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FinancialProduct',
          'name': `${provName} Dienstrad-Leasing`,
          'description': pageDesc,
          'provider': {
            '@type': 'Organization',
            'name': provName
          },
          'areaServed': {
            '@type': 'Country',
            'name': 'Germany'
          }
        }
      ]
    };
  }

  // 3. Category Landing Pages (/kategorie/:category or ?category=...)
  if (cleanPath.startsWith('/kategorie/') || (categoryParam && categoryParam !== 'ALL')) {
    const catSlug = cleanPath.startsWith('/kategorie/')
      ? cleanPath.replace('/kategorie/', '').split('/')[0]
      : categoryParam.toLowerCase();

    const catLabels: Record<string, string> = {
      'e_bike': 'E-Bikes & Pedelecs',
      'e-bike': 'E-Bikes & Pedelecs',
      'gravel': 'Gravelbikes & All-Road',
      'mountain': 'Mountainbikes & E-MTB',
      'mtb': 'Mountainbikes & E-MTB',
      'road': 'Rennräder & Aero Bikes',
      'trekking': 'Trekking- & Tourenräder',
      'city': 'City- & Urbanräder',
      'cargo': 'Lastenräder & Cargo Bikes',
      'kids': 'Kinder- & Jugendräder'
    };

    const catLabel = catLabels[catSlug] || 'Fahrräder';
    const pageUrl = `${domain}/kategorie/${catSlug}`;
    const pageTitle = `${catLabel} beim Fachhändler vor Ort kaufen | VeloFind`;
    const pageDesc = `${catLabel} sofort lieferbar bei geprüften Fahrrad-Fachhändlern in Deutschland entdecken, vergleichen und Probefahrt vereinbaren.`;

    return {
      title: pageTitle,
      description: pageDesc,
      canonicalUrl: pageUrl,
      ogType: 'website',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Startseite', 'item': domain },
            { '@type': 'ListItem', 'position': 2, 'name': 'Kategorien', 'item': `${domain}/?tab=bikes` },
            { '@type': 'ListItem', 'position': 3, 'name': catLabel, 'item': pageUrl }
          ]
        }
      ]
    };
  }

  // 4. Partner Dealers Directory (/haendler or ?tab=dealers)
  if (cleanPath === '/haendler' || tab === 'dealers') {
    const pageUrl = `${domain}/haendler`;
    return {
      title: 'Fahrrad-Fachhändler in der Nähe finden | VeloFind Händlerverzeichnis',
      description: 'Verzeichnis geprüfter Fahrradhändler in ganz Deutschland mit Öffnungszeiten, Meisterwerkstatt, sofort verfügbarem Bestand und Probefahrten.',
      canonicalUrl: pageUrl,
      ogType: 'website',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Startseite', 'item': domain },
            { '@type': 'ListItem', 'position': 2, 'name': 'Händlerverzeichnis', 'item': pageUrl }
          ]
        }
      ]
    };
  }

  // 5. Cities Hub Directory (/staedte or ?tab=cities)
  if (cleanPath === '/staedte' || cleanPath === '/ratgeber' || tab === 'cities') {
    const pageUrl = `${domain}/staedte`;
    return {
      title: 'Fahrrad- & E-Bike Städte-Ratgeber Deutschland | 170+ Städte – VeloFind',
      description: 'Übersicht aller 170+ deutschen Städte und Orte: Lokale Fachhändler, E-Bike Bestände, regionale Radwege und kommunale Förderprogramme.',
      canonicalUrl: pageUrl,
      ogType: 'website',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Startseite', 'item': domain },
            { '@type': 'ListItem', 'position': 2, 'name': 'Städte & Regionen', 'item': pageUrl }
          ]
        }
      ]
    };
  }

  // 6. Default Homepage / Catalog
  const defaultUrl = `${domain}/`;
  return {
    title: 'VeloFind Deutschland – Fahrräder & E-Bikes beim Fachhändler vor Ort finden',
    description: 'Fahrräder, E-Bikes & Dienstrad-Leasing bei verifizierten Fachhändlern in ganz Deutschland vergleichen. Sofort verfügbar vor Ort mit Probefahrt & JobRad-Vorteil.',
    canonicalUrl: defaultUrl,
    ogType: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            '@id': `${domain}/#website`,
            'url': `${domain}/`,
            'name': 'VeloFind Deutschland',
            'description': 'Deutschlands Marktplatz für Fahrräder, E-Bikes und Dienstrad-Leasing beim lokalen Fachhändler.',
            'inLanguage': 'de-DE',
            'potentialAction': {
              '@type': 'SearchAction',
              'target': {
                '@type': 'EntryPoint',
                'urlTemplate': `${domain}/?q={search_term_string}`
              },
              'query-input': 'required name=search_term_string'
            }
          },
          {
            '@type': 'Organization',
            '@id': `${domain}/#organization`,
            'name': 'VeloFind Deutschland GmbH',
            'url': `${domain}/`,
            'description': 'Unabhängige Entdeckungs- und Vergleichsplattform für den stationären Fahrrad-Fachhandel und Dienstrad-Leasing in Deutschland.',
            'areaServed': {
              '@type': 'Country',
              'name': 'Germany'
            }
          }
        ]
      }
    ]
  };
}

/**
 * Injects dynamic SEO metadata into the raw HTML string
 */
export function injectSeoIntoHtml(html: string, metadata: SeoMetadata): string {
  let result = html;

  // Replace Title
  result = result.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(metadata.title)}</title>`);

  // Replace Meta Description
  const descTag = `<meta name="description" content="${escapeHtml(metadata.description)}" />`;
  if (result.includes('<meta name="description"')) {
    result = result.replace(/<meta\s+name="description"\s+content=".*?"\s*\/?>/i, descTag);
  } else {
    result = result.replace('</head>', `  ${descTag}\n</head>`);
  }

  // Canonical Tag
  const canonicalTag = `<link rel="canonical" href="${escapeHtml(metadata.canonicalUrl)}" />\n    <link rel="alternate" hreflang="de-DE" href="${escapeHtml(metadata.canonicalUrl)}" />\n    <link rel="alternate" hreflang="x-default" href="${escapeHtml(metadata.canonicalUrl)}" />`;
  if (result.includes('<link rel="canonical"')) {
    result = result.replace(/<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i, `<link rel="canonical" href="${escapeHtml(metadata.canonicalUrl)}" />`);
  } else {
    result = result.replace('</head>', `  ${canonicalTag}\n</head>`);
  }

  // OpenGraph Tags
  result = replaceOrInjectMeta(result, 'property="og:title"', `<meta property="og:title" content="${escapeHtml(metadata.title)}" />`);
  result = replaceOrInjectMeta(result, 'property="og:description"', `<meta property="og:description" content="${escapeHtml(metadata.description)}" />`);
  result = replaceOrInjectMeta(result, 'property="og:url"', `<meta property="og:url" content="${escapeHtml(metadata.canonicalUrl)}" />`);
  result = replaceOrInjectMeta(result, 'property="og:type"', `<meta property="og:type" content="${escapeHtml(metadata.ogType)}" />`);

  // Twitter Tags
  result = replaceOrInjectMeta(result, 'name="twitter:title"', `<meta name="twitter:title" content="${escapeHtml(metadata.title)}" />`);
  result = replaceOrInjectMeta(result, 'name="twitter:description"', `<meta name="twitter:description" content="${escapeHtml(metadata.description)}" />`);

  // Schema.org Structured Data
  if (metadata.jsonLd && metadata.jsonLd.length > 0) {
    const jsonLdScript = `\n    <script type="application/ld+json" id="ssr-seo-schema">\n${JSON.stringify(
      metadata.jsonLd.length === 1 ? metadata.jsonLd[0] : { '@context': 'https://schema.org', '@graph': metadata.jsonLd },
      null,
      2
    )}\n    </script>\n`;

    // Remove existing default schema tag if present
    result = result.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, '');
    result = result.replace('</head>', `${jsonLdScript}</head>`);
  }

  return result;
}

function replaceOrInjectMeta(html: string, selector: string, tag: string): string {
  const regex = new RegExp(`<meta\\s+[^>]*?${escapeRegex(selector)}[^>]*?\\/?>`, 'i');
  if (regex.test(html)) {
    return html.replace(regex, tag);
  }
  return html.replace('</head>', `  ${tag}\n</head>`);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
