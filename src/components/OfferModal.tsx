import React from 'react';
import { X, ExternalLink, MessageSquare, MapPin, ShieldCheck, BatteryCharging, Gauge, Scale, Bike, Clock, Phone, Mail, AlertCircle } from 'lucide-react';
import { Offer } from '../types';

interface OfferModalProps {
  offer: Offer | null;
  onClose: () => void;
  onOpenLeadModal: (offer: Offer) => void;
  onTrackOutbound: (offerId: string) => void;
}

export const OfferModal: React.FC<OfferModalProps> = ({
  offer,
  onClose,
  onOpenLeadModal,
  onTrackOutbound
}) => {
  if (!offer) return null;

  const formattedPrice = (offer.price_cents / 100).toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR'
  });

  const formattedComparePrice = offer.compare_at_price_cents
    ? (offer.compare_at_price_cents / 100).toLocaleString('de-DE', {
        style: 'currency',
        currency: 'EUR'
      })
    : null;

  const location = offer.dealer_locations[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div
        id="offer-detail-modal"
        className="relative bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          id="btn-close-offer-modal"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 text-slate-500 hover:text-slate-800 hover:bg-white shadow-sm transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Body */}
        <div className="max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Header & Badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 text-xs font-bold bg-slate-900 text-white rounded-md">
                {offer.brand_name}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-md">
                Modelljahr {offer.model_year}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-md">
                {offer.category}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                ● Sofort abholbereit
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{offer.title}</h2>
          </div>

          {/* Hero Image & Price Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
            <div className="aspect-4/3 rounded-xl overflow-hidden bg-white shadow-xs">
              <img
                src={offer.image_url || 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=80'}
                alt={offer.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col justify-between h-full space-y-4">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Aktueller Händlerpreis</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-slate-900">{formattedPrice}</span>
                  {formattedComparePrice && (
                    <span className="text-sm text-slate-400 line-through">{formattedComparePrice}</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">inkl. MwSt., Bereitstellung & Übergabeinspektion</p>
              </div>

              {/* Conversion CTAs */}
              <div className="space-y-2">
                <button
                  id="modal-btn-outbound"
                  onClick={() => onTrackOutbound(offer.id)}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <span>Angebot beim Fachhändler ansehen</span>
                  <ExternalLink className="w-4 h-4" />
                </button>

                <button
                  id="modal-btn-lead"
                  onClick={() => onOpenLeadModal(offer)}
                  className="w-full py-3 px-4 rounded-xl border border-slate-300 hover:bg-white bg-slate-100 text-slate-800 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Probefahrt / Händler-Anfrage stellen</span>
                </button>
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Bike className="w-4 h-4 text-emerald-600" />
              <span>Technische Spezifikationen & Ausstattung</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {offer.variant_details?.frame_size && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-xs text-slate-500 block">Rahmengröße</span>
                  <span className="text-sm font-semibold text-slate-900">{offer.variant_details.frame_size}</span>
                </div>
              )}
              {offer.variant_details?.frame_type && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-xs text-slate-500 block">Rahmenform</span>
                  <span className="text-sm font-semibold text-slate-900">{offer.variant_details.frame_type}</span>
                </div>
              )}
              {offer.variant_details?.color && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-xs text-slate-500 block">Farbe</span>
                  <span className="text-sm font-semibold text-slate-900">{offer.variant_details.color}</span>
                </div>
              )}
              {offer.variant_details?.motor_brand && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-xs text-slate-500 block">Motor & Antrieb</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {offer.variant_details.motor_brand} {offer.variant_details.motor_model || ''}
                  </span>
                </div>
              )}
              {offer.variant_details?.torque_nm && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-xs text-slate-500 block">Drehmoment</span>
                  <span className="text-sm font-semibold text-slate-900">{offer.variant_details.torque_nm} Nm</span>
                </div>
              )}
              {offer.variant_details?.battery_wh && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-xs text-slate-500 block">Akkukapazität</span>
                  <span className="text-sm font-semibold text-slate-900">{offer.variant_details.battery_wh} Wh</span>
                </div>
              )}
              {offer.variant_details?.weight_kg && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-xs text-slate-500 block">Gewicht</span>
                  <span className="text-sm font-semibold text-slate-900">{offer.variant_details.weight_kg} kg</span>
                </div>
              )}
              {offer.variant_details?.wheel_size_in && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-xs text-slate-500 block">Laufradgröße</span>
                  <span className="text-sm font-semibold text-slate-900">{offer.variant_details.wheel_size_in} Zoll</span>
                </div>
              )}
              {offer.variant_details?.gtin && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-xs text-slate-500 block">GTIN / EAN</span>
                  <span className="text-sm font-mono text-slate-900">{offer.variant_details.gtin}</span>
                </div>
              )}
            </div>
          </div>

          {/* Evidence-Based Leasing Compatibility */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5">
            <h3 className="text-base font-bold text-emerald-950 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <span>Dienstrad-Leasing Kompatibilität (Evidenzbasiert)</span>
            </h3>
            <p className="text-xs text-emerald-800 mb-3">
              Folgende Leasinganbieter sind für dieses Rad über die Händleranbindung verifiziert:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              {offer.leasing_compatibilities.map(lc => (
                <div key={lc.provider_slug} className="bg-white p-3 rounded-xl border border-emerald-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 text-sm">{lc.provider_name}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">
                      {lc.status}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 mt-1">{lc.evidence_reason}</span>
                </div>
              ))}
            </div>

            {/* Mandatory Legal Disclaimer */}
            <div className="text-[11px] text-emerald-900/80 bg-white/70 p-3 rounded-xl border border-emerald-100 leading-relaxed flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong>Rechtlicher Hinweis:</strong> Der teilnehmende Fachhändler bleibt Ihr alleiniger Vertragspartner für Kauf und Service. Das Dienstrad-Leasingangebot steht unter dem Vorbehalt der individuellen Genehmigung durch Ihren Arbeitgeber und den gewählten Leasinganbieter.
              </div>
            </div>
          </div>

          {/* Physical Dealer Information Card */}
          {location && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Anbieter & Fachhändler vor Ort</span>
              </h3>
              <div className="space-y-1.5 text-sm text-slate-700">
                <div className="font-semibold text-slate-900 text-base">{offer.dealer_name}</div>
                <div>{location.name} • {location.address_line1}, {location.postal_code} {location.city}</div>
                {location.opening_hours && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Öffnungszeiten: {location.opening_hours}</span>
                  </div>
                )}
                {location.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Telefon: {location.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
