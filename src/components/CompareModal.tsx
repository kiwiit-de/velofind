import React, { useState, useEffect } from 'react';
import {
  X,
  Scale,
  ExternalLink,
  MessageSquare,
  Zap,
  BatteryCharging,
  Gauge,
  MapPin,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Bike,
  Plus,
  Trash2,
  TrendingDown,
  Info
} from 'lucide-react';
import { Offer } from '../types';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  compareOffers: Offer[];
  onRemoveOffer: (offerId: string) => void;
  onClearAll: () => void;
  onOpenLeadModal: (offer: Offer) => void;
  onTrackOutbound: (offerId: string) => void;
  onAddMoreBikes?: () => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  compareOffers,
  onRemoveOffer,
  onClearAll,
  onOpenLeadModal,
  onTrackOutbound,
  onAddMoreBikes
}) => {
  const [onlyDifferences, setOnlyDifferences] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Best-in-spec metrics helpers
  const minPriceCents = Math.min(...compareOffers.map((o) => o.price_cents));
  const maxBatteryWh = Math.max(
    ...compareOffers.map((o) => o.variant_details?.battery_wh || 0)
  );
  const maxTorqueNm = Math.max(
    ...compareOffers.map((o) => o.variant_details?.torque_nm || 0)
  );
  const weights = compareOffers
    .map((o) => o.variant_details?.weight_kg)
    .filter((w): w is number => typeof w === 'number' && w > 0);
  const minWeightKg = weights.length > 0 ? Math.min(...weights) : null;

  // Format price helper
  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    });
  };

  // Estimate monthly gross leasing rate with salary sacrifice (approx 2.4 - 2.8% of list price)
  const calcLeasingEstimate = (cents: number) => {
    const grossPrice = cents / 100;
    const monthlyRate = Math.round(grossPrice * 0.024);
    return `ab ${monthlyRate} € / Mo.*`;
  };

  // Check if a spec row differs across compared offers
  const isDifferent = (getter: (offer: Offer) => any) => {
    if (compareOffers.length <= 1) return false;
    const firstVal = JSON.stringify(getter(compareOffers[0]));
    return compareOffers.some((o) => JSON.stringify(getter(o)) !== firstVal);
  };

  const emptySlotsCount = Math.max(0, 3 - compareOffers.length);

  return (
    <div
      id="compare-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="compare-modal-container"
        className="relative bg-white rounded-3xl max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200"
      >
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">Fahrrad-Vergleich</h2>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                  {compareOffers.length} von max. 3 Rädern
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Direkter Spezifikations- und Preisvergleich beim lizenzierten Fachhändler
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {compareOffers.length > 1 && (
              <label className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  id="toggle-only-differences"
                  checked={onlyDifferences}
                  onChange={(e) => setOnlyDifferences(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Nur Unterschiede hervorheben</span>
              </label>
            )}

            {compareOffers.length > 0 && (
              <button
                id="btn-clear-compare-all"
                type="button"
                onClick={onClearAll}
                className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5"
                title="Alle Räder aus dem Vergleich entfernen"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Alle leeren</span>
              </button>
            )}

            <button
              id="btn-close-compare-modal"
              onClick={onClose}
              className="p-2 rounded-full bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors shadow-2xs"
              title="Schließen (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-6">
          {compareOffers.length === 0 ? (
            <div className="py-16 text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Scale className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Keine Fahrräder im Vergleich</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Wähle in der Angebotsliste bis zu 3 Fahrräder über den Button &quot;Vergleichen&quot; aus,
                um Motor, Akku, Geometrie und Händlerpreise gegenüberzustellen.
              </p>
              <button
                id="btn-empty-compare-explore"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors"
              >
                Fahrräder durchsuchen
              </button>
            </div>
          ) : (
            <div className="min-w-[680px]">
              {/* Top Bike Cards Header Grid */}
              <div className="grid grid-cols-3 gap-4 pb-6 border-b border-slate-200">
                {compareOffers.map((offer) => {
                  const isBestPrice = offer.price_cents === minPriceCents && compareOffers.length > 1;
                  const discountCents =
                    offer.compare_at_price_cents && offer.compare_at_price_cents > offer.price_cents
                      ? offer.compare_at_price_cents - offer.price_cents
                      : 0;

                  return (
                    <div
                      key={offer.id}
                      className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between relative group hover:border-slate-300 transition-colors"
                    >
                      {/* Remove Button */}
                      <button
                        id={`btn-remove-compare-${offer.id}`}
                        onClick={() => onRemoveOffer(offer.id)}
                        className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full bg-white/90 text-slate-400 hover:text-rose-600 hover:bg-white shadow-2xs transition-colors"
                        title="Aus Vergleich entfernen"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div>
                        {/* Image */}
                        <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-white mb-3 shadow-2xs border border-slate-100">
                          <img
                            src={
                              offer.image_url ||
                              'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=600&q=80'
                            }
                            alt={offer.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=600&q=80';
                            }}
                          />
                          {isBestPrice && (
                            <div className="absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-600 text-white shadow-xs flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> Günstigster Preis
                            </div>
                          )}
                        </div>

                        {/* Title & Brand */}
                        <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
                          {offer.brand_name} • {offer.model_year}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug mb-2" title={offer.title}>
                          {offer.title}
                        </h4>

                        {/* Price Display */}
                        <div className="mb-3">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black text-slate-900">
                              {formatPrice(offer.price_cents)}
                            </span>
                            {offer.compare_at_price_cents && offer.compare_at_price_cents > offer.price_cents && (
                              <span className="text-xs text-slate-400 line-through">
                                {formatPrice(offer.compare_at_price_cents)}
                              </span>
                            )}
                          </div>
                          {discountCents > 0 && (
                            <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                              <TrendingDown className="w-3.5 h-3.5" />
                              <span>Du sparst {formatPrice(discountCents)}</span>
                            </div>
                          )}
                          <div className="text-[11px] text-slate-500 mt-1">
                            Leasing: <strong>{calcLeasingEstimate(offer.price_cents)}</strong>
                          </div>
                        </div>
                      </div>

                      {/* CTA Actions */}
                      <div className="space-y-2 pt-2 border-t border-slate-200/60">
                        <button
                          id={`btn-compare-lead-${offer.id}`}
                          onClick={() => onOpenLeadModal(offer)}
                          className="w-full py-2 px-3 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Probefahrt anfragen</span>
                        </button>
                        <button
                          id={`btn-compare-outbound-${offer.id}`}
                          onClick={() => onTrackOutbound(offer.id)}
                          className="w-full py-1.5 px-3 text-xs font-medium rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <span>Zum Fachhändler</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Empty Slots to reach 3 bikes */}
                {Array.from({ length: emptySlotsCount }).map((_, idx) => (
                  <div
                    key={`empty-slot-${idx}`}
                    className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-slate-50/40 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                      <Plus className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-bold text-slate-700 mb-1">
                      Freier Vergleichsplatz
                    </div>
                    <p className="text-xs text-slate-500 mb-4 max-w-[200px]">
                      Füge ein weiteres Fahrrad aus dem Katalog hinzu, um bis zu 3 Räder direkt zu vergleichen.
                    </p>
                    <button
                      id={`btn-add-bike-slot-${idx}`}
                      onClick={() => {
                        onClose();
                        if (onAddMoreBikes) onAddMoreBikes();
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      Rad auswählen
                    </button>
                  </div>
                ))}
              </div>

              {/* Specification Comparison Sections */}
              <div className="divide-y divide-slate-200 text-xs">
                {/* 1. Preise & Finanzierung */}
                <div className="py-4">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3 text-emerald-800 flex items-center gap-1.5">
                    <span>Preise & Ersparnis</span>
                  </h4>

                  <SpecRow
                    label="Barpreis (inkl. MwSt.)"
                    onlyDifferences={onlyDifferences}
                    isDiff={isDifferent((o) => o.price_cents)}
                  >
                    {compareOffers.map((o) => (
                      <div key={o.id} className="font-bold text-slate-900 text-sm">
                        {formatPrice(o.price_cents)}
                        {o.price_cents === minPriceCents && compareOffers.length > 1 && (
                          <span className="ml-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            Bester Preis
                          </span>
                        )}
                      </div>
                    ))}
                    {emptySlotsCount > 0 && <EmptySpecSlots count={emptySlotsCount} />}
                  </SpecRow>

                  <SpecRow
                    label="UVP / Referenzpreis"
                    onlyDifferences={onlyDifferences}
                    isDiff={isDifferent((o) => o.compare_at_price_cents)}
                  >
                    {compareOffers.map((o) => (
                      <div key={o.id} className="text-slate-600">
                        {o.compare_at_price_cents
                          ? formatPrice(o.compare_at_price_cents)
                          : 'Keine Angabe'}
                      </div>
                    ))}
                    {emptySlotsCount > 0 && <EmptySpecSlots count={emptySlotsCount} />}
                  </SpecRow>

                  <SpecRow
                    label="Geschätzte Leasingrate"
                    onlyDifferences={onlyDifferences}
                    isDiff={isDifferent((o) => Math.round((o.price_cents / 100) * 0.024))}
                  >
                    {compareOffers.map((o) => (
                      <div key={o.id} className="text-slate-800 font-semibold">
                        {calcLeasingEstimate(o.price_cents)}
                      </div>
                    ))}
                    {emptySlotsCount > 0 && <EmptySpecSlots count={emptySlotsCount} />}
                  </SpecRow>
                </div>

                {/* 2. E-Bike Antrieb & Akku */}
                <div className="py-4">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3 text-emerald-800 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Antrieb & Motorisierung</span>
                  </h4>

                  <SpecRow
                    label="Antriebsart"
                    onlyDifferences={onlyDifferences}
                    isDiff={isDifferent((o) => o.propulsion)}
                  >
                    {compareOffers.map((o) => (
                      <div key={o.id} className="flex items-center gap-1 font-medium">
                        {o.propulsion === 'PEDELEC' ? (
                          <span className="text-emerald-700 flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                            E-Bike (25 km/h)
                          </span>
                        ) : (
                          <span className="text-slate-700">Bio-Bike (Muskelkraft)</span>
                        )}
                      </div>
                    ))}
                    {emptySlotsCount > 0 && <EmptySpecSlots count={emptySlotsCount} />}
                  </SpecRow>

                  <SpecRow
                    label="Motor-Hersteller"
                    onlyDifferences={onlyDifferences}
                    isDiff={isDifferent((o) => o.variant_details?.motor_brand || 'Keiner')}
                  >
                    {compareOffers.map((o) => (
                      <div key={o.id} className="text-slate-800 font-medium">
                        {o.variant_details?.motor_brand || 'Ohne Motor'}
                      </div>
                    ))}
                    {emptySlotsCount > 0 && <EmptySpecSlots count={emptySlotsCount} />}
                  </SpecRow>

                  <SpecRow
                    label="Motor-Modell"
                    onlyDifferences={onlyDifferences}
                    isDiff={isDifferent((o) => o.variant_details?.motor_model || '-')}
                  >
                    {compareOffers.map((o) => (
                      <div key={o.id} className="text-slate-800">
                        {o.variant_details?.motor_model || '-'}
                      </div>
                    ))}
                    {emptySlotsCount > 0 && <EmptySpecSlots count={emptySlotsCount} />}
                  </SpecRow>

                  <SpecRow
                    label="Drehmoment (Nm)"
                    onlyDifferences={onlyDifferences}
                    isDiff={isDifferent((o) => o.variant_details?.torque_nm)}
                  >
                    {compareOffers.map((o) => {
                      const torque = o.variant_details?.torque_nm;
                      const isMaxTorque = torque === maxTorqueNm && maxTorqueNm > 0 && compareOffers.length > 1;
                      return (
                        <div key={o.id} className="flex items-center gap-2">
                          <span className={`font-bold ${isMaxTorque ? 'text-emerald-700' : 'text-slate-800'}`}>
                            {torque ? `${torque} Nm` : '-'}
                          </span>
                          {isMaxTorque && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              Stärkster Motor
                            </span>
                          )}
                        </div>
                      );
                    })}
                    {emptySlotsCount > 0 && <EmptySpecSlots count={emptySlotsCount} />}
                  </SpecRow>

                  <SpecRow
                    label="Akkukapazität (Wh)"
                    onlyDifferences={onlyDifferences}
                    isDiff={isDifferent((o) => o.variant_details?.battery_wh)}
                  >
                    {compareOffers.map((o) => {
                      const wh = o.variant_details?.battery_wh;
                      const isMaxWh = wh === maxBatteryWh && maxBatteryWh > 0 && compareOffers.length > 1;
                      return (
                        <div key={o.id} className="flex items-center gap-2">
                          <span className={`font-bold ${isMaxWh ? 'text-emerald-700' : 'text-slate-800'}`}>
                            {wh ? `${wh} Wh` : '-'}
                          </span>
                          {isMaxWh && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              Größter Akku
                            </span>
                          )}
                        </div>
                      );
                    })}
                    {emptySlotsCount > 0 && <EmptySpecSlots count={emptySlotsCount} />}
                  </SpecRow>
                </div>

                {/* 3. Rahmen & Geometrie */}
                <div className="py-4">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3 text-emerald-800 flex items-center gap-1.5">
                    <Bike className="w-3.5 h-3.5" />
                    <span>Rahmen, Maße & Gewicht</span>
                  </h4>

                  <SpecRow
                    label="Fahrrad-Kategorie"
                    onlyDifferences={onlyDifferences}
                    isDiff={isDifferent((o) => o.category)}
                  >
                    {compareOffers.map((o) => (
                      <div key={o.id} className="font-semibold text-slate-800">
                        {o.category}
                      </div>
                    ))}
                    {emptySlotsCount > 0 && <EmptySpecSlots count={emptySlotsCount} />}
                  </SpecRow>

                  <SpecRow
                    label="Rahmengröße"
                    onlyDifferences={onlyDifferences}
                    isDiff={isDifferent((o) => o.variant_details?.frame_size)}
                  >
                    {compareOffers.map((o) => (
                      <div key={o.id} className="text-slate-800 font-medium">
                        {o.variant_details?.frame_size || 'Universal'}
                      </div>
                    ))}
                    {emptySlotsCount > 0 && <EmptySpecSlots count={emptySlotsCount} />}
                  </SpecRow>

                  <SpecRow
                    label="Rahmenform"
                    onlyDifferences={onlyDifferences}
                    isDiff={isDifferent((o) => o.variant_details?.frame_type)}
                  >
                    {compareOffers.map((o) => (
                      <div key={o.id} className="text-slate-700">
                        {o.variant_details?.frame_type === 'DIAMOND'
                          ? 'Diamant (Herren)'
                          : o.variant_details?.frame_type === 'STEP_THROUGH'
                          ? 'Tiefeinsteiger (Wave)'
                          : o.variant_details?.frame_type === 'TRAPEZE'
                          ? 'Trapez (Damen)'
                          : o.variant_details?.frame_type || 'Klassisch'}
                      </div>
                    ))}
                    {emptySlotsCount > 0 && <EmptySpecSlots count={emptySlotsCount} />}
                  </SpecRow>

                  <SpecRow
                    label="Laufradgröße"
                    onlyDifferences={onlyDifferences}
                    isDiff={isDifferent((o) => o.variant_details?.wheel_size_in)}
                  >
                    {compareOffers.map((o) => (
                      <div key={o.id} className="text-slate-700">
                        {o.variant_details?.wheel_size_in
                          ? `${o.variant_details.wheel_size_in} Zoll`
                          : 'Standard'}
                      </div>
                    ))}
                    {emptySlotsCount > 0 && <EmptySpecSlots count={emptySlotsCount} />}
                  </SpecRow>

                  <SpecRow
                    label="Farbe"
                    onlyDifferences={onlyDifferences}
                    isDiff={isDifferent((o) => o.variant_details?.color)}
                  >
                    {compareOffers.map((o) => (
                      <div key={o.id} className="text-slate-700">
                        {o.variant_details?.color || 'Herstellerfarbe'}
                      </div>
                    ))}
                    {emptySlotsCount > 0 && <EmptySpecSlots count={emptySlotsCount} />}
                  </SpecRow>

                  <SpecRow
                    label="Gewicht"
                    onlyDifferences={onlyDifferences}
                    isDiff={isDifferent((o) => o.variant_details?.weight_kg)}
                  >
                    {compareOffers.map((o) => {
                      const kg = o.variant_details?.weight_kg;
                      const isMinKg = minWeightKg !== null && kg === minWeightKg && compareOffers.length > 1;
                      return (
                        <div key={o.id} className="flex items-center gap-2">
                          <span className={`font-semibold ${isMinKg ? 'text-emerald-700' : 'text-slate-800'}`}>
                            {kg ? `${kg} kg` : 'k. A.'}
                          </span>
                          {isMinKg && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              Leichtestes Rad
                            </span>
                          )}
                        </div>
                      );
                    })}
                    {emptySlotsCount > 0 && <EmptySpecSlots count={emptySlotsCount} />}
                  </SpecRow>
                </div>

                {/* 4. Fachhändler & Leasing */}
                <div className="py-4">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3 text-emerald-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verfügbarkeit & Fachhändler</span>
                  </h4>

                  <SpecRow
                    label="Zustand"
                    onlyDifferences={onlyDifferences}
                    isDiff={isDifferent((o) => o.condition)}
                  >
                    {compareOffers.map((o) => (
                      <div key={o.id} className="text-slate-800 font-medium">
                        {o.condition === 'NEW'
                          ? 'Fabrikneu (OVP)'
                          : o.condition === 'EX_DISPLAY'
                          ? 'Ausstellungsstück'
                          : o.condition === 'REFURBISHED'
                          ? 'Werkstattgeprüft'
                          : o.condition}
                      </div>
                    ))}
                    {emptySlotsCount > 0 && <EmptySpecSlots count={emptySlotsCount} />}
                  </SpecRow>

                  <SpecRow
                    label="Verfügbarkeit"
                    onlyDifferences={onlyDifferences}
                    isDiff={isDifferent((o) => o.availability)}
                  >
                    {compareOffers.map((o) => (
                      <div key={o.id} className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Sofort abholbereit</span>
                      </div>
                    ))}
                    {emptySlotsCount > 0 && <EmptySpecSlots count={emptySlotsCount} />}
                  </SpecRow>

                  <SpecRow
                    label="Verkaufender Händler"
                    onlyDifferences={onlyDifferences}
                    isDiff={isDifferent((o) => o.dealer_name)}
                  >
                    {compareOffers.map((o) => (
                      <div key={o.id} className="space-y-0.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1">
                          <span>{o.dealer_name}</span>
                          {o.dealer_verified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          )}
                        </div>
                        {o.dealer_locations?.[0]?.city && (
                          <div className="text-slate-500 flex items-center gap-1 text-[11px]">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{o.dealer_locations[0].city}</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {emptySlotsCount > 0 && <EmptySpecSlots count={emptySlotsCount} />}
                  </SpecRow>

                  <SpecRow
                    label="Dienstrad-Leasing Partner"
                    onlyDifferences={onlyDifferences}
                    isDiff={isDifferent((o) => o.leasing_compatibilities?.length || 0)}
                  >
                    {compareOffers.map((o) => {
                      const count = o.leasing_compatibilities?.length || 0;
                      return (
                        <div key={o.id} className="text-slate-700">
                          <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            {count > 0 ? `${count} Leasing-Anbieter` : 'Auf Anfrage'}
                          </span>
                        </div>
                      );
                    })}
                    {emptySlotsCount > 0 && <EmptySpecSlots count={emptySlotsCount} />}
                  </SpecRow>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>*Monatliche Leasingrate ist eine unverbindliche Richtkalkulation für Dienstradleasing via Gehaltsumwandlung.</span>
          </div>
          <button
            id="btn-footer-close-compare"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition-colors"
          >
            Fertig
          </button>
        </div>
      </div>
    </div>
  );
};

interface SpecRowProps {
  label: string;
  children: React.ReactNode;
  onlyDifferences?: boolean;
  isDiff?: boolean;
}

const SpecRow: React.FC<SpecRowProps> = ({
  label,
  children,
  onlyDifferences = false,
  isDiff = false
}) => {
  if (onlyDifferences && !isDiff) {
    return null;
  }

  return (
    <div
      className={`grid grid-cols-4 items-center py-2.5 px-3 rounded-lg transition-colors ${
        isDiff ? 'bg-amber-50/40 hover:bg-amber-50/60' : 'hover:bg-slate-50'
      }`}
    >
      <div className="col-span-1 text-slate-500 font-medium pr-3 flex items-center gap-1.5">
        <span>{label}</span>
        {isDiff && (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Unterschiedliche Werte" />
        )}
      </div>
      <div className="col-span-3 grid grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  );
};

const EmptySpecSlots: React.FC<{ count: number }> = ({ count }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={`empty-spec-${i}`} className="text-slate-300 italic">
          -
        </div>
      ))}
    </>
  );
};
