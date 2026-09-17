import React from 'react';
import { Search, MapPin, SlidersHorizontal, ArrowUpDown, X, Heart } from 'lucide-react';
import { BikeCategory, PropulsionType } from '../types';
import { useFavorites } from '../utils/favorites';

interface SearchFiltersBarProps {
  query: string;
  setQuery: (q: string) => void;
  category: string;
  setCategory: (c: string) => void;
  propulsion: string;
  setPropulsion: (p: string) => void;
  brand: string;
  setBrand: (b: string) => void;
  leasingProvider: string;
  setLeasingProvider: (lp: string) => void;
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
}

const CATEGORIES: { id: string; label: string }[] = [
  { id: 'ALL', label: 'Alle Kategorien' },
  { id: 'MTB', label: 'E-MTB / Mountainbike' },
  { id: 'GRAVEL', label: 'Gravelbike' },
  { id: 'TREKKING', label: 'Trekking / Allroad' },
  { id: 'CITY', label: 'City / Urban' },
  { id: 'CARGO', label: 'Lastenrad / Cargo' },
  { id: 'ROAD', label: 'Rennrad' }
];

const PROPULSIONS: { id: string; label: string }[] = [
  { id: 'ALL', label: 'Alle Antriebe' },
  { id: 'PEDELEC', label: 'E-Bike (25 km/h)' },
  { id: 'S_PEDELEC', label: 'S-Pedelec (45 km/h)' },
  { id: 'MUSCULAR', label: 'Bio / Muskelkraft' }
];

const POPULAR_CITIES = [
  { name: 'Deutschlandweit', code: '' },
  { name: 'Berlin', code: '10115' },
  { name: 'München', code: '80331' },
  { name: 'Hamburg', code: '20095' },
  { name: 'Köln', code: '50667' },
  { name: 'Frankfurt', code: '60311' },
  { name: 'Stuttgart', code: '70173' },
  { name: 'Leipzig', code: '04109' },
  { name: 'Münster', code: '48143' }
];

export const SearchFiltersBar: React.FC<SearchFiltersBarProps> = ({
  query,
  setQuery,
  category,
  setCategory,
  propulsion,
  setPropulsion,
  brand,
  setBrand,
  leasingProvider,
  setLeasingProvider,
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
  setOnlyFavorites
}) => {
  const { favoritesCount } = useFavorites();
  const isFiltered = query || category !== 'ALL' || propulsion !== 'ALL' || brand !== 'ALL' || leasingProvider !== 'ALL' || postalCode || onlyFavorites;

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
              placeholder="Modell, Marke, Motor suchen (z.B. Cube, Bosch 85Nm)..."
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
            <div className="relative flex-1">
              <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                id="city-select-dropdown"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900"
              >
                {POPULAR_CITIES.map((c) => (
                  <option key={c.name} value={c.code}>
                    {c.name} {c.code ? `(${c.code})` : ''}
                  </option>
                ))}
              </select>
            </div>

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

        {/* Filters Row (Category, Propulsion, Brand, Leasing Provider) */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
          {/* Category Select */}
          <select
            id="filter-category-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>

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

          {/* Leasing Provider Select */}
          <select
            id="filter-provider-select"
            value={leasingProvider}
            onChange={(e) => setLeasingProvider(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-emerald-300 text-xs font-medium text-emerald-900 bg-emerald-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">Alle Leasinganbieter</option>
            {availableProviders.map(lp => (
              <option key={lp.slug} value={lp.slug}>✓ {lp.name} ({lp.count})</option>
            ))}
          </select>

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
      </div>
    </div>
  );
};
