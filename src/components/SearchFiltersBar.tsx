import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, MapPin, SlidersHorizontal, ArrowUpDown, X, Heart, Edit3, ListFilter, Bike, ChevronDown, Check, Globe, Navigation, Bell, Zap, Gauge, Weight, Euro, Sparkles } from 'lucide-react';
import { BikeCategory, PropulsionType } from '../types';
import { useFavorites } from '../utils/favorites';
import { ALL_GERMAN_CITIES, TOP_GERMAN_METROPOLES, CITIES_BY_STATE, findCity } from '../data/germanCities';
import { findNearestGermanCity } from '../utils/geo';
import { LeasingProviderLogo, LEASING_PROVIDER_METADATA } from './LeasingProviderLogo';

interface SearchFiltersBarProps {
  query: string;
  setQuery: (q: string) => void;
  category: string;
  setCategory: (c: string) => void;
  availableCategories?: { category: string; count: number }[];
  propulsion: string;
  setPropulsion: (p: string) => void;
  brand: string;
  setBrand: (b: string) => void;
  motorBrand?: string;
  setMotorBrand?: (mb: string) => void;
  availableMotorBrands?: { name: string; count: number }[];
  engineType?: string;
  setEngineType?: (et: string) => void;
  frameType?: string;
  setFrameType?: (ft: string) => void;
  minTorque?: number;
  setMinTorque?: (nm: number) => void;
  maxWeight?: number;
  setMaxWeight?: (kg: number) => void;
  minPrice?: number;
  setMinPrice?: (min: number | undefined) => void;
  maxPrice?: number;
  setMaxPrice?: (max: number | undefined) => void;
  leasingProvider: string;
  setLeasingProvider: (lp: string) => void;
  selectedDealerSlug?: string;
  setSelectedDealerSlug?: (slug: string) => void;
  availableDealers?: { id: string; name: string; slug: string; count: number; city?: string; website_url?: string }[];
  postalCode: string;
  setPostalCode: (plz: string) => void;
  radiusKm: number;
  setRadiusKm: (r: number) => void;
  sort: string;
  setSort: (s: any) => void;
  availableBrands: { name: string; count: number }[];
  availableProviders: { slug: string; name: string; count: number }[];
  totalResults: number;
  resetFilters: () => void;
  onlyFavorites?: boolean;
  setOnlyFavorites?: (val: boolean) => void;
  onOpenSaveSearch?: () => void;
  onOpenSavedSearches?: () => void;
}

export interface CategoryOption {
  id: string;
  label: string;
  shortLabel: string;
  tagline: string;
}

const CATEGORIES: CategoryOption[] = [
  { id: 'ALL', label: 'Alle Kategorien', shortLabel: 'Alle', tagline: 'Gesamtes Sortiment durchsuchen' },
  { id: 'MTB', label: 'E-MTB / Mountainbike', shortLabel: 'E-MTB', tagline: 'Trail, All-Mountain & Enduro' },
  { id: 'CITY', label: 'City & Urban', shortLabel: 'City', tagline: 'Alltag, Pendeln & City-Komfort' },
  { id: 'GRAVEL', label: 'Gravelbike', shortLabel: 'Gravel', tagline: 'Schotter, All-Road & Abenteuer' },
  { id: 'TREKKING', label: 'Trekking & Allroad', shortLabel: 'Trekking', tagline: 'Touren, Reisen & Langstrecke' },
  { id: 'CARGO', label: 'Lastenrad / Cargo', shortLabel: 'Cargo', tagline: 'Familie, Einkauf & Transport' },
  { id: 'E_BIKE', label: 'E-Bike Allround', shortLabel: 'E-Bike', tagline: 'Vielseitige Pedelecs' },
  { id: 'ROAD', label: 'Rennrad / Road', shortLabel: 'Rennrad', tagline: 'Speed & Asphalt-Performance' }
];

const PROPULSIONS: { id: string; label: string }[] = [
  { id: 'ALL', label: 'Alle Antriebe' },
  { id: 'PEDELEC', label: 'E-Bike (25 km/h)' },
  { id: 'S_PEDELEC', label: 'S-Pedelec (45 km/h)' },
  { id: 'MUSCULAR', label: 'Bio / Muskelkraft' }
];

export const SearchFiltersBar: React.FC<SearchFiltersBarProps> = ({
  query,
  setQuery,
  category,
  setCategory,
  availableCategories,
  propulsion,
  setPropulsion,
  brand,
  setBrand,
  motorBrand,
  setMotorBrand,
  availableMotorBrands,
  engineType = 'ALL',
  setEngineType,
  frameType = 'ALL',
  setFrameType,
  minTorque = 0,
  setMinTorque,
  maxWeight = 0,
  setMaxWeight,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  leasingProvider,
  setLeasingProvider,
  selectedDealerSlug,
  setSelectedDealerSlug,
  availableDealers,
  postalCode,
  setPostalCode,
  radiusKm,
  setRadiusKm,
  sort,
  setSort,
  availableBrands,
  availableProviders,
  totalResults,
  resetFilters,
  onlyFavorites = false,
  setOnlyFavorites,
  onOpenSaveSearch,
  onOpenSavedSearches
}) => {
  const { favoritesCount } = useFavorites();
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customInputText, setCustomInputText] = useState(postalCode);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const [isProviderOpen, setIsProviderOpen] = useState(false);
  const providerDropdownRef = useRef<HTMLDivElement>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isPriceCustomOpen, setIsPriceCustomOpen] = useState(false);
  const priceDropdownRef = useRef<HTMLDivElement>(null);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const nearest = findNearestGermanCity(pos.coords.latitude, pos.coords.longitude);
        if (nearest) {
          setPostalCode(nearest.code);
          setCustomInputText(nearest.code);
          setIsCustomMode(false);
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
      },
      { timeout: 7000 }
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (providerDropdownRef.current && !providerDropdownRef.current.contains(event.target as Node)) {
        setIsProviderOpen(false);
      }
      if (priceDropdownRef.current && !priceDropdownRef.current.contains(event.target as Node)) {
        setIsPriceCustomOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCategoryOpen(false);
        setIsProviderOpen(false);
        setIsPriceCustomOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const categoryCountsMap = useMemo(() => {
    const map = new Map<string, number>();
    if (availableCategories) {
      availableCategories.forEach(ac => {
        map.set(ac.category, ac.count);
      });
    }
    return map;
  }, [availableCategories]);

  // Map of counts from availableProviders
  const providerCountsMap = useMemo(() => {
    const map = new Map<string, number>();
    if (availableProviders) {
      availableProviders.forEach((p) => {
        map.set(p.slug.toLowerCase(), p.count);
      });
    }
    return map;
  }, [availableProviders]);

  // Combined comprehensive list of German leasing providers
  const fullProvidersList = useMemo(() => {
    const defaultSlugs = ['jobrad', 'bikeleasing', 'businessbike', 'deutsche-dienstrad', 'eurorad', 'lease-a-bike'];
    const seen = new Set<string>();
    const list: { slug: string; name: string; count?: number; tagline?: string }[] = [];

    // Add available providers with verified live counts
    if (availableProviders) {
      availableProviders.forEach((ap) => {
        const s = ap.slug.toLowerCase();
        seen.add(s);
        list.push({
          slug: ap.slug,
          name: ap.name,
          count: ap.count,
          tagline: LEASING_PROVIDER_METADATA[s]?.tagline
        });
      });
    }

    // Add any remaining recognized providers to ensure full discoverability
    defaultSlugs.forEach((s) => {
      if (!seen.has(s)) {
        const meta = LEASING_PROVIDER_METADATA[s];
        list.push({
          slug: s,
          name: meta ? meta.name : s,
          count: providerCountsMap.get(s) ?? 0,
          tagline: meta?.tagline
        });
      }
    });

    return list;
  }, [availableProviders, providerCountsMap]);

  // Total offers aggregated across all partner dealers (sum of all offers from each partner shop)
  const totalPartnerOffers = useMemo(() => {
    if (!availableDealers || availableDealers.length === 0) return totalResults || 0;
    const sum = availableDealers.reduce((acc, d) => acc + (Number(d.count) || 0), 0);
    return sum > 0 ? sum : (totalResults || 0);
  }, [availableDealers, totalResults]);

  const selectedProviderMeta = LEASING_PROVIDER_METADATA[leasingProvider.toLowerCase()];
  const selectedProviderName = selectedProviderMeta?.name || availableProviders.find(p => p.slug === leasingProvider)?.name || leasingProvider;

  const selectedCategoryObj = CATEGORIES.find(c => c.id === category) || {
    id: category,
    label: category,
    shortLabel: category,
    tagline: ''
  };

  const isFiltered = Boolean(
    query ||
    category !== 'ALL' ||
    propulsion !== 'ALL' ||
    brand !== 'ALL' ||
    (motorBrand && motorBrand !== 'ALL') ||
    (engineType && engineType !== 'ALL') ||
    (frameType && frameType !== 'ALL') ||
    (minTorque && minTorque > 0) ||
    (maxWeight && maxWeight > 0) ||
    (minPrice !== undefined && minPrice > 0) ||
    (maxPrice !== undefined && maxPrice > 0) ||
    leasingProvider !== 'ALL' ||
    selectedDealerSlug ||
    postalCode ||
    onlyFavorites
  );

  // Check if current postalCode matches a known city
  const knownCity = findCity(postalCode);

  const handleCustomInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInputText.trim()) {
      // Check if user entered a city name from our database
      const match = findCity(customInputText.trim());
      if (match) {
        setPostalCode(match.code);
      } else {
        setPostalCode(customInputText.trim());
      }
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Main Search & Location Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Keyword Search */}
          <div className="md:col-span-5 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="search-input-field"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Modell, Marke, Händler oder Website (z.B. Cube, lucky-bike.de, fahrrad-xxl.de)..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900 placeholder:text-slate-400"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Postal Code / City & Radius */}
          <div className="md:col-span-4 flex items-center gap-2">
            {!isCustomMode ? (
              <div className="relative flex-1">
                <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  id="city-select-dropdown"
                  value={postalCode}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setIsCustomMode(true);
                    } else {
                      setPostalCode(e.target.value);
                      setCustomInputText(e.target.value);
                    }
                  }}
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900 truncate"
                >
                  <option value="">🇩🇪 Deutschlandweit (Alle Regionen)</option>

                  {/* If a custom non-catalog PLZ is active */}
                  {postalCode && !ALL_GERMAN_CITIES.some((c) => c.code === postalCode) && (
                    <option value={postalCode}>
                      📍 Eigener Standort ({postalCode})
                    </option>
                  )}

                  <optgroup label="⭐ Top Metropolen & Großstädte">
                    {TOP_GERMAN_METROPOLES.map((c) => (
                      <option key={`metro-${c.code}-${c.name}`} value={c.code}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </optgroup>

                  {Object.entries(CITIES_BY_STATE).map(([stateName, cities]) => (
                    <optgroup key={stateName} label={`📍 ${stateName}`}>
                      {cities.map((c) => (
                        <option key={`${stateName}-${c.code}-${c.name}`} value={c.code}>
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </optgroup>
                  ))}

                  <optgroup label="✏️ Manuelle Eingabe">
                    <option value="__custom__">Andere PLZ / Stadt manuell eintippen...</option>
                  </optgroup>
                </select>

                <button
                  type="button"
                  onClick={() => setIsCustomMode(true)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-700 p-1 rounded-md"
                  title="PLZ direkt eintippen"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleCustomInputSubmit} className="relative flex-1 flex items-center">
                <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="custom-plz-city-input"
                  type="text"
                  list="german-cities-list"
                  value={customInputText}
                  onChange={(e) => setCustomInputText(e.target.value)}
                  placeholder="PLZ oder Stadt eingeben..."
                  className="w-full pl-9 pr-14 py-2 rounded-xl border border-emerald-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-emerald-50/20 text-slate-900"
                  autoFocus
                />
                <datalist id="german-cities-list">
                  {ALL_GERMAN_CITIES.map((c) => (
                    <option key={c.code} value={`${c.name} (${c.code})`} />
                  ))}
                </datalist>
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="submit"
                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCustomMode(false)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                    title="Zurück zur Liste"
                  >
                    <ListFilter className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isLocating}
              className="p-2.5 rounded-xl border border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              title="GPS-Standort ermitteln (nächstgelegene Stadt in Deutschland)"
            >
              <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {postalCode && (
              <div className="w-28">
                <select
                  id="radius-select-dropdown"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="w-full px-2.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900"
                >
                  <option value={10}>+ 10 km</option>
                  <option value={25}>+ 25 km</option>
                  <option value={50}>+ 50 km</option>
                  <option value={100}>+ 100 km</option>
                </select>
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-3 flex items-center justify-end gap-2">
            <div className="relative w-full">
              <ArrowUpDown className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                id="sort-select-dropdown"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900"
              >
                <option value="newest">Neueste Angebote</option>
                <option value="price_asc">Preis: aufsteigend</option>
                <option value="price_desc">Preis: absteigend</option>
                {postalCode && <option value="distance_asc">Entfernung zum Händler</option>}
              </select>
            </div>
          </div>
        </div>

        {/* Quick Partner Website Filter Strip */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 text-xs">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>Top Händler-Websites:</span>
          </div>
          {[
            { label: 'lucky-bike.de', query: 'lucky-bike.de' },
            { label: 'fahrrad-xxl.de', query: 'fahrrad-xxl.de' },
            { label: 'boc24.de', query: 'boc24.de' },
            { label: 'emotion-technologies.de', query: 'emotion-technologies.de' },
            { label: 'radwelt-bielefeld.de', query: 'radwelt-bielefeld.de' },
            { label: 'zweiradhaus-westerfeld.de', query: 'zweiradhaus-westerfeld.de' },
            { label: '2rad-schroeder.de', query: '2rad-schroeder.de' },
            { label: 'fahrrad-schwarz.de', query: 'fahrrad-schwarz.de' }
          ].map((shop) => {
            const isShopActive = query.toLowerCase().includes(shop.query);
            return (
              <button
                key={shop.query}
                type="button"
                onClick={() => {
                  if (isShopActive) {
                    setQuery('');
                  } else {
                    setQuery(shop.query);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  isShopActive
                    ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-emerald-800'
                }`}
              >
                <span>{shop.label}</span>
                {isShopActive && <X className="w-3 h-3 ml-0.5" />}
              </button>
            );
          })}
        </div>

        {/* Filters Row (Category, Propulsion, Brand, Leasing Provider) */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
          {/* Dedicated 'Bike Category' Dropdown Filter */}
          <div ref={categoryDropdownRef} id="filter-category-dropdown-container" className="relative">
            {/* Native fallback/accessible select */}
            <select
              id="filter-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="sr-only"
              aria-label="Bike Category Filter"
              tabIndex={-1}
            >
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>

            <button
              id="filter-category-dropdown-btn"
              type="button"
              onClick={() => setIsCategoryOpen(prev => !prev)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all shadow-2xs ${
                category !== 'ALL'
                  ? 'bg-emerald-50 text-emerald-950 border-emerald-400 font-semibold ring-1 ring-emerald-200'
                  : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 border-slate-200'
              }`}
              aria-haspopup="listbox"
              aria-expanded={isCategoryOpen}
            >
              <Bike className={`w-3.5 h-3.5 ${category !== 'ALL' ? 'text-emerald-700' : 'text-slate-500'}`} />
              <span className="text-slate-500 font-normal">Bike Category:</span>
              <span className="font-semibold text-slate-900">
                {selectedCategoryObj.shortLabel || selectedCategoryObj.label}
              </span>

              {category !== 'ALL' && (
                <span
                  role="button"
                  id="btn-clear-category-selection"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCategory('ALL');
                  }}
                  className="p-0.5 rounded hover:bg-emerald-200/70 text-emerald-800 transition-colors ml-0.5"
                  title="Kategorie zurücksetzen"
                  aria-label="Kategorie zurücksetzen"
                >
                  <X className="w-3 h-3" />
                </span>
              )}

              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isCategoryOpen ? 'rotate-180 text-emerald-600' : 'text-slate-400'
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isCategoryOpen && (
              <div
                id="filter-category-dropdown-menu"
                className="absolute left-0 top-full mt-1.5 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-2.5 z-40 animate-in fade-in zoom-in-95 duration-150"
              >
                {/* Dropdown Header */}
                <div className="px-2 py-1.5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Bike className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Bike Category
                    </span>
                  </div>
                  {category !== 'ALL' && (
                    <button
                      type="button"
                      id="btn-category-dropdown-reset-all"
                      onClick={() => {
                        setCategory('ALL');
                        setIsCategoryOpen(false);
                      }}
                      className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold underline"
                    >
                      Alle anzeigen
                    </button>
                  )}
                </div>

                {/* Quick Toggle Strip in Menu */}
                <div className="my-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Schnellwahl (1 Klick)
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'ALL', label: 'Alle' },
                      { id: 'MTB', label: 'E-MTB' },
                      { id: 'CITY', label: 'City' },
                      { id: 'GRAVEL', label: 'Gravel' },
                      { id: 'TREKKING', label: 'Trekking' },
                      { id: 'CARGO', label: 'Cargo' }
                    ].map((q) => {
                      const isSelected = category === q.id;
                      return (
                        <button
                          key={q.id}
                          id={`dropdown-quick-cat-${q.id.toLowerCase()}`}
                          type="button"
                          onClick={() => {
                            setCategory(q.id);
                            setIsCategoryOpen(false);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                          }`}
                        >
                          {q.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Full list of categories */}
                <div className="max-h-72 overflow-y-auto space-y-1 py-1">
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat.id;
                    const count = categoryCountsMap.get(cat.id);

                    return (
                      <button
                        key={cat.id}
                        id={`category-dropdown-item-${cat.id.toLowerCase()}`}
                        type="button"
                        onClick={() => {
                          setCategory(cat.id);
                          setIsCategoryOpen(false);
                        }}
                        className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-left transition-colors group ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-950 font-semibold border border-emerald-300/80 shadow-2xs'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-800'
                            }`}
                          >
                            <Bike className="w-3.5 h-3.5" />
                          </div>
                          <div className="truncate">
                            <div className="text-xs font-medium truncate flex items-center gap-1.5">
                              <span className={isSelected ? 'font-bold text-emerald-950' : 'text-slate-900'}>
                                {cat.label}
                              </span>
                              {cat.shortLabel && cat.id !== 'ALL' && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600">
                                  {cat.shortLabel}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-normal truncate">
                              {cat.tagline}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {typeof count === 'number' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                              {count} {count === 1 ? 'Rad' : 'Räder'}
                            </span>
                          )}
                          {isSelected ? (
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <div className="w-4 h-4" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick Category Toggle Pills (E-MTB, City, Gravel) */}
          <div className="flex items-center gap-1" role="group" aria-label="Schnellfilter Fahrradkategorien">
            {[
              { id: 'MTB', label: 'E-MTB' },
              { id: 'CITY', label: 'City' },
              { id: 'GRAVEL', label: 'Gravel' }
            ].map((quickCat) => {
              const isActive = category === quickCat.id;
              return (
                <button
                  key={quickCat.id}
                  id={`filter-quick-category-${quickCat.id.toLowerCase()}`}
                  type="button"
                  onClick={() => setCategory(isActive ? 'ALL' : quickCat.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1 ${
                    isActive
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border-slate-200'
                  }`}
                  title={`Schnellwahl: ${quickCat.label} ${isActive ? 'abwählen' : 'filtern'}`}
                >
                  <span>{quickCat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Propulsion Select */}
          <select
            id="filter-propulsion-select"
            value={propulsion}
            onChange={(e) => setPropulsion(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {PROPULSIONS.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>

          {/* Brand Select */}
          <select
            id="filter-brand-select"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">Alle Marken</option>
            {availableBrands.map(b => (
              <option key={b.name} value={b.name}>{b.name} ({b.count})</option>
            ))}
          </select>

          {/* Motor Brand Select (Bosch, Shimano, Yamaha, Specialized, Brose...) */}
          {availableMotorBrands && availableMotorBrands.length > 0 && setMotorBrand && (
            <select
              id="filter-motor-brand-select"
              value={motorBrand || 'ALL'}
              onChange={(e) => setMotorBrand(e.target.value)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors ${
                motorBrand && motorBrand !== 'ALL'
                  ? 'bg-emerald-100 text-emerald-950 border-emerald-400 font-semibold'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title="Motorenmarke filtern (Bosch, Shimano, Yamaha, Specialized...)"
            >
              <option value="ALL">⚡ Alle Motoren</option>
              {availableMotorBrands.map((mb) => (
                <option key={mb.name} value={mb.name}>
                  {mb.name} ({mb.count})
                </option>
              ))}
            </select>
          )}

          {/* Dedicated 'Leasing Provider' Dropdown Filter with Company Logos */}
          <div ref={providerDropdownRef} id="filter-provider-dropdown-container" className="relative">
            {/* Native fallback/accessible select */}
            <select
              id="filter-provider-select"
              value={leasingProvider}
              onChange={(e) => setLeasingProvider(e.target.value)}
              className="sr-only"
              aria-label="Leasing Provider Filter"
              tabIndex={-1}
            >
              <option value="ALL">Alle Leasinganbieter</option>
              {fullProvidersList.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name} {typeof p.count === 'number' && p.count > 0 ? `(${p.count})` : ''}
                </option>
              ))}
            </select>

            {/* Custom Trigger Button */}
            <button
              id="filter-provider-dropdown-btn"
              type="button"
              onClick={() => setIsProviderOpen((prev) => !prev)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all shadow-2xs ${
                leasingProvider !== 'ALL'
                  ? 'bg-emerald-50 text-emerald-950 border-emerald-400 font-semibold ring-1 ring-emerald-200'
                  : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 border-slate-200'
              }`}
              aria-haspopup="listbox"
              aria-expanded={isProviderOpen}
              title="Leasinganbieter filtern"
            >
              {leasingProvider !== 'ALL' ? (
                <>
                  <LeasingProviderLogo slug={leasingProvider} size="xs" />
                  <span className="font-semibold text-slate-900 truncate max-w-[130px]">
                    {selectedProviderName}
                  </span>
                  <span
                    role="button"
                    id="btn-clear-provider-selection"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLeasingProvider('ALL');
                    }}
                    className="p-0.5 rounded hover:bg-emerald-200/70 text-emerald-800 transition-colors ml-0.5"
                    title="Leasinganbieter zurücksetzen"
                    aria-label="Leasinganbieter zurücksetzen"
                  >
                    <X className="w-3 h-3" />
                  </span>
                </>
              ) : (
                <>
                  <div className="w-4 h-4 rounded-md flex items-center justify-center bg-emerald-600 text-white text-[10px] font-bold shrink-0">
                    %
                  </div>
                  <span className="text-slate-500 font-normal">Leasinganbieter:</span>
                  <span className="font-semibold text-slate-800">Alle</span>
                </>
              )}

              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isProviderOpen ? 'rotate-180 text-emerald-600' : 'text-slate-400'
                }`}
              />
            </button>

            {/* Dropdown Menu Popover */}
            {isProviderOpen && (
              <div
                id="filter-provider-dropdown-menu"
                className="absolute left-0 top-full mt-1.5 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-2.5 z-40 animate-in fade-in zoom-in-95 duration-150"
              >
                {/* Header */}
                <div className="px-2 py-1.5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                      %
                    </div>
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Dienstrad-Leasing Partner
                    </span>
                  </div>
                  {leasingProvider !== 'ALL' && (
                    <button
                      type="button"
                      id="btn-provider-dropdown-reset-all"
                      onClick={() => {
                        setLeasingProvider('ALL');
                        setIsProviderOpen(false);
                      }}
                      className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold underline"
                    >
                      Filter zurücksetzen
                    </button>
                  )}
                </div>

                {/* All Providers Option */}
                <div className="pt-2 pb-1">
                  <button
                    type="button"
                    id="provider-dropdown-item-all"
                    onClick={() => {
                      setLeasingProvider('ALL');
                      setIsProviderOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-left transition-colors group ${
                      leasingProvider === 'ALL'
                        ? 'bg-emerald-50 text-emerald-950 font-semibold border border-emerald-300/80 shadow-2xs'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold shrink-0 border border-slate-200/60">
                        Alle
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900">
                          Alle Leasinganbieter
                        </div>
                        <div className="text-[11px] text-slate-400 font-normal">
                          Gesamtes Fachhändler-Portfolio durchsuchen
                        </div>
                      </div>
                    </div>
                    {leasingProvider === 'ALL' && (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                    )}
                  </button>
                </div>

                <div className="my-1 border-t border-slate-100" />

                {/* List of Providers with Logos */}
                <div className="max-h-72 overflow-y-auto space-y-1 py-1">
                  {fullProvidersList.map((p) => {
                    const isSelected = leasingProvider === p.slug;
                    return (
                      <button
                        key={p.slug}
                        id={`provider-dropdown-item-${p.slug}`}
                        type="button"
                        onClick={() => {
                          setLeasingProvider(p.slug);
                          setIsProviderOpen(false);
                        }}
                        className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-left transition-colors group ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-950 font-semibold border border-emerald-300/80 shadow-2xs'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Authentic Company Logo */}
                          <LeasingProviderLogo slug={p.slug} name={p.name} size="md" />

                          <div className="truncate">
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 truncate">
                              <span>{p.name}</span>
                            </div>
                            {p.tagline && (
                              <div className="text-[11px] text-slate-500 font-normal truncate max-w-[210px]">
                                {p.tagline}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {typeof p.count === 'number' && p.count > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100/80 text-emerald-900 border border-emerald-200/60">
                              {p.count} {p.count === 1 ? 'Rad' : 'Räder'}
                            </span>
                          )}
                          {isSelected ? (
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <div className="w-4 h-4" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Partner-Händler Select */}
          {availableDealers && availableDealers.length > 0 && setSelectedDealerSlug && (
            <select
              id="filter-dealer-select"
              value={selectedDealerSlug || 'ALL'}
              onChange={(e) => setSelectedDealerSlug(e.target.value === 'ALL' ? '' : e.target.value)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors ${
                selectedDealerSlug
                  ? 'bg-emerald-100 text-emerald-950 border-emerald-400 font-semibold'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <option value="ALL">
                Alle {availableDealers.length} Partner-Händler & Websites ({totalPartnerOffers.toLocaleString('de-DE')} Angebote)
              </option>
              {availableDealers.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name} {d.website_url ? `(${d.website_url})` : (d.city ? `(${d.city})` : '')} ({d.count.toLocaleString('de-DE')} Angebote)
                </option>
              ))}
            </select>
          )}

          {/* Quick Favorites Filter Toggle */}
          {setOnlyFavorites && (
            <button
              id="filter-favorites-toggle-btn"
              type="button"
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs border ${
                onlyFavorites
                  ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                  : 'bg-white text-slate-700 hover:text-rose-600 hover:bg-rose-50/50 border-slate-200'
              }`}
              title="Nur gespeicherte Favoriten anzeigen"
            >
              <Heart
                className={`w-3.5 h-3.5 transition-transform ${
                  onlyFavorites
                    ? 'fill-white text-white scale-110'
                    : favoritesCount > 0
                    ? 'fill-rose-500 text-rose-500'
                    : 'text-slate-400'
                }`}
              />
              <span>Nur Favoriten</span>
              {favoritesCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                    onlyFavorites ? 'bg-white text-rose-600' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {favoritesCount}
                </span>
              )}
            </button>
          )}

          {/* Reset Filters Button */}
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="ml-auto px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 hover:bg-slate-100 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Filter zurücksetzen</span>
            </button>
          )}
        </div>

        {/* Advanced Filters & Saved Search Row */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          {/* Motortyp Filter */}
          {setEngineType && (
            <select
              id="filter-engine-type-select"
              value={engineType}
              onChange={(e) => setEngineType(e.target.value)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors ${
                engineType !== 'ALL'
                  ? 'bg-emerald-50 text-emerald-950 border-emerald-400 font-semibold'
                  : 'bg-white text-slate-700 border-slate-200'
              }`}
              title="Motortyp filtern"
            >
              <option value="ALL">⚡ Motortyp: Alle</option>
              <option value="MITTELMOTOR">Mittelmotor (Tretlager)</option>
              <option value="HECKMOTOR">Heckmotor (Nabenmotor)</option>
              <option value="FRONT_MOTOR">Frontmotor (Vorderrad)</option>
              <option value="MUSCULAR">Bio-Bike (ohne Motor)</option>
            </select>
          )}

          {/* Rahmenform Filter */}
          {setFrameType && (
            <select
              id="filter-frame-type-select"
              value={frameType}
              onChange={(e) => setFrameType(e.target.value)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors ${
                frameType !== 'ALL'
                  ? 'bg-emerald-50 text-emerald-950 border-emerald-400 font-semibold'
                  : 'bg-white text-slate-700 border-slate-200'
              }`}
              title="Rahmenform filtern"
            >
              <option value="ALL">🚲 Rahmenform: Alle</option>
              <option value="DIAMOND">Diamant / Herren</option>
              <option value="TRAPEZE">Trapez / Damen</option>
              <option value="WAVE">Wave / Tiefeinsteiger</option>
              <option value="COMPACT">Kompakt / Faltrad</option>
            </select>
          )}

          {/* Drehmoment Nm Filter */}
          {setMinTorque && (
            <select
              id="filter-torque-select"
              value={minTorque || 0}
              onChange={(e) => setMinTorque(Number(e.target.value))}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors ${
                minTorque && minTorque > 0
                  ? 'bg-emerald-50 text-emerald-950 border-emerald-400 font-semibold'
                  : 'bg-white text-slate-700 border-slate-200'
              }`}
              title="Mindest-Drehmoment des Motors filtern"
            >
              <option value={0}>💪 Drehmoment: Beliebig</option>
              <option value={40}>ab 40 Nm (City & Leicht)</option>
              <option value={60}>ab 60 Nm (Allround)</option>
              <option value={75}>ab 75 Nm (Sport & Tour)</option>
              <option value={85}>ab 85 Nm (Power E-MTB)</option>
            </select>
          )}

          {/* Bike Weight Filter */}
          {setMaxWeight && (
            <select
              id="filter-weight-select"
              value={maxWeight || 0}
              onChange={(e) => setMaxWeight(Number(e.target.value))}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors ${
                maxWeight && maxWeight > 0
                  ? 'bg-emerald-50 text-emerald-950 border-emerald-400 font-semibold'
                  : 'bg-white text-slate-700 border-slate-200'
              }`}
              title="Maximales Fahrradgewicht filtern"
            >
              <option value={0}>⚖️ Gewicht: Beliebig</option>
              <option value={16}>bis 16 kg (Ultraleicht)</option>
              <option value={20}>bis 20 kg (Leichtbau)</option>
              <option value={24}>bis 24 kg</option>
              <option value={28}>bis 28 kg</option>
            </select>
          )}

          {/* Price Range Filter */}
          {(setMinPrice || setMaxPrice) && (
            <div className="relative" ref={priceDropdownRef}>
              <button
                id="filter-price-dropdown-btn"
                type="button"
                onClick={() => setIsPriceCustomOpen((prev) => !prev)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  (minPrice !== undefined && minPrice > 0) || (maxPrice !== undefined && maxPrice > 0)
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-400 font-semibold'
                    : 'bg-white text-slate-700 hover:text-slate-900 border-slate-200'
                }`}
                title="Preisspanne filtern"
              >
                <Euro className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {minPrice && maxPrice
                    ? `${minPrice.toLocaleString('de-DE')} € – ${maxPrice.toLocaleString('de-DE')} €`
                    : minPrice
                    ? `ab ${minPrice.toLocaleString('de-DE')} €`
                    : maxPrice
                    ? `bis ${maxPrice.toLocaleString('de-DE')} €`
                    : 'Preis: Beliebig'}
                </span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isPriceCustomOpen ? 'rotate-180' : ''}`} />
              </button>

              {isPriceCustomOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-40 space-y-3 animate-in fade-in zoom-in-95 duration-100">
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>Preisspanne wählen</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (setMinPrice) setMinPrice(undefined);
                        if (setMaxPrice) setMaxPrice(undefined);
                        setIsPriceCustomOpen(false);
                      }}
                      className="text-[11px] text-slate-400 hover:text-slate-700 underline"
                    >
                      Zurücksetzen
                    </button>
                  </div>

                  {/* Popular Presets */}
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {[
                      { label: 'bis 1.500 €', min: undefined, max: 1500 },
                      { label: '1.500 – 3.000 €', min: 1500, max: 3000 },
                      { label: '3.000 – 5.000 €', min: 3000, max: 5000 },
                      { label: 'über 5.000 €', min: 5000, max: undefined }
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          if (setMinPrice) setMinPrice(preset.min);
                          if (setMaxPrice) setMaxPrice(preset.max);
                          setIsPriceCustomOpen(false);
                        }}
                        className="px-2 py-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg text-slate-700 text-left border border-slate-200/80 transition-colors text-[11px] font-medium"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom Min / Max Inputs */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <div className="flex-1">
                      <label className="block text-[10px] text-slate-500 font-semibold mb-1">Min (€)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={minPrice ?? ''}
                        onChange={(e) => setMinPrice && setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <span className="text-slate-400 mt-4">–</span>
                    <div className="flex-1">
                      <label className="block text-[10px] text-slate-500 font-semibold mb-1">Max (€)</label>
                      <input
                        type="number"
                        placeholder="10000"
                        value={maxPrice ?? ''}
                        onChange={(e) => setMaxPrice && setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsPriceCustomOpen(false)}
                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Anwenden
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Action: Saved Search / Suchagent Buttons */}
          <div className="ml-auto flex items-center gap-2">
            {onOpenSaveSearch && (
              <button
                id="btn-save-search-alert"
                type="button"
                onClick={onOpenSaveSearch}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs hover:shadow transition-all cursor-pointer"
                title="Suchauftrag speichern & Benachrichtigung bei neuen Rädern erhalten"
              >
                <Bell className="w-3.5 h-3.5 fill-emerald-100 text-white" />
                <span>Suchauftrag speichern</span>
              </button>
            )}

            {onOpenSavedSearches && (
              <button
                id="btn-view-saved-searches"
                type="button"
                onClick={onOpenSavedSearches}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200/70"
                title="Meine gespeicherten Suchagenten verwalten"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Meine Suchagenten</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
