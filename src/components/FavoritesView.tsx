import React from 'react';
import { Heart, Bike, Trash2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Offer } from '../types';
import { OfferCard } from './OfferCard';

interface FavoritesViewProps {
  favoriteIds: string[];
  allOffers: Offer[];
  onSelectOffer: (offer: Offer) => void;
  onOpenLeadModal: (offer: Offer) => void;
  onTrackOutbound: (offerId: string) => void;
  onClearFavorites: () => void;
  onExploreBikes: () => void;
  onCompareNotice?: (msg: string) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favoriteIds,
  allOffers,
  onSelectOffer,
  onOpenLeadModal,
  onTrackOutbound,
  onClearFavorites,
  onExploreBikes,
  onCompareNotice
}) => {
  // Find matching offers from the loaded catalog
  const favoritedOffers = allOffers.filter((offer) => favoriteIds.includes(offer.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-xs">
              <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span>Deine Favoriten</span>
                <span className="text-xs px-2.5 py-0.5 font-bold rounded-full bg-rose-100 text-rose-800">
                  {favoriteIds.length} {favoriteIds.length === 1 ? 'Rad' : 'Räder'}
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                In deinem Browser gespeicherte Fahrräder • Direkt beim Fachhändler anfragen oder reservieren
              </p>
            </div>
          </div>
        </div>

        {favoriteIds.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              id="btn-explore-more"
              onClick={onExploreBikes}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex items-center gap-1.5"
            >
              <span>Weitere Räder ansehen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              id="btn-clear-favorites"
              onClick={() => {
                if (window.confirm('Möchtest du wirklich alle gemerkten Fahrräder aus deinen Favoriten entfernen?')) {
                  onClearFavorites();
                }
              }}
              className="px-3.5 py-2 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1.5"
              title="Alle Favoriten entfernen"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Alle löschen</span>
            </button>
          </div>
        )}
      </div>

      {/* Content Grid or Empty State */}
      {favoritedOffers.length === 0 ? (
        <div className="max-w-lg mx-auto my-16 text-center bg-white rounded-3xl p-10 border border-slate-200 shadow-xs space-y-5">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500 ring-8 ring-rose-50/50">
            <Heart className="w-10 h-10 fill-rose-400 text-rose-500" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Noch keine Fahrräder gemerkt</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Klicke bei beliebigen Fahrrädern oder E-Bikes auf das <span className="inline-flex items-center font-semibold text-rose-600"><Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 mx-1 inline" /> Herz-Symbol</span>,
              um passende Modelle für später zu speichern und zu vergleichen.
            </p>
          </div>

          <div className="pt-2">
            <button
              id="btn-favorites-empty-explore"
              onClick={onExploreBikes}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm inline-flex items-center gap-2 shadow-sm transition-all hover:shadow-md"
            >
              <Bike className="w-4 h-4" />
              <span>Jetzt Räder & E-Bikes durchstöbern</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Automatisch in deinem lokalen Speicher gesichert</span>
          </div>
        </div>
      ) : (
        <div className="py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoritedOffers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                onSelectOffer={onSelectOffer}
                onOpenLeadModal={onOpenLeadModal}
                onTrackOutbound={onTrackOutbound}
                onCompareNotice={onCompareNotice}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
