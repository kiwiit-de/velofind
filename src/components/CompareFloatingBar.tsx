import React from 'react';
import { Scale, X, ArrowRight, Trash2 } from 'lucide-react';
import { Offer } from '../types';
import { resolveImageUrl } from '../lib/api';

interface CompareFloatingBarProps {
  compareOffers: Offer[];
  onOpenModal: () => void;
  onRemoveOffer: (offerId: string) => void;
  onClearAll: () => void;
}

export const CompareFloatingBar: React.FC<CompareFloatingBarProps> = ({
  compareOffers,
  onOpenModal,
  onRemoveOffer,
  onClearAll
}) => {
  if (compareOffers.length === 0) return null;

  return (
    <div
      id="compare-floating-bar"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-2xl bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-2.5 sm:p-3 shadow-2xl border border-slate-700/60 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-300"
    >
      {/* Left: Indicator & Thumbnails */}
      <div className="flex items-center gap-3 overflow-x-auto py-0.5">
        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Scale className="w-4 h-4" />
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
              <span>Vergleich</span>
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-emerald-400/20 text-emerald-300 font-mono">
                {compareOffers.length}/3
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              {compareOffers.length === 1
                ? 'Noch 1 oder 2 Räder wählen'
                : `${compareOffers.length} Räder ausgewählt`}
            </div>
          </div>
        </div>

        {/* Selected Bikes Thumbnails */}
        <div className="flex items-center gap-2">
          {compareOffers.map((offer) => (
            <div
              key={offer.id}
              className="relative group w-10 h-10 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 shrink-0"
              title={offer.title}
            >
              <img
                src={resolveImageUrl(offer.image_url)}
                alt={offer.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = resolveImageUrl('/images/bikes/cube_stereo_hybrid.jpg');
                }}
              />
              <button
                id={`btn-floating-remove-${offer.id}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveOffer(offer.id);
                }}
                className="absolute inset-0 bg-slate-900/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                title="Entfernen"
              >
                <X className="w-3.5 h-3.5 text-rose-400" />
              </button>
            </div>
          ))}

          {/* Empty slot indicators */}
          {Array.from({ length: Math.max(0, 3 - compareOffers.length) }).map((_, idx) => (
            <div
              key={`empty-pill-${idx}`}
              className="w-10 h-10 rounded-lg border-2 border-dashed border-slate-700/80 flex items-center justify-center text-slate-600 shrink-0 text-[10px] font-mono"
              title="Freier Vergleichsplatz (max. 3)"
            >
              +
            </div>
          ))}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          id="btn-floating-clear"
          type="button"
          onClick={onClearAll}
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-xl transition-colors"
          title="Vergleich leeren"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <button
          id="btn-open-compare-modal"
          type="button"
          onClick={onOpenModal}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95"
        >
          <span>Vergleichen ({compareOffers.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
