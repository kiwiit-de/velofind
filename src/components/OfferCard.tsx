import React, { useState } from 'react';
import { MapPin, BatteryCharging, Zap, Gauge, ExternalLink, ShieldCheck, CheckCircle2, Heart, Scale, Building2 } from 'lucide-react';
import { Offer } from '../types';
import { useFavorites } from '../utils/favorites';
import { useCompare } from '../utils/compare';
import { resolveImageUrl } from '../lib/api';

interface OfferCardProps {
  offer: Offer;
  onSelectOffer: (offer: Offer) => void;
  onTrackOutbound: (offerId: string) => void;
  onOpenLeadModal?: (offer: Offer) => void;
  onCompareNotice?: (msg: string) => void;
  onOpenDealer?: (dealerSlug: string) => void;
}

export const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  onSelectOffer,
  onTrackOutbound,
  onOpenLeadModal,
  onCompareNotice,
  onOpenDealer
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isInCompare, toggleCompare } = useCompare();
  const isFav = isFavorite(offer.id);
  const inCompare = isInCompare(offer.id);
  const [imgSrc, setImgSrc] = useState(
    resolveImageUrl(offer.image_url)
  );

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

  const isDiscounted = offer.compare_at_price_cents && offer.compare_at_price_cents > offer.price_cents;
  const closestLocation = offer.dealer_locations[0];
  const isLowStock = offer.quantity > 0 && (offer.quantity <= 2 || offer.availability === 'AVAILABLE_SHORT_TERM');
  const isOutOfStock = offer.availability === 'OUT_OF_STOCK' || offer.quantity === 0;

  return (
    <div
      id={`offer-card-${offer.id}`}
      className={`OfferCard group relative bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 hover:scale-[1.018] hover:border-emerald-300/80 hover:z-10 transition-all duration-300 ease-out flex flex-col justify-between will-change-transform ${
        inCompare ? 'ring-2 ring-emerald-500 border-emerald-400 bg-emerald-50/10' : 'border-slate-200/90'
      }`}
    >
      {/* Media & Badges Container */}
      <div className="relative aspect-4/3 bg-slate-50 overflow-hidden cursor-pointer" onClick={() => onSelectOffer(offer)}>
        <img
          src={imgSrc}
          alt={offer.title}
          onError={() => {
            setImgSrc(resolveImageUrl('/images/bikes/cube_stereo_hybrid.jpg'));
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Top Left Corner: Inventory Status Badge (Low Stock / In Stock) & Category */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 items-start">
          {/* Inventory Status Badge */}
          <div
            id={`stock-badge-${offer.id}`}
            data-stock-status={isLowStock ? 'low-stock' : isOutOfStock ? 'out-of-stock' : 'in-stock'}
            className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold flex items-center gap-1.5 shadow-sm backdrop-blur-md transition-all duration-200 ${
              isLowStock
                ? 'bg-amber-50/95 text-amber-950 border border-amber-300 shadow-amber-900/10 ring-1 ring-amber-400/40'
                : isOutOfStock
                ? 'bg-slate-100/95 text-slate-700 border border-slate-300'
                : 'bg-emerald-50/95 text-emerald-950 border border-emerald-300/80 shadow-emerald-900/5'
            }`}
            title={
              isLowStock
                ? `Geringer Lagerbestand: Nur noch ${offer.quantity} Exemplar${offer.quantity === 1 ? '' : 'e'} vor Ort verfügbar!`
                : isOutOfStock
                ? 'Derzeit nicht vorrätig'
                : `Auf Lager: ${offer.quantity} Exemplare sofort verfügbar`
            }
          >
            {isLowStock ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
                </span>
                <span className="tracking-tight">Low Stock</span>
                {offer.quantity > 0 && (
                  <span className="text-[9.5px] font-semibold text-amber-900/80">
                    ({offer.quantity === 1 ? 'Nur 1 übrig!' : `Nur ${offer.quantity} übrig`})
                  </span>
                )}
              </>
            ) : isOutOfStock ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                <span className="tracking-tight">Out of Stock</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span className="tracking-tight">In Stock</span>
              </>
            )}
          </div>

          {/* Category & Propulsion Badges */}
          <div className="flex flex-wrap gap-1">
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-white/95 text-slate-800 rounded-md shadow-xs backdrop-blur">
              {offer.category}
            </span>
            {offer.propulsion === 'PEDELEC' && (
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-700 text-white rounded-md shadow-xs flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5 text-emerald-200" /> E-Bike
              </span>
            )}
            {offer.propulsion === 'MUSCULAR' && (
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-800 text-white rounded-md shadow-xs">
                Bio-Bike
              </span>
            )}
          </div>
        </div>

        {/* Top Right Action Toolbar: Compare & Heart Favorite */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <button
            id={`compare-btn-${offer.id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const res = toggleCompare(offer.id);
              if (!res.success && res.error && onCompareNotice) {
                onCompareNotice(res.error);
              }
            }}
            aria-label={inCompare ? 'Aus Vergleich entfernen' : 'Zum Vergleich hinzufügen'}
            title={inCompare ? 'Im Vergleich (Klicken zum Entfernen)' : 'Zum Vergleich hinzufügen (max. 3)'}
            className={`h-8 px-2.5 rounded-full flex items-center gap-1 text-xs font-semibold transition-all duration-200 active:scale-95 shadow-xs ${
              inCompare
                ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-200'
                : 'bg-white/95 text-slate-700 hover:text-emerald-700 hover:bg-white border border-slate-200/80 backdrop-blur-xs'
            }`}
          >
            <Scale className={`w-3.5 h-3.5 ${inCompare ? 'text-white' : 'text-slate-500'}`} />
            <span className="text-[11px]">{inCompare ? 'Im Vergleich' : 'Vergleichen'}</span>
          </button>

          <button
            id={`favorite-btn-${offer.id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(offer.id);
            }}
            aria-label={isFav ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
            title={isFav ? 'Aus Favoriten entfernen' : 'Fahrrad merken'}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 shadow-sm ${
              isFav
                ? 'bg-white text-rose-500 ring-2 ring-rose-200 shadow-md'
                : 'bg-white/90 text-slate-500 hover:text-rose-500 hover:bg-white backdrop-blur-xs'
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform duration-200 ${
                isFav ? 'fill-rose-500 text-rose-500 scale-110' : 'hover:scale-110'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Model Title */}
          <div className="text-xs font-semibold text-emerald-700 tracking-wider uppercase mb-1">
            {offer.brand_name} • {offer.model_year}
          </div>
          <h3
            className="text-base font-bold text-slate-900 line-clamp-2 hover:text-emerald-700 cursor-pointer transition-colors leading-snug mb-2"
            onClick={() => onSelectOffer(offer)}
          >
            {offer.title}
          </h3>

          {/* Key Technical Specs */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 mb-3">
            {offer.variant_details?.battery_wh && (
              <div className="flex items-center gap-1">
                <BatteryCharging className="w-3.5 h-3.5 text-slate-400" />
                <span>{offer.variant_details.battery_wh} Wh</span>
              </div>
            )}
            {offer.variant_details?.torque_nm && (
              <div className="flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-slate-400" />
                <span>{offer.variant_details.torque_nm} Nm</span>
              </div>
            )}
            {offer.variant_details?.frame_size && (
              <div className="flex items-center gap-1">
                <span className="font-medium text-slate-700">Größe:</span> {offer.variant_details.frame_size}
              </div>
            )}
          </div>

          {/* Supported Leasing Providers */}
          {offer.leasing_compatibilities && offer.leasing_compatibilities.length > 0 && (
            <div className="mb-4">
              <div className="text-[11px] font-medium text-slate-500 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Leasing-Partner bestätigt:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {offer.leasing_compatibilities.slice(0, 3).map((lc) => (
                  <span
                    key={lc.provider_slug}
                    className="px-1.5 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-900 border border-emerald-200 rounded"
                    title={lc.evidence_reason}
                  >
                    ✓ {lc.provider_name}
                  </span>
                ))}
                {offer.leasing_compatibilities.length > 3 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded">
                    +{offer.leasing_compatibilities.length - 3} weitere
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Price & Dealer Bottom Bar */}
        <div className="pt-3 border-t border-slate-100">
          {/* Dealer & Location Distance */}
          <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
            {onOpenDealer ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDealer(offer.dealer_slug);
                }}
                className="font-medium text-slate-700 hover:text-emerald-700 hover:underline truncate max-w-[170px] text-left flex items-center gap-1 transition-colors group/dealer"
                title={`${offer.dealer_name} – Alle Angebote dieses Händlers ansehen`}
              >
                <Building2 className="w-3 h-3 text-slate-400 group-hover/dealer:text-emerald-600 shrink-0" />
                <span className="truncate">{offer.dealer_name}</span>
              </button>
            ) : (
              <span className="font-medium truncate max-w-[170px]" title={offer.dealer_name}>
                {offer.dealer_name}
              </span>
            )}
            {offer.distance_km !== undefined ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                <MapPin className="w-3 h-3" />
                {offer.distance_km} km
              </span>
            ) : closestLocation ? (
              <span className="text-slate-400 flex items-center gap-0.5">
                <MapPin className="w-3 h-3" />
                {closestLocation.city}
              </span>
            ) : null}
          </div>

          {/* Pricing & CTA Buttons */}
          <div className="flex items-end justify-between gap-2">
            <div>
              {isDiscounted && (
                <div className="text-xs text-slate-400 line-through">
                  {formattedComparePrice}
                </div>
              )}
              <div className="text-lg font-bold text-slate-900 leading-tight">
                {formattedPrice}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                id={`btn-view-details-${offer.id}`}
                onClick={() => onSelectOffer(offer)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Details
              </button>
              <button
                id={`btn-outbound-${offer.id}`}
                onClick={() => onTrackOutbound(offer.id)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 transition-colors shadow-xs"
                title="Angebot direkt auf der Händler-Website ansehen"
              >
                <span>Händler</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
