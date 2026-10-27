/**
 * Dynamic XML Sitemap Generator for VeloFind Deutschland
 * Creates a compliant sitemap.xml covering all 176+ German cities, category hubs, and leasing portals.
 * Fully optimized with clean semantic URLs (e.g. /stadt/berlin) and rich priorities for Googlebot.
 */

import { ALL_GERMAN_CITIES } from '../data/germanCities';
import { getCitySlug } from '../data/cityBlogData';

const BASE_URL = 'https://velofind.de';

export interface SitemapEntry {
  url: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: string;
  lastmod?: string;
}

export function getAllSitemapEntries(domain: string = BASE_URL): SitemapEntry[] {
  const today = new Date().toISOString().split('T')[0];

  const entries: SitemapEntry[] = [
    // Core Platform Pages (Clean Semantic Paths)
    { url: `${domain}/`, changefreq: 'daily', priority: '1.0', lastmod: today },
    { url: `${domain}/staedte`, changefreq: 'daily', priority: '0.95', lastmod: today },
    { url: `${domain}/haendler`, changefreq: 'weekly', priority: '0.85', lastmod: today },
    { url: `${domain}/leasing`, changefreq: 'weekly', priority: '0.9', lastmod: today },

    // Primary Bike Categories
    { url: `${domain}/kategorie/e-bike`, changefreq: 'daily', priority: '0.9', lastmod: today },
    { url: `${domain}/kategorie/gravel`, changefreq: 'daily', priority: '0.85', lastmod: today },
    { url: `${domain}/kategorie/mountain`, changefreq: 'daily', priority: '0.85', lastmod: today },
    { url: `${domain}/kategorie/road`, changefreq: 'daily', priority: '0.85', lastmod: today },
    { url: `${domain}/kategorie/trekking`, changefreq: 'daily', priority: '0.85', lastmod: today },
    { url: `${domain}/kategorie/city`, changefreq: 'daily', priority: '0.8', lastmod: today },
    { url: `${domain}/kategorie/cargo`, changefreq: 'daily', priority: '0.8', lastmod: today },
    { url: `${domain}/kategorie/kids`, changefreq: 'daily', priority: '0.75', lastmod: today },

    // German Leasing Providers
    { url: `${domain}/leasing/jobrad`, changefreq: 'weekly', priority: '0.85', lastmod: today },
    { url: `${domain}/leasing/bikeleasing`, changefreq: 'weekly', priority: '0.85', lastmod: today },
    { url: `${domain}/leasing/businessbike`, changefreq: 'weekly', priority: '0.85', lastmod: today },
    { url: `${domain}/leasing/deutsche-dienstrad`, changefreq: 'weekly', priority: '0.8', lastmod: today },
    { url: `${domain}/leasing/eurorad`, changefreq: 'weekly', priority: '0.8', lastmod: today },

    // SPA Fallback Query URLs
    { url: `${domain}/?tab=bikes`, changefreq: 'daily', priority: '0.9', lastmod: today },
    { url: `${domain}/?tab=cities`, changefreq: 'daily', priority: '0.9', lastmod: today },
    { url: `${domain}/?tab=dealers`, changefreq: 'weekly', priority: '0.8', lastmod: today },
    { url: `${domain}/?tab=leasing`, changefreq: 'weekly', priority: '0.8', lastmod: today },
  ];

  // All 176+ German Cities & Towns (Both Clean Path and Query Fallback)
  for (const city of ALL_GERMAN_CITIES) {
    const slug = getCitySlug(city.name);
    // Primary clean canonical path: /stadt/berlin
    entries.push({
      url: `${domain}/stadt/${slug}`,
      changefreq: 'weekly',
      priority: city.isMetropolis ? '0.95' : '0.85',
      lastmod: today
    });
    // Secondary query path: /?tab=cities&city=berlin
    entries.push({
      url: `${domain}/?tab=cities&amp;city=${slug}`,
      changefreq: 'weekly',
      priority: city.isMetropolis ? '0.85' : '0.75',
      lastmod: today
    });
  }

  return entries;
}

export function generateSitemapXml(domain: string = BASE_URL): string {
  const today = new Date().toISOString().split('T')[0];
  const entries = getAllSitemapEntries(domain);

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
