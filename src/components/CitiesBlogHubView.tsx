import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Bike,
  Search,
  Building2,
  ShieldCheck,
  ChevronRight,
  Compass,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Award,
  Layers,
  Filter
} from 'lucide-react';
import { ALL_GERMAN_CITIES, GermanCity } from '../data/germanCities';
import { getAllBundeslaender, getCitiesByState, getCitySlug } from '../data/cityBlogData';

interface CitiesBlogHubViewProps {
  onSelectCity: (city: GermanCity) => void;
  onApplyCityToCatalog: (postalCode: string, cityName: string) => void;
  onOpenLeasingGuide: () => void;
}

export const CitiesBlogHubView: React.FC<CitiesBlogHubViewProps> = ({
  onSelectCity,
  onApplyCityToCatalog,
  onOpenLeasingGuide
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('ALL');

  const allStates = useMemo(() => getAllBundeslaender(), []);

  // Filter cities by search term (name or postal code) and state
  const filteredCities = useMemo(() => {
    return ALL_GERMAN_CITIES.filter((city) => {
      const matchSearch =
        !searchQuery.trim() ||
        city.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        city.code.startsWith(searchQuery.trim());
      const matchState = selectedState === 'ALL' || city.state === selectedState;
      return matchSearch && matchState;
    }).sort((a, b) => {
      // Prioritize metropolises, then alphabetical
      if (a.isMetropolis && !b.isMetropolis) return -1;
      if (!a.isMetropolis && b.isMetropolis) return 1;
      return a.name.localeCompare(b.name, 'de');
    });
  }, [searchQuery, selectedState]);

  // Featured metropolises
  const featuredMetropolises = useMemo(() => {
    return ALL_GERMAN_CITIES.filter((c) => c.isMetropolis).slice(0, 8);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/40 relative overflow-hidden">
        {/* Abstract Background Accents */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold mb-4 shadow-sm">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Fahrrad & E-Bike Ratgeber für ganz Deutschland • 170+ Städte & Orte</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Finde dein Traumrad in <span className="text-emerald-400">deiner Stadt</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Lokale Fachhändler, echte Händlerbestände vor Ort, regionale Radrouten und autorisiertes Dienstrad-Leasing (JobRad, BusinessBike u.v.m.) in allen 16 Bundesländern.
          </p>

          {/* Quick Search Input */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                id="city-hub-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Stadtname oder Postleitzahl eingeben (z. B. Berlin, Köln, 44787)..."
                className="w-full pl-12 pr-10 py-3.5 bg-white text-slate-900 rounded-2xl text-sm font-medium shadow-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-1"
                >
                  ✕
                </button>
              )}
            </div>
            {searchQuery && (
              <div className="mt-2 text-xs text-emerald-300 font-medium">
                {filteredCities.length} {filteredCities.length === 1 ? 'Stadt gefunden' : 'Städte gefunden'}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        {/* Bundesländer Filter Chips */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 min-w-max">
            <button
              onClick={() => setSelectedState('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                selectedState === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Alle Bundesländer ({ALL_GERMAN_CITIES.length})
            </button>
            {allStates.map((state) => {
              const count = ALL_GERMAN_CITIES.filter((c) => c.state === state).length;
              return (
                <button
                  key={state}
                  onClick={() => setSelectedState(state)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    selectedState === state
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {state} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured Metropolises (Visible when ALL states selected and no search) */}
        {selectedState === 'ALL' && !searchQuery.trim() && (
          <section className="mb-12">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Beliebteste Fahrrad-Städte</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900">
                  Top Fahrrad-Metropolen in Deutschland
                </h2>
              </div>
              <span className="text-xs text-slate-500 hidden sm:block">
                Klicke auf eine Stadt für den vollständigen Ratgeber
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredMetropolises.map((city) => (
                <div
                  key={`${city.code}-${city.name}`}
                  onClick={() => onSelectCity(city)}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                        PLZ {city.code}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">{city.state}</span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors mb-1">
                      {city.name}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                      Fahrrad-Fachhändler, sofort verfügbare E-Bikes, JobRad-Leasing und lokale Radtouren in {city.name}.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-900">
                    <span>Stadt-Ratgeber öffnen</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Complete City Directory Grid */}
        <section className="mb-14">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Verzeichnis aller Städte & Orte</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                {selectedState === 'ALL'
                  ? 'Alle Städte und Orte in Deutschland'
                  : `Städte und Regionen in ${selectedState}`}
              </h2>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full">
              {filteredCities.length} {filteredCities.length === 1 ? 'Ort' : 'Orte'}
            </span>
          </div>

          {filteredCities.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredCities.map((city) => (
                <button
                  key={`${city.code}-${city.name}`}
                  onClick={() => onSelectCity(city)}
                  className="bg-white hover:bg-emerald-50/70 p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 text-left transition-all shadow-2xs group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">{city.code}</span>
                    <span className="font-bold text-xs text-slate-800 group-hover:text-emerald-800 block truncate">
                      {city.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 truncate block mt-1.5 font-medium">
                    {city.state}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl text-center border border-slate-200">
              <p className="text-sm text-slate-600 font-medium">
                Keine Stadt für Suchbegriff „{searchQuery}“ gefunden.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedState('ALL');
                }}
                className="mt-3 text-xs text-emerald-700 font-bold hover:underline"
              >
                Filter zurücksetzen
              </button>
            </div>
          )}
        </section>

        {/* Why Buy Locally / SEO Information Card */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/90 mb-12">
          <div className="max-w-3xl mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Vorteile des lokalen Fahrradkaufs</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              Warum der Kauf über verifizierte Fachhändler vor Ort die beste Wahl ist
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              VeloFind verbindet das Beste aus zwei Welten: Transparente Online-Suche nach echten Händlerbeständen in deiner Stadt kombiniert mit erstklassigem Service vor Ort.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-xs mb-3">
                1
              </div>
              <h3 className="font-bold text-sm text-slate-900">Probefahrt & Ergonomie-Check</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kein Blindkauf im Karton: Teste Rahmenhöhe, Sitzposition und Fahrgefühl direkt bei deinem Fachhändler in deiner Stadt.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-xs mb-3">
                2
              </div>
              <h3 className="font-bold text-sm text-slate-900">Fahrfertige Endmontage & Sicherheit</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Jedes Rad wird von geschulten Zweiradmechanikern vor Ort montiert, eingestellt und mit Übergabeprotokoll fahrbereit ausgehändigt.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-xs mb-3">
                3
              </div>
              <h3 className="font-bold text-sm text-slate-900">Dienstrad-Leasing & Meisterwerkstatt</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Persönliche Betreuung für JobRad, BusinessBike & Co. inklusive jährlicher Inspektionen und Garantieabwicklung direkt vor deiner Haustür.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
