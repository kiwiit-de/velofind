import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Navigation,
  Search,
  ExternalLink,
  Bike,
  Sparkles,
  Layers,
  X
} from 'lucide-react';
import { Dealer } from '../types';
import { NearbyDealersMap } from './NearbyDealersMap';
import { resolveLocation, calculateDistanceKm } from '../utils/geo';

interface DealersDirectoryViewProps {
  dealers: Dealer[];
  postalCode: string;
  setPostalCode: (plz: string) => void;
  radiusKm: number;
  setRadiusKm: (radius: number) => void;
  onFilterByDealer: (dealerName: string) => void;
  onOpenPartnerModal?: (dealer: Dealer) => void;
  onApplyDealerSlugFilter?: (dealerSlug: string) => void;
}

export const DealersDirectoryView: React.FC<DealersDirectoryViewProps> = ({
  dealers,
  postalCode,
  setPostalCode,
  radiusKm,
  setRadiusKm,
  onFilterByDealer,
  onOpenPartnerModal,
  onApplyDealerSlugFilter
}) => {
  const [partnerSearch, setPartnerSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'distance' | 'offers' | 'name'>('distance');

  const centerLocation = useMemo(() => {
    if (!postalCode) return null;
    return resolveLocation(postalCode, dealers);
  }, [postalCode, dealers]);

  // Extract all distinct leasing providers represented in dealers
  const distinctProviders = useMemo(() => {
    const set = new Set<string>();
    dealers.forEach((d) => {
      d.supported_providers?.forEach((p) => {
        set.add(p.provider_name);
      });
    });
    return Array.from(set).sort();
  }, [dealers]);

  // Filtered and sorted dealers
  const displayedDealers = useMemo(() => {
    let list = dealers.map((d) => {
      const loc = d.locations?.[0];
      const dist =
        centerLocation && loc?.latitude && loc?.longitude
          ? calculateDistanceKm(centerLocation.lat, centerLocation.lng, loc.latitude, loc.longitude)
          : undefined;
      return { ...d, distanceKm: dist };
    });

    if (partnerSearch.trim()) {
      const q = partnerSearch.toLowerCase().trim();
      list = list.filter((d) => {
        const loc = d.locations?.[0];
        const matchName = d.name.toLowerCase().includes(q);
        const matchCity = loc?.city.toLowerCase().includes(q) || false;
        const matchPlz = loc?.postal_code.includes(q) || false;
        const matchAddress = loc?.address_line1.toLowerCase().includes(q) || false;
        return matchName || matchCity || matchPlz || matchAddress;
      });
    }

    if (providerFilter !== 'ALL') {
      list = list.filter((d) =>
        d.supported_providers?.some((p) => p.provider_name === providerFilter)
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'distance' && centerLocation) {
        return (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999);
      }
      if (sortBy === 'offers') {
        return (b.offers_count ?? 0) - (a.offers_count ?? 0);
      }
      return a.name.localeCompare(b.name, 'de-DE');
    });

    return list;
  }, [dealers, centerLocation, partnerSearch, providerFilter, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Offizielles Händler- & Partnernetzwerk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Fahrrad-Partnerhändler in Deutschland
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
            VeloFind verbindet Sie direkt mit <strong>{dealers.length} verifizierten Fachhändlern</strong> und deren echten Warenbeständen. Alle Fahrräder und E-Bikes sind sofort vor Ort verfügbar oder für Sie reservierbar inklusive Probefahrt und Dienstrad-Leasing.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs shrink-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">{dealers.length} Fachhändler</div>
            <div className="text-xs text-slate-500">100% Stationär & Autorisiert</div>
          </div>
        </div>
      </div>

      {/* Interactive Visualization Map */}
      <NearbyDealersMap
        postalCode={postalCode}
        setPostalCode={setPostalCode}
        radiusKm={radiusKm}
        setRadiusKm={setRadiusKm}
        dealers={dealers}
        onFilterByDealer={(dealerName) => {
          onFilterByDealer(dealerName);
        }}
        showHeader={true}
      />

      {/* Partner Search & Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search bar */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="search-partner-directory"
              type="text"
              value={partnerSearch}
              onChange={(e) => setPartnerSearch(e.target.value)}
              placeholder="Partner suchen nach Name, Stadt oder PLZ (z.B. Radhaus, 80331, Berlin)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 placeholder:text-slate-400 shadow-2xs"
            />
            {partnerSearch && (
              <button
                onClick={() => setPartnerSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Provider Filter */}
          <div className="md:col-span-3">
            <select
              id="filter-partner-provider"
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            >
              <option value="ALL">Alle Leasinganbieter</option>
              {distinctProviders.map((prov) => (
                <option key={prov} value={prov}>
                  ✓ {prov}
                </option>
              ))}
            </select>
          </div>

          {/* Sorting */}
          <div className="md:col-span-3">
            <select
              id="sort-partner-directory"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            >
              {centerLocation && <option value="distance">Nach Entfernung (Nächste zuerst)</option>}
              <option value="offers">Meiste Angebote zuerst</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <span>
            Zeige <strong>{displayedDealers.length}</strong> von {dealers.length} Partner-Händlern
            {partnerSearch ? ` für "${partnerSearch}"` : ''}
            {providerFilter !== 'ALL' ? ` mit ${providerFilter}` : ''}
          </span>

          {(partnerSearch || providerFilter !== 'ALL') && (
            <button
              onClick={() => {
                setPartnerSearch('');
                setProviderFilter('ALL');
              }}
              className="text-xs text-emerald-700 hover:underline font-semibold flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Händler-Filter zurücksetzen</span>
            </button>
          )}
        </div>
      </div>

      {/* Dealers Cards Grid */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedDealers.map((dealer: any) => {
            const loc = dealer.locations?.[0];
            const offersCount = dealer.offers_count;

            return (
              <div
                key={dealer.id}
                id={`directory-dealer-${dealer.id}`}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Header with verified badge, offers count & distance */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {dealer.name}
                        </h3>
                        <span className="p-1 text-emerald-600 bg-emerald-50 rounded-full" title="Verifizierter VeloFind Partner-Fachhändler">
                          <CheckCircle2 className="w-4 h-4" />
                        </span>
                      </div>
                      {loc && (
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{loc.address_line1}, {loc.postal_code} {loc.city}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {offersCount !== undefined && offersCount > 0 && (
                        <span className="px-2.5 py-1 text-xs font-bold bg-slate-900 text-white rounded-xl shadow-2xs flex items-center gap-1">
                          <Bike className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{offersCount} {offersCount === 1 ? 'Angebot' : 'Angebote'}</span>
                        </span>
                      )}
                      {dealer.distanceKm !== undefined && dealer.distanceKm < 9000 && (
                        <span className="px-2 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
                          {dealer.distanceKm} km
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Opening Hours & Contact */}
                  {loc && (
                    <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 space-y-1.5 mb-4">
                      {loc.opening_hours && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{loc.opening_hours}</span>
                        </div>
                      )}
                      {loc.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <a href={`tel:${loc.phone}`} className="hover:text-emerald-700 underline">
                            {loc.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Supported Leasing Providers */}
                  {dealer.supported_providers && dealer.supported_providers.length > 0 && (
                    <div className="mb-4">
                      <span className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Autorisierte Leasingpartner vor Ort:</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {dealer.supported_providers.map((sp: any) => (
                          <span
                            key={sp.provider_slug}
                            className="px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-md"
                            title={sp.contract_reference || 'Autorisierter Händlervertrag'}
                          >
                            ✓ {sp.provider_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions Bar */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {loc && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                          `${dealer.name}, ${loc.address_line1}, ${loc.postal_code} ${loc.city}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                        title="Route zu diesem Händler planen"
                      >
                        <Navigation className="w-4 h-4" />
                      </a>
                    )}
                    {dealer.website_url && (
                      <a
                        href={dealer.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                        title="Website des Händlers aufrufen"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    {onOpenPartnerModal && (
                      <button
                        id={`btn-open-partner-modal-${dealer.id}`}
                        onClick={() => onOpenPartnerModal(dealer)}
                        className="px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Bike className="w-3.5 h-3.5" />
                        <span>Alle Angebote ansehen</span>
                      </button>
                    )}
                    <button
                      id={`btn-dealer-bikes-${dealer.id}`}
                      onClick={() => {
                        if (onApplyDealerSlugFilter) {
                          onApplyDealerSlugFilter(dealer.slug);
                        } else {
                          onFilterByDealer(dealer.name);
                        }
                      }}
                      className="px-3 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl flex items-center gap-1 transition-colors"
                      title="Im Hauptkatalog filtern"
                    >
                      <span>Im Katalog</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {displayedDealers.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 max-w-md mx-auto">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Kein Fachhändler gefunden</h3>
            <p className="text-xs text-slate-500 mt-1">
              Es gibt keine Händler, die Ihren aktuellen Such- und Filterkriterien entsprechen.
            </p>
            <button
              onClick={() => {
                setPartnerSearch('');
                setProviderFilter('ALL');
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl"
            >
              Filter zurücksetzen
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
