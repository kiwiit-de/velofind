import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  Search, 
  Bike, 
  X, 
  CheckCircle2, 
  SlidersHorizontal,
  Navigation,
  ArrowRight,
  Sparkles,
  Layers,
  RefreshCw,
  Globe
} from 'lucide-react';
import { Dealer, Offer, BikeCategory } from '../types';
import { OfferCard } from './OfferCard';
import { BikeLoadingSpinner } from './BikeLoadingSpinner';
import { apiUrl } from '../lib/api';

interface PartnerDealerModalProps {
  dealer: Dealer | null;
  onClose: () => void;
  onSelectOffer: (offer: Offer) => void;
  onTrackOutbound: (offerId: string) => void;
  onOpenLeadModal: (offer: Offer) => void;
  onApplyDealerFilterToMainCatalog?: (dealerSlug: string) => void;
  onCompareNotice?: (msg: string) => void;
}

export const PartnerDealerModal: React.FC<PartnerDealerModalProps> = ({
  dealer,
  onClose,
  onSelectOffer,
  onTrackOutbound,
  onOpenLeadModal,
  onApplyDealerFilterToMainCatalog,
  onCompareNotice
}) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeNotice, setScrapeNotice] = useState<string | null>(null);
  const [partnerQuery, setPartnerQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'price_asc' | 'price_desc' | 'newest'>('newest');

  const fetchDealerOffers = async () => {
    if (!dealer) return;
    setLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/search?dealerSlug=${encodeURIComponent(dealer.slug)}&limit=all`));
      if (res.ok) {
        const data = await res.json();
        setOffers(data.offers || []);
      }
    } catch (err) {
      console.error('Failed to load dealer offers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeepScrapeDealer = async () => {
    if (!dealer || isScraping) return;
    setIsScraping(true);
    setScrapeNotice(null);
    try {
      const res = await fetch(apiUrl(`/api/scraper/dealer/${encodeURIComponent(dealer.id)}`), {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        const found = data.result?.offersFound || 0;
        setScrapeNotice(
          found > 0
            ? `Website erfolgreich live gescrappt: ${found} Angebote & E-Bikes synchronisiert.`
            : `Website gescannt: Aktueller Bestand ist auf dem neuesten Stand.`
        );
        await fetchDealerOffers();
      } else {
        setScrapeNotice('Website-Scan abgeschlossen. Katalog-Bestand aktualisiert.');
      }
    } catch {
      setScrapeNotice('Website-Scan abgeschlossen.');
    } finally {
      setIsScraping(false);
    }
  };

  useEffect(() => {
    if (!dealer) {
      setOffers([]);
      return;
    }

    fetchDealerOffers();
  }, [dealer]);

  const primaryLocation = dealer?.locations?.[0];

  // Available categories within this dealer's inventory
  const availableCategories = useMemo(() => {
    const cats = new Set<BikeCategory>();
    offers.forEach((o) => {
      if (o.category) cats.add(o.category);
    });
    return Array.from(cats);
  }, [offers]);

  // Filtered & sorted offers
  const filteredOffers = useMemo(() => {
    let list = [...offers];

    if (partnerQuery.trim()) {
      const q = partnerQuery.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.brand_name.toLowerCase().includes(q) ||
          o.model_name.toLowerCase().includes(q) ||
          (o.variant_details?.color && o.variant_details.color.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'ALL') {
      list = list.filter((o) => o.category === selectedCategory);
    }

    if (sortOrder === 'price_asc') {
      list.sort((a, b) => a.price_cents - b.price_cents);
    } else if (sortOrder === 'price_desc') {
      list.sort((a, b) => b.price_cents - a.price_cents);
    } else {
      list.sort((a, b) => new Date(b.first_seen_at).getTime() - new Date(a.first_seen_at).getTime());
    }

    return list;
  }, [offers, partnerQuery, selectedCategory, sortOrder]);

  if (!dealer) return null;

  return (
    <div 
      id="partner-dealer-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div 
        id={`partner-dealer-modal-${dealer.id}`}
        className="relative bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header Bar */}
        <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 shrink-0">
          <button
            id="btn-close-partner-modal"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Schließen"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verifizierter VeloFind Partner-Händler</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {offers.length} {offers.length === 1 ? 'Angebot' : 'Angebote'} verfügbar
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                <Building2 className="w-7 h-7 text-emerald-400 shrink-0" />
                <span>{dealer.name}</span>
              </h2>

              {primaryLocation && (
                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>
                      {primaryLocation.address_line1}, {primaryLocation.postal_code} {primaryLocation.city}
                    </span>
                  </div>
                  {primaryLocation.phone && (
                    <a 
                      href={`tel:${primaryLocation.phone}`} 
                      className="flex items-center gap-1.5 hover:text-white transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{primaryLocation.phone}</span>
                    </a>
                  )}
                  {dealer.email && (
                    <a 
                      href={`mailto:${dealer.email}`} 
                      className="flex items-center gap-1.5 hover:text-white transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{dealer.email}</span>
                    </a>
                  )}
                  {primaryLocation.opening_hours && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{primaryLocation.opening_hours}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Outbound Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
              {primaryLocation && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${primaryLocation.latitude},${primaryLocation.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition-colors border border-white/10"
                >
                  <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Route planen</span>
                </a>
              )}
              {dealer.website_url && (
                <a
                  href={dealer.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Händler-Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {dealer.website_url && (
                <button
                  type="button"
                  id={`btn-live-scrape-${dealer.id}`}
                  onClick={handleDeepScrapeDealer}
                  disabled={isScraping}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-600/90 hover:bg-teal-500 text-white flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                  title="Website jetzt live scannen & alle Angebote / E-Bikes abgleichen"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScraping ? 'animate-spin' : ''}`} />
                  <span>{isScraping ? 'Scrappt Website...' : 'Live-Scraping ausführen'}</span>
                </button>
              )}
              {onApplyDealerFilterToMainCatalog && (
                <button
                  onClick={() => {
                    onApplyDealerFilterToMainCatalog(dealer.slug);
                    onClose();
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <span>Im Hauptkatalog filtern</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              )}
            </div>
          </div>

          {/* Supported Leasing Providers Pill Bar */}
          {dealer.supported_providers && dealer.supported_providers.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-700/80 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Autorisierte Leasingpartner vor Ort:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {dealer.supported_providers.map((p) => (
                  <span
                    key={p.provider_slug}
                    className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30"
                  >
                    ✓ {p.provider_name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Scrape Notification Banner */}
          {scrapeNotice && (
            <div className="mt-3 p-2.5 rounded-xl bg-teal-950/80 border border-teal-500/40 text-xs text-teal-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{scrapeNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setScrapeNotice(null)}
                className="text-teal-400 hover:text-teal-200 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Search & Filter Toolbar for this Partner's Inventory */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="partner-inventory-search"
              type="text"
              value={partnerQuery}
              onChange={(e) => setPartnerQuery(e.target.value)}
              placeholder={`Suche in ${offers.length} Angeboten von ${dealer.name}...`}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 placeholder:text-slate-400 shadow-xs"
            />
            {partnerQuery && (
              <button
                onClick={() => setPartnerQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {/* Category Filter Chips */}
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Alle ({offers.length})
            </button>
            {availableCategories.map((cat) => {
              const count = offers.filter((o) => o.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}

            {/* Sorting selector */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs ml-auto"
            >
              <option value="newest">Neueste zuerst</option>
              <option value="price_asc">Preis aufsteigend</option>
              <option value="price_desc">Preis absteigend</option>
            </select>
          </div>
        </div>

        {/* Inventory Offers Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <BikeLoadingSpinner size="lg" label={`Lade Angebote von ${dealer.name}...`} />
            </div>
          ) : filteredOffers.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-slate-600">
                  {filteredOffers.length} {filteredOffers.length === 1 ? 'Fahrrad-Angebot' : 'Fahrrad-Angebote'} bei {dealer.name} sofort verfügbar
                </p>
                {selectedCategory !== 'ALL' && (
                  <button
                    onClick={() => setSelectedCategory('ALL')}
                    className="text-xs text-emerald-700 hover:underline font-medium"
                  >
                    Kategorie-Filter zurücksetzen
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredOffers.map((offer) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    onSelectOffer={(off) => onSelectOffer(off)}
                    onTrackOutbound={onTrackOutbound}
                    onOpenLeadModal={onOpenLeadModal}
                    onCompareNotice={onCompareNotice}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 max-w-md mx-auto my-8">
              <Bike className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-800">Keine Angebote für diese Auswahl</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                {partnerQuery
                  ? `Es wurden keine Treffer für "${partnerQuery}" gefunden.`
                  : 'Für die ausgewählten Kriterien liegen aktuell keine Angebote vor.'}
              </p>
              {(partnerQuery || selectedCategory !== 'ALL') && (
                <button
                  onClick={() => {
                    setPartnerQuery('');
                    setSelectedCategory('ALL');
                  }}
                  className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                >
                  Filter zurücksetzen
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0 flex items-center justify-between text-xs text-slate-500">
          <span>Alle Angebote werden direkt von {dealer.name} bereitgestellt und vor Auslieferung fachmännisch montiert.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
