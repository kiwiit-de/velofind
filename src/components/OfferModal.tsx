import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  MessageSquare,
  MapPin,
  ShieldCheck,
  BatteryCharging,
  Gauge,
  Scale,
  Bike,
  Clock,
  Phone,
  Mail,
  AlertCircle,
  Heart,
  Building2,
  Bell,
  BellRing,
  CheckCircle2,
  TrendingDown
} from 'lucide-react';
import { Offer } from '../types';
import { useFavorites } from '../utils/favorites';
import { useCompare } from '../utils/compare';
import { usePriceAlert } from '../utils/alerts';
import { resolveImageUrl } from '../lib/api';

interface OfferModalProps {
  offer: Offer | null;
  onClose: () => void;
  onOpenLeadModal: (offer: Offer) => void;
  onTrackOutbound: (offerId: string) => void;
  onCompareNotice?: (msg: string) => void;
  onOpenDealer?: (dealerSlug: string) => void;
}

export const OfferModal: React.FC<OfferModalProps> = ({
  offer,
  onClose,
  onOpenLeadModal,
  onTrackOutbound,
  onCompareNotice,
  onOpenDealer
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isInCompare, toggleCompare } = useCompare();
  const [modalImg, setModalImg] = useState<string | null>(null);

  const {
    hasAlert,
    subscribersCount,
    loading: alertLoading,
    error: alertError,
    successMessage: alertSuccess,
    subscribeAlert,
    savedEmail
  } = usePriceAlert(offer?.id, offer?.price_cents);

  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertEmail, setAlertEmail] = useState('');
  const [targetDiscountPct, setTargetDiscountPct] = useState<number | 'any'>('any');

  // Prepopulate saved email if available
  React.useEffect(() => {
    if (savedEmail && !alertEmail) {
      setAlertEmail(savedEmail);
    }
  }, [savedEmail, alertEmail]);

  if (!offer) return null;

  const isFav = isFavorite(offer.id);
  const inCompare = isInCompare(offer.id);
  const currentImg = modalImg || resolveImageUrl(offer.image_url);

  const handleAlertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let targetPriceCents: number | null = null;
    if (targetDiscountPct === 5) {
      targetPriceCents = Math.round(offer.price_cents * 0.95);
    } else if (targetDiscountPct === 10) {
      targetPriceCents = Math.round(offer.price_cents * 0.9);
    }

    const success = await subscribeAlert(alertEmail, targetPriceCents);
    if (success) {
      setTimeout(() => {
        setShowAlertForm(false);
      }, 2400);
    }
  };


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
        {/* Top Action Bar (Compare, Favorite & Close) */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button
            id="modal-btn-compare"
            type="button"
            onClick={() => {
              const res = toggleCompare(offer.id);
              if (!res.success && res.error && onCompareNotice) {
                onCompareNotice(res.error);
              }
            }}
            className={`px-3 py-1.5 rounded-full transition-all duration-200 shadow-xs flex items-center gap-1.5 text-xs font-semibold ${
              inCompare
                ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-200'
                : 'bg-white/95 text-slate-700 hover:text-emerald-700 hover:bg-white border border-slate-200 backdrop-blur-xs'
            }`}
            title={inCompare ? 'Im Vergleich (Klicken zum Entfernen)' : 'Zum Vergleich hinzufügen (max. 3)'}
          >
            <Scale className={`w-3.5 h-3.5 ${inCompare ? 'text-white' : 'text-slate-500'}`} />
            <span>{inCompare ? 'Im Vergleich' : 'Vergleichen'}</span>
          </button>

          <button
            id="modal-btn-favorite"
            type="button"
            onClick={() => toggleFavorite(offer.id)}
            className={`px-3 py-1.5 rounded-full transition-all duration-200 shadow-xs flex items-center gap-1.5 text-xs font-semibold ${
              isFav
                ? 'bg-white text-rose-600 border border-rose-200 shadow-md ring-2 ring-rose-100'
                : 'bg-white/95 text-slate-600 hover:text-rose-500 hover:bg-white border border-slate-200 backdrop-blur-xs'
            }`}
            title={isFav ? 'Aus Favoriten entfernen' : 'Fahrrad merken'}
            aria-label={isFav ? 'Aus Favoriten entfernen' : 'Fahrrad merken'}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{isFav ? 'Gemerkt' : 'Merken'}</span>
          </button>

          <button
            id="modal-btn-top-alert"
            type="button"
            onClick={() => setShowAlertForm((prev) => !prev)}
            className={`px-3 py-1.5 rounded-full transition-all duration-200 shadow-xs flex items-center gap-1.5 text-xs font-semibold ${
              hasAlert
                ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-200'
                : 'bg-white/95 text-slate-700 hover:text-amber-700 hover:bg-white border border-slate-200 backdrop-blur-xs'
            }`}
            title={hasAlert ? 'Preisalarm ist aktiv (Klicken zum Bearbeiten)' : 'Alert me on price drop (Preisalarm scharfschalten)'}
            aria-label="Alert me on price drop"
          >
            <Bell className={`w-3.5 h-3.5 ${hasAlert ? 'fill-white text-white' : 'text-amber-500'}`} />
            <span>{hasAlert ? 'Alarm aktiv' : 'Preisalarm'}</span>
          </button>

          <button
            id="btn-close-offer-modal"
            onClick={onClose}
            className="p-2 rounded-full bg-white/90 text-slate-500 hover:text-slate-800 hover:bg-white shadow-xs border border-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
              {offer.quantity > 0 && (offer.quantity <= 2 || offer.availability === 'AVAILABLE_SHORT_TERM') ? (
                <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-50 text-amber-950 border border-amber-300 rounded-full flex items-center gap-1.5 shadow-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
                  </span>
                  <span>Low Stock (Nur noch {offer.quantity} Exemplar{offer.quantity === 1 ? '' : 'e'} vor Ort!)</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-950 border border-emerald-300 rounded-full flex items-center gap-1.5 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span>In Stock ({offer.quantity} Stück sofort verfügbar)</span>
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{offer.title}</h2>
          </div>

          {/* Hero Image & Price Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
            <div className="aspect-4/3 rounded-xl overflow-hidden bg-white shadow-xs">
              <img
                src={currentImg}
                alt={offer.title}
                onError={() => {
                  setModalImg(resolveImageUrl('/images/bikes/cube_stereo_hybrid.jpg'));
                }}
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

                {/* 'Alert me on price drop' CTA */}
                <div className="pt-1">
                  {!showAlertForm && !hasAlert && (
                    <button
                      id="modal-btn-price-alert"
                      type="button"
                      onClick={() => setShowAlertForm(true)}
                      className="w-full py-2.5 px-4 rounded-xl border border-amber-300/80 hover:border-amber-400 bg-amber-50/70 hover:bg-amber-100/70 text-amber-950 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all duration-150 group"
                    >
                      <Bell className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                      <span>Alert me on price drop</span>
                      {subscribersCount > 0 && (
                        <span className="ml-1 text-[11px] font-normal text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded-full">
                          {subscribersCount} {subscribersCount === 1 ? 'Beobachter' : 'Beobachter'}
                        </span>
                      )}
                    </button>
                  )}

                  {/* Active alert indicator */}
                  {hasAlert && !showAlertForm && (
                    <div
                      id="modal-price-alert-active-banner"
                      className="w-full py-2.5 px-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs flex items-center justify-between shadow-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <span className="font-semibold block">Preisalarm aktiv</span>
                          <span className="text-slate-600 text-[11px]">Wir benachrichtigen dich, sobald der Preis fällt.</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAlertForm(true)}
                        className="text-emerald-700 hover:text-emerald-900 font-medium underline text-[11px] ml-2 shrink-0"
                      >
                        Anpassen
                      </button>
                    </div>
                  )}

                  {/* Interactive subscription panel */}
                  {showAlertForm && (
                    <div
                      id="modal-price-alert-form"
                      className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300/90 shadow-sm space-y-3 animate-in fade-in zoom-in-98 duration-150"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-amber-500 text-white shadow-xs">
                            <BellRing className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                              Alert me on price drop
                            </h4>
                            <p className="text-[11px] text-slate-600">
                              Erhalte eine E-Mail, sobald der Fachhändler den Preis senkt.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowAlertForm(false)}
                          className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
                          title="Schließen"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {alertSuccess && (
                        <div className="p-2.5 rounded-xl bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{alertSuccess}</span>
                        </div>
                      )}

                      {alertError && (
                        <div className="p-2.5 rounded-xl bg-rose-100/90 border border-rose-300 text-rose-900 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>{alertError}</span>
                        </div>
                      )}

                      <form onSubmit={handleAlertSubmit} className="space-y-3">
                        <div>
                          <label htmlFor="price-alert-email" className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Deine E-Mail-Adresse *
                          </label>
                          <input
                            id="price-alert-email"
                            type="email"
                            required
                            placeholder="name@beispiel.de"
                            value={alertEmail}
                            onChange={(e) => setAlertEmail(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>

                        <div>
                          <span className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Benachrichtigungsschwelle
                          </span>
                          <div className="grid grid-cols-3 gap-1.5 text-xs">
                            <button
                              type="button"
                              onClick={() => setTargetDiscountPct('any')}
                              className={`py-1.5 px-2 rounded-lg font-medium text-[11px] border transition-colors ${
                                targetDiscountPct === 'any'
                                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              Jeder Rabatt
                            </button>
                            <button
                              type="button"
                              onClick={() => setTargetDiscountPct(5)}
                              className={`py-1.5 px-2 rounded-lg font-medium text-[11px] border transition-colors ${
                                targetDiscountPct === 5
                                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              ab -5%
                            </button>
                            <button
                              type="button"
                              onClick={() => setTargetDiscountPct(10)}
                              className={`py-1.5 px-2 rounded-lg font-medium text-[11px] border transition-colors ${
                                targetDiscountPct === 10
                                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              ab -10%
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            id="btn-submit-price-alert"
                            type="submit"
                            disabled={alertLoading}
                            className="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
                          >
                            {alertLoading ? (
                              <span>Wird aktiviert...</span>
                            ) : (
                              <>
                                <Bell className="w-3.5 h-3.5" />
                                <span>Preisalarm scharfschalten</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAlertForm(false)}
                            className="py-2 px-3 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition-colors"
                          >
                            Abbrechen
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
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

              {onOpenDealer && (
                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Alle Räder dieses Partners durchsuchen:</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenDealer(offer.dealer_slug);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Alle Angebote von {offer.dealer_name} ansehen</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
