import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Bike,
  ShieldCheck,
  Building2,
  ChevronRight,
  ExternalLink,
  Compass,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  HelpCircle,
  Share2,
  CheckCircle2,
  Navigation,
  FileSpreadsheet,
  Award,
  Layers,
  Search
} from 'lucide-react';
import { GermanCity, ALL_GERMAN_CITIES } from '../data/germanCities';
import { getCityCyclingProfile, getNearbyCities, findCityBySlugOrName, getCitySlug } from '../data/cityBlogData';
import { Offer, Dealer } from '../types';
import { OfferCard } from './OfferCard';
import { LeasingProviderLogo } from './LeasingProviderLogo';
import { calculateDistanceKm } from '../server/db/utils';

interface CityBlogPostViewProps {
  city: GermanCity;
  allOffers: Offer[];
  allDealers: Dealer[];
  onSelectCity: (city: GermanCity) => void;
  onBackToOverview: () => void;
  onSelectOffer: (offer: Offer) => void;
  onTrackOutbound: (offerId: string) => void;
  onOpenDealer?: (dealerSlug: string) => void;
  onApplyCityToCatalog: (postalCode: string, cityName: string) => void;
  onOpenLeasingGuide: () => void;
}

export const CityBlogPostView: React.FC<CityBlogPostViewProps> = ({
  city,
  allOffers,
  allDealers,
  onSelectCity,
  onBackToOverview,
  onSelectOffer,
  onTrackOutbound,
  onOpenDealer,
  onApplyCityToCatalog,
  onOpenLeasingGuide
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isCopied, setIsCopied] = useState(false);

  const profile = useMemo(() => getCityCyclingProfile(city), [city]);
  const nearbyCities = useMemo(() => getNearbyCities(city, 6), [city]);

  // Find dealers in or near this city (within ~45 km)
  const localDealers = useMemo(() => {
    return allDealers
      .map((dealer) => {
        const loc = dealer.locations?.[0];
        if (!loc) return null;
        const dist = calculateDistanceKm(city.lat, city.lng, loc.latitude, loc.longitude);
        const isCityMatch =
          loc.city.toLowerCase().includes(city.name.toLowerCase()) ||
          loc.postal_code.startsWith(city.code.substring(0, 2));
        return {
          dealer,
          location: loc,
          distanceKm: Math.round(dist * 10) / 10,
          isExactCity: isCityMatch
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null && (item.isExactCity || item.distanceKm <= 50))
      .sort((a, b) => {
        if (a.isExactCity && !b.isExactCity) return -1;
        if (!a.isExactCity && b.isExactCity) return 1;
        return a.distanceKm - b.distanceKm;
      });
  }, [allDealers, city]);

  // Find offers available in or near this city
  const localOffers = useMemo(() => {
    return allOffers.filter((offer) => {
      // Check branch locations or dealer location
      const hasLocalBranch = offer.available_branches?.some(
        (b) => b.city?.toLowerCase().includes(city.name.toLowerCase()) || (b.distance_km !== undefined && b.distance_km <= 50)
      );
      const hasDealerLocation = offer.dealer_locations?.some(
        (l) => l.city.toLowerCase().includes(city.name.toLowerCase())
      );
      return hasLocalBranch || hasDealerLocation;
    });
  }, [allOffers, city]);

  // Filter local offers by category tab
  const filteredLocalOffers = useMemo(() => {
    if (selectedCategory === 'ALL') return localOffers.slice(0, 8);
    return localOffers
      .filter((o) => o.category === selectedCategory || o.propulsion === selectedCategory)
      .slice(0, 8);
  }, [localOffers, selectedCategory]);

  // Dynamic SEO Metadata Injection (Title, Description, JSON-LD Schema)
  useEffect(() => {
    const pageTitle = `Fahrrad & E-Bike kaufen in ${city.name} (${city.code}) | Händler & Leasing – VeloFind`;
    const pageDesc = `Fahrräder & E-Bikes in ${city.name} (${city.state}) sofort verfügbar kaufen. Entdecke verifizierte Partner-Fachhändler, JobRad & BusinessBike Leasing sowie die besten Radrouten in ${city.name}.`;

    document.title = pageTitle;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', pageDesc);

    // Update OpenGraph tags
    const updateOg = (prop: string, val: string) => {
      let tag = document.querySelector(`meta[property="${prop}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', prop);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', val);
    };
    updateOg('og:title', pageTitle);
    updateOg('og:description', pageDesc);
    updateOg('og:type', 'article');
    updateOg('og:url', window.location.href);

    // Inject Schema.org JSON-LD structured data
    const schemaScriptId = 'velofind-city-seo-schema';
    let scriptTag = document.getElementById(schemaScriptId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = schemaScriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const jsonLdData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            {
              '@type': 'ListItem',
              'position': 1,
              'name': 'Startseite',
              'item': window.location.origin
            },
            {
              '@type': 'ListItem',
              'position': 2,
              'name': 'Städte & Regionen',
              'item': `${window.location.origin}?tab=cities`
            },
            {
              '@type': 'ListItem',
              'position': 3,
              'name': city.state,
              'item': `${window.location.origin}?tab=cities&state=${encodeURIComponent(city.state)}`
            },
            {
              '@type': 'ListItem',
              'position': 4,
              'name': `Fahrrad kaufen in ${city.name}`,
              'item': window.location.href
            }
          ]
        },
        {
          '@type': 'Article',
          'headline': `Fahrrad & E-Bike kaufen in ${city.name}: Fachhändler, Angebote & Leasing-Partner`,
          'description': pageDesc,
          'author': {
            '@type': 'Organization',
            'name': 'VeloFind Deutschland Redaktion'
          },
          'publisher': {
            '@type': 'Organization',
            'name': 'VeloFind Deutschland',
            'logo': {
              '@type': 'ImageObject',
              'url': `${window.location.origin}/favicon.ico`
            }
          },
          'mainEntityOfPage': window.location.href,
          'datePublished': '2026-01-15T08:00:00+01:00',
          'dateModified': new Date().toISOString()
        },
        {
          '@type': 'Place',
          'name': city.name,
          'address': {
            '@type': 'PostalAddress',
            'postalCode': city.code,
            'addressLocality': city.name,
            'addressRegion': city.state,
            'addressCountry': 'DE'
          },
          'geo': {
            '@type': 'GeoCoordinates',
            'latitude': city.lat,
            'longitude': city.lng
          }
        },
        {
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
      ]
    };

    scriptTag.text = JSON.stringify(jsonLdData);

    // Scroll to top upon navigating to city
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      // Cleanup script tag if leaving
      const el = document.getElementById(schemaScriptId);
      if (el) el.remove();
    };
  }, [city, profile]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Fahrrad & E-Bike kaufen in ${city.name} | VeloFind`,
        text: `Finde lokale Fahrradhändler und sofort verfügbare E-Bikes in ${city.name}:`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  return (
    <article className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Breadcrumbs & City Switcher Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-slate-500 overflow-x-auto">
            <button
              onClick={onBackToOverview}
              className="hover:text-emerald-700 flex items-center gap-1 font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Alle Städte</span>
            </button>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-slate-500">{city.state}</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="font-bold text-slate-900">{city.name}</span>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1 transition-colors font-medium"
              title="Ratgeber-Seite teilen"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{isCopied ? 'Kopiert!' : 'Teilen'}</span>
            </button>

            {/* Quick City Switcher */}
            <select
              value={getCitySlug(city.name)}
              onChange={(e) => {
                const target = findCityBySlugOrName(e.target.value);
                if (target) onSelectCity(target);
              }}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
            >
              <option value="">Stadt wechseln...</option>
              {ALL_GERMAN_CITIES.map((c) => (
                <option key={`${c.code}-${c.name}`} value={getCitySlug(c.name)}>
                  {c.name} ({c.code}, {c.state})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <header className="bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-900 text-white pt-10 pb-14 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/40 relative overflow-hidden">
        {/* Subtle background bike line decoration */}
        <div className="absolute right-0 top-0 bottom-0 opacity-5 pointer-events-none flex items-center">
          <Bike className="w-96 h-96 text-white translate-x-12" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold mb-4 shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Lokaler Fahrrad- & E-Bike Hub • {city.state}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white max-w-4xl leading-tight">
            Fahrrad & E-Bike kaufen in <span className="text-emerald-400">{city.name}</span>
          </h1>

          <p className="mt-3 text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
            {profile.tagline}. Finde verifizierte Fachhändler vor Ort, sofort abholbereite Fahrräder mit Original-Händlerbestand und autorisiertes Dienstrad-Leasing (JobRad, BusinessBike u.v.m.) im Raum {city.name} ({city.code}).
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl">
            <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
              <span className="text-[11px] text-slate-300 block uppercase font-medium">Partner-Händler</span>
              <span className="text-xl sm:text-2xl font-black text-white">{localDealers.length || 'Vor Ort'}</span>
              <span className="text-[10px] text-emerald-300 block mt-0.5">geprüfte Werkstätten</span>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
              <span className="text-[11px] text-slate-300 block uppercase font-medium">Verfügbare Räder</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400">{localOffers.length > 0 ? localOffers.length : '100+'}</span>
              <span className="text-[10px] text-slate-300 block mt-0.5">im Einzugsgebiet</span>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
              <span className="text-[11px] text-slate-300 block uppercase font-medium">Leasing-Quote</span>
              <span className="text-xl sm:text-2xl font-black text-white">Bis zu 40%</span>
              <span className="text-[10px] text-emerald-300 block mt-0.5">Gehaltsumwandlung</span>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
              <span className="text-[11px] text-slate-300 block uppercase font-medium">PLZ & Zentrum</span>
              <span className="text-xl sm:text-2xl font-black text-white">{city.code}</span>
              <span className="text-[10px] text-slate-300 block mt-0.5">{city.state}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onApplyCityToCatalog(city.code, city.name)}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Alle Räder in {city.name} ansehen</span>
            </button>
            <button
              onClick={onOpenLeasingGuide}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Dienstrad-Rechner öffnen</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Sections Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* City Cycling Snapshot Card */}
        <section className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/90 mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>Radfahr-Profil & Topographie</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                Fahrradfahren in {city.name} auf einen Blick
              </h2>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold self-start md:self-auto flex items-center gap-1.5">
              <span>Topographie:</span>
              <span className="capitalize text-emerald-700">{profile.topography.replace('-', ' ')}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Landschaft & Untergrund</span>
              <p className="text-sm text-slate-700 leading-relaxed">
                {profile.topographyDesc}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Empfohlene Fahrradtypen</span>
              <div className="flex flex-wrap gap-1.5">
                {profile.recommendedBikeTypes.map((type) => (
                  <span
                    key={type}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200/80"
                  >
                    ✓ {type}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Empfohlene Motorleistung</span>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{profile.recommendedMotorTorque}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 1: Live Local Bikes & Offers in this City */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                <Bike className="w-4 h-4" />
                <span>Sofort vor Ort verfügbar</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                Aktuelle Fahrrad-Angebote im Raum {city.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Verifizierte Bestände mit Übergabeinspektion bei Fachhändlern in {city.name} und Umland.
              </p>
            </div>

            {/* Quick Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {[
                { id: 'ALL', label: 'Alle' },
                { id: 'E_BIKE', label: 'E-Bikes' },
                { id: 'GRAVEL', label: 'Gravel' },
                { id: 'MTB', label: 'Mountainbike' },
                { id: 'TREKKING', label: 'Trekking' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === tab.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {filteredLocalOffers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredLocalOffers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  onSelectOffer={onSelectOffer}
                  onTrackOutbound={onTrackOutbound}
                  onOpenDealer={onOpenDealer}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-2xs">
              <Bike className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
              <h3 className="font-bold text-slate-900 text-base mb-1">
                Große Auswahl im Einzugsgebiet von {city.name}
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto mb-4">
                Unsere Partnershops liefern auch fahrfertig montiert direkt zu dir nach {city.name} oder bieten Click & Collect in der Region {city.state}.
              </p>
              <button
                onClick={() => onApplyCityToCatalog(city.code, city.name)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                Gesamten Katalog für {city.name} öffnen
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => onApplyCityToCatalog(city.code, city.name)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <span>Alle verfügbaren Modelle für {city.name} im Hauptkatalog filtern</span>
              <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
            </button>
          </div>
        </section>

        {/* Section 2: Authorized Partner Dealers & Local Bike Shops in City */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/90 mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Stationärer Handel & Werkstätten</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                Fahrradläden & Fachhändler in und um {city.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Persönliche Beratung, Ergonomie-Einstellung und Probefahrten bei verifizierten Fachbetrieben.
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold self-start sm:self-auto">
              {localDealers.length} Händlerpartner
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {localDealers.slice(0, 6).map(({ dealer, location, distanceKm, isExactCity }) => (
              <div
                key={dealer.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all shadow-2xs flex flex-col justify-between bg-slate-50/50 hover:bg-white"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="font-bold text-sm text-slate-900">{dealer.name}</h3>
                    {isExactCity ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                        Vor Ort
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200/80 text-slate-700 shrink-0">
                        {distanceKm} km
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mb-2">
                    {location.address_line1}, {location.postal_code} {location.city}
                  </p>

                  {location.opening_hours && (
                    <p className="text-[11px] text-slate-500 mb-2">
                      🕒 {location.opening_hours}
                    </p>
                  )}

                  {/* Dealer Supported Leasing Pill Badges */}
                  {dealer.supported_providers && dealer.supported_providers.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200/70">
                      <span className="text-[10px] text-slate-400 font-medium block mb-1">
                        Autorisierte Leasing-Partner:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {dealer.supported_providers.slice(0, 4).map((p) => (
                          <span
                            key={p.provider_slug}
                            className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white text-emerald-800 border border-emerald-200"
                          >
                            ✓ {p.provider_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  {onOpenDealer ? (
                    <button
                      type="button"
                      onClick={() => onOpenDealer(dealer.slug)}
                      className="font-bold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1"
                    >
                      <span>Händlerbestand</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : <span />}

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 text-[11px]"
                  >
                    <Navigation className="w-3 h-3 text-emerald-600" />
                    <span>Route</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Dienstrad-Leasing Guide for this City */}
        <section className="bg-gradient-to-r from-emerald-50 via-teal-50/40 to-emerald-50 border border-emerald-300/80 rounded-2xl p-6 sm:p-8 shadow-sm mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Steuerlich gefördertes Dienstrad-Leasing</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                Dienstrad-Leasing in {city.name}: Bis zu 40% sparen
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                Egal ob Angestellter, Beamter oder Selbstständiger in {city.name} ({city.state}): Über die 0,25 %-Regelung wird dein neues E-Bike oder Fahrrad bequem über die monatliche Gehaltsabrechnung finanziert (Brutto-Gehaltsumwandlung). Das spart bis zu 40 % gegenüber dem regulären Kaufpreis – inklusive Vollkaskoschutz und Inspektionspaket.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                {['JobRad', 'BusinessBike', 'Deutsche Dienstrad', 'Bikeleasing', 'Lease a Bike', 'Eurorad'].map((provider) => (
                  <div key={provider} className="flex items-center gap-1 text-xs font-bold text-emerald-950 bg-white/80 px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{provider}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm shrink-0 lg:w-80 text-center space-y-3">
              <Award className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-slate-900 text-sm">Leasing-Vorteilsrechner</h3>
              <p className="text-xs text-slate-500">
                Berechne deine persönliche monatliche Nettorate für dein Traumbike in {city.name}.
              </p>
              <button
                onClick={onOpenLeasingGuide}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Jetzt Ersparnis berechnen</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* Section 4: Local Cycling Guide & Scenic Routes */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/90 mb-12">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>Lokale Streckenempfehlungen</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              Die schönsten Radwege in und um {city.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Entdecke erprobte Routen für Pendler, Wochenendausflüge und sportliche Touren.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {profile.popularRoutes.map((route, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                      {route.distance}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Route #{idx + 1}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1">{route.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{route.highlight}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Regional Subsidy Banner */}
          {profile.subsidyProgram && (
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-teal-950 block text-sm">
                  {profile.subsidyProgram.name}: {profile.subsidyProgram.amount}
                </span>
                <span className="text-teal-800 mt-0.5 block leading-relaxed">
                  {profile.subsidyProgram.description}
                </span>
              </div>
            </div>
          )}

          {/* Local Tips */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Experten-Tipps für Radler in {city.name}</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-600">
              {profile.localTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Section 5: City FAQ Accordion (Schema.org compliant) */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/90 mb-12">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>Häufig gestellte Fragen</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              FAQ: Fahrradkauf & Dienstrad-Leasing in {city.name}
            </h2>
          </div>

          <div className="space-y-3">
            {profile.faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-xs sm:text-sm text-slate-900">{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-white text-xs sm:text-sm text-slate-600 border-t border-slate-100 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 6: Neighboring Cities & Surrounding Regions (Internal Linking) */}
        <section className="bg-slate-100/80 rounded-2xl p-6 sm:p-8 border border-slate-200/90">
          <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Fahrrad-Ratgeber für Nachbarstädte & Regionen im Umkreis</span>
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Weitere geprüfte Fachhändler und Fahrradangebote in der Region rund um {city.name}:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {nearbyCities.map((nc) => (
              <button
                key={`${nc.code}-${nc.name}`}
                onClick={() => onSelectCity(nc)}
                className="p-3 bg-white hover:bg-emerald-50 rounded-xl border border-slate-200 hover:border-emerald-300 text-left transition-all shadow-2xs group cursor-pointer"
              >
                <span className="text-[10px] text-slate-400 block font-mono">{nc.code}</span>
                <span className="font-bold text-xs text-slate-800 group-hover:text-emerald-800 block truncate">
                  {nc.name}
                </span>
                <span className="text-[10px] text-slate-500 truncate block mt-0.5">{nc.state}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <button
              onClick={onBackToOverview}
              className="font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
            >
              <span>← Zurück zur Gesamtübersicht aller Städte in Deutschland</span>
            </button>
            <span className="text-slate-400">
              VeloFind • Bundesweites Netzwerk geprüfter Fahrrad-Fachhändler
            </span>
          </div>
        </section>
      </div>
    </article>
  );
};
