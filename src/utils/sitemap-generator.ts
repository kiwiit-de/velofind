/**
 * Dynamic XML Sitemap Generator for VeloFind Deutschland
 * Creates a compliant sitemap.xml covering all 176+ German cities, category hubs, and leasing portals.
 */

import { ALL_GERMAN_CITIES } from '../data/germanCities';
import { getCitySlug } from '../data/cityBlogData';

const BASE_URL = 'https://velofind.de';

interface SitemapEntry {
  url: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: string;
  lastmod?: string;
}

export function generateSitemapXml(domain: string = BASE_URL): string {
  const today = new Date().toISOString().split('T')[0];

  const entries: SitemapEntry[] = [
    // Core Platform Pages
    { url: `${domain}/`, changefreq: 'daily', priority: '1.0', lastmod: today },
    { url: `${domain}/?tab=bikes`, changefreq: 'daily', priority: '0.95', lastmod: today },
    { url: `${domain}/?tab=cities`, changefreq: 'daily', priority: '0.95', lastmod: today },
    { url: `${domain}/?tab=dealers`, changefreq: 'weekly', priority: '0.85', lastmod: today },
    { url: `${domain}/?tab=leasing`, changefreq: 'weekly', priority: '0.85', lastmod: today },

    // Primary Bike Categories
    { url: `${domain}/?tab=bikes&amp;category=E_BIKE`, changefreq: 'daily', priority: '0.9', lastmod: today },
    { url: `${domain}/?tab=bikes&amp;category=GRAVEL`, changefreq: 'daily', priority: '0.85', lastmod: today },
    { url: `${domain}/?tab=bikes&amp;category=MOUNTAIN`, changefreq: 'daily', priority: '0.85', lastmod: today },
    { url: `${domain}/?tab=bikes&amp;category=ROAD`, changefreq: 'daily', priority: '0.85', lastmod: today },
    { url: `${domain}/?tab=bikes&amp;category=TREKKING`, changefreq: 'daily', priority: '0.85', lastmod: today },
    { url: `${domain}/?tab=bikes&amp;category=CITY`, changefreq: 'daily', priority: '0.8', lastmod: today },
    { url: `${domain}/?tab=bikes&amp;category=CARGO`, changefreq: 'daily', priority: '0.8', lastmod: today },
    { url: `${domain}/?tab=bikes&amp;category=KIDS`, changefreq: 'daily', priority: '0.75', lastmod: today },

    // German Leasing Providers
    { url: `${domain}/?tab=leasing&amp;provider=jobrad`, changefreq: 'weekly', priority: '0.8', lastmod: today },
    { url: `${domain}/?tab=leasing&amp;provider=bikeleasing`, changefreq: 'weekly', priority: '0.8', lastmod: today },
    { url: `${domain}/?tab=leasing&amp;provider=businessbike`, changefreq: 'weekly', priority: '0.8', lastmod: today },
    { url: `${domain}/?tab=leasing&amp;provider=deutsche-dienstrad`, changefreq: 'weekly', priority: '0.8', lastmod: today },
    { url: `${domain}/?tab=leasing&amp;provider=eurorad`, changefreq: 'weekly', priority: '0.8', lastmod: today },
  ];

  // All 176+ German Cities & Towns
  for (const city of ALL_GERMAN_CITIES) {
    const slug = getCitySlug(city.name);
    entries.push({
      url: `${domain}/?tab=cities&amp;city=${slug}`,
      changefreq: 'weekly',
      priority: city.isMetropolis ? '0.9' : '0.8',
      lastmod: today
    });
  }

  const urlElements = entries
    .map(
      (e) => `  <url>
    <loc>${e.url}</loc>
    <lastmod>${e.lastmod || today}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
}
