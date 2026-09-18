import React, { useMemo } from 'react';
import { Building2, MapPin, Phone, Clock, ShieldCheck, ArrowRight, CheckCircle2, Navigation } from 'lucide-react';
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
}

export const DealersDirectoryView: React.FC<DealersDirectoryViewProps> = ({
  dealers,
  postalCode,
  setPostalCode,
  radiusKm,
  setRadiusKm,
  onFilterByDealer
}) => {
  const centerLocation = useMemo(() => {
    if (!postalCode) return null;
    return resolveLocation(postalCode, dealers);
  }, [postalCode, dealers]);

  // Sort dealers by distance if postalCode is active
  const sortedDealers = useMemo(() => {
    if (!centerLocation) return dealers;

    return [...dealers].map((d) => {
      const loc = d.locations?.[0];
      const dist = loc?.latitude && loc?.longitude
        ? calculateDistanceKm(centerLocation.lat, centerLocation.lng, loc.latitude, loc.longitude)
        : 9999;
      return { ...d, distanceKm: dist };
    }).sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
  }, [dealers, centerLocation]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Autorisierte Partner-Fachhändler in Deutschland
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
          VeloFind kooperiert ausschließlich mit qualifizierten stationären Fahrrad-Fachhändlern. Alle Bestände stammen aus echten Händler-Warenwirtschaftssystemen.
        </p>
      </div>

      {/* Interactive Visualization Map */}
      <NearbyDealersMap
        postalCode={postalCode}
        setPostalCode={setPostalCode}
        radiusKm={radiusKm}
        setRadiusKm={setRadiusKm}
        dealers={dealers}
        onFilterByDealer={onFilterByDealer}
        showHeader={true}
      />

      {/* Dealers Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {postalCode
              ? `Händlerverzeichnis (nach Entfernung zu ${postalCode})`
              : `Alle ${dealers.length} verifizierten Fachhändler`}
          </h2>
          {postalCode && (
            <span className="text-xs text-slate-500">
              Nächste Händler zuerst gelistet
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedDealers.map((dealer: any) => {
            const loc = dealer.locations?.[0];

            return (
              <div
                key={dealer.id}
                id={`directory-dealer-${dealer.id}`}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Header with verified badge & distance */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-slate-900">{dealer.name}</h3>
                        <span className="p-1 text-emerald-600 bg-emerald-50 rounded-full" title="Verifizierter Fachhändler">
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

                    {dealer.distanceKm !== undefined && dealer.distanceKm < 9000 && (
                      <span className="px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 shrink-0">
                        {dealer.distanceKm} km
                      </span>
                    )}
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
                        <span>Verifizierte Leasing-Partner:</span>
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

                {/* Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-500">Warenbestand synchronisiert</span>
                  <div className="flex items-center gap-2">
                    {loc && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                          `${dealer.name}, ${loc.address_line1}, ${loc.postal_code} ${loc.city}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                        title="Route planen"
                      >
                        <Navigation className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      id={`btn-dealer-bikes-${dealer.id}`}
                      onClick={() => onFilterByDealer(dealer.name)}
                      className="px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <span>Angebote dieses Händlers</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
