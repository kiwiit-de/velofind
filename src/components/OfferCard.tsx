import React from 'react';
import { MapPin, BatteryCharging, Zap, Gauge, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Offer } from '../types';

interface OfferCardProps {
  offer: Offer;
  onSelectOffer: (offer: Offer) => void;
  onTrackOutbound: (offerId: string) => void;
}

export const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  onSelectOffer,
  onTrackOutbound
}) => {
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

  return (
    <div
      id={`offer-card-${offer.id}`}
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
    >
      {/* Media & Badges Container */}
      <div className="relative aspect-4/3 bg-slate-50 overflow-hidden cursor-pointer" onClick={() => onSelectOffer(offer)}>
        <img
          src={offer.image_url || 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80'}
          alt={offer.title}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          loading="lazy"
        />

        {/* Category & Propulsion Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2 py-0.5 text-[11px] font-semibold bg-white/95 text-slate-800 rounded-md shadow-xs backdrop-blur">
            {offer.category}
          </span>
          {offer.propulsion === 'PEDELEC' && (
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-600 text-white rounded-md shadow-xs flex items-center gap-1">
              <Zap className="w-3 h-3" /> E-Bike
            </span>
          )}
          {offer.propulsion === 'MUSCULAR' && (
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-slate-800 text-white rounded-md shadow-xs">
              Bio-Bike
            </span>
          )}
        </div>

        {/* Availability Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Sofort verfügbar
          </span>
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
            <span className="font-medium truncate max-w-[170px]" title={offer.dealer_name}>
              {offer.dealer_name}
            </span>
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
