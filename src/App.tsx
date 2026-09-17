import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { SearchFiltersBar } from './components/SearchFiltersBar';
import { OfferCard } from './components/OfferCard';
import { OfferModal } from './components/OfferModal';
import { LeadModal } from './components/LeadModal';
import { LeasingGuideView } from './components/LeasingGuideView';
import { DealersDirectoryView } from './components/DealersDirectoryView';
import { DealerAdminPortal } from './components/DealerAdminPortal';
import { FavoritesView } from './components/FavoritesView';
import { CompareFloatingBar } from './components/CompareFloatingBar';
import { CompareModal } from './components/CompareModal';
import { Offer, Dealer, LeasingProvider, SearchResponse } from './types';
import { Bike, Sparkles, Filter, RefreshCw, AlertCircle, CheckCircle2, ShieldCheck, MapPin, Clock, Heart, Scale } from 'lucide-react';
import { useFavorites } from './utils/favorites';
import { useCompare } from './utils/compare';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'bikes' | 'favorites' | 'leasing' | 'dealers' | 'admin'>('bikes');
  const { favoriteIds, clearFavorites, favoritesCount } = useFavorites();
  const { compareIds, compareCount, removeCompare, clearCompare } = useCompare();

  // Search & Filter State
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('ALL');
  const [propulsion, setPropulsion] = useState('ALL');
  const [brand, setBrand] = useState('ALL');
  const [leasingProvider, setLeasingProvider] = useState('ALL');
  const [postalCode, setPostalCode] = useState('');
  const [radiusKm, setRadiusKm] = useState(50);
  const [sort, setSort] = useState('newest');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Daily Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncDate, setLastSyncDate] = useState<string>('Heute');

  // Results State
  const [offers, setOffers] = useState<Offer[]>([]);
  const [totalOffers, setTotalOffers] = useState(0);
  const [availableBrands, setAvailableBrands] = useState<{ name: string; count: number }[]>([]);
  const [availableProviders, setAvailableProviders] = useState<{ slug: string; name: string; count: number }[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [providers, setProviders] = useState<LeasingProvider[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals State
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [leadOffer, setLeadOffer] = useState<Offer | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cachedOffersMap, setCachedOffersMap] = useState<Record<string, Offer>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Keep an in-memory cache of loaded offers so compare and favorites always have full specs
  useEffect(() => {
    if (offers.length > 0) {
      setCachedOffersMap((prev) => {
        const next = { ...prev };
        offers.forEach((o) => {
          next[o.id] = o;
        });
        return next;
      });
    }
  }, [offers]);

  // Fetch full details for any compared bike not present in the current search page
  useEffect(() => {
    compareIds.forEach(async (id) => {
      if (!cachedOffersMap[id]) {
        try {
          const res = await fetch(`/api/offers/${id}`);
          if (res.ok) {
            const data: Offer = await res.json();
            setCachedOffersMap((prev) => ({ ...prev, [id]: data }));
          }
        } catch (err) {
          console.error('Failed to fetch compared offer:', err);
        }
      }
    });
  }, [compareIds, cachedOffersMap]);

  // Resolved list of Offer objects currently in compare list
  const compareOffers = compareIds
    .map((id) => cachedOffersMap[id] || offers.find((o) => o.id === id))
    .filter((o): o is Offer => !!o);

  // Fetch Reference Data (Dealers & Providers)
  const fetchMetadata = async () => {
    try {
      const [dealersRes, providersRes] = await Promise.all([
        fetch('/api/dealers'),
        fetch('/api/leasing-providers')
      ]);
      if (dealersRes.ok) setDealers(await dealersRes.json());
      if (providersRes.ok) setProviders(await providersRes.json());
    } catch (err) {
      console.error('Failed to load metadata:', err);
    }
  };

  // Fetch Daily Sync Status
  const fetchSyncStatus = async () => {
    try {
      const res = await fetch('/api/sync/status');
      if (res.ok) {
        const data = await res.json();
        if (data.lastSyncTimestamp) {
          const d = new Date(data.lastSyncTimestamp);
          setLastSyncDate(d.toLocaleDateString('de-DE', { hour: '2-digit', minute: '2-digit' }));
        }
      }
    } catch {
      // Non-blocking fallback
    }
  };

  // Trigger manual daily sync
  const handleTriggerDailySync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync/trigger', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        showToast(`Täglicher Bestandsabgleich erfolgreich: ${data.report?.totalOffersChecked || 1001} Räder aktualisiert!`);
        setLastSyncDate(new Date().toLocaleDateString('de-DE', { hour: '2-digit', minute: '2-digit' }));
        fetchSearchResults();
      } else {
        showToast('Aktualisierung des Bestands fehlgeschlagen.');
      }
    } catch (err) {
      showToast('Verbindungsfehler beim Bestandsabgleich.');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchMetadata();
    fetchSyncStatus();
  }, []);

  // Fetch Search Results
  const fetchSearchResults = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.append('q', query.trim());
      if (category !== 'ALL') params.append('category', category);
      if (propulsion !== 'ALL') params.append('propulsion', propulsion);
      if (brand !== 'ALL') params.append('brand', brand);
      if (leasingProvider !== 'ALL') params.append('provider', leasingProvider);
      if (postalCode) {
        params.append('postalCode', postalCode);
        params.append('radius', String(radiusKm));
      }
      params.append('sort', sort);
      params.append('limit', '48');

      const res = await fetch(`/api/search?${params.toString()}`);
      if (res.ok) {
        const data: SearchResponse = await res.json();
        setOffers(data.offers);
        setTotalOffers(data.total);
        setAvailableBrands(data.available_brands || []);
        setAvailableProviders(data.available_providers || []);
      }
    } catch (err) {
      console.error('Search request failed:', err);
    } finally {
      setLoading(false);
    }
  }, [query, category, propulsion, brand, leasingProvider, postalCode, radiusKm, sort]);

  useEffect(() => {
    fetchSearchResults();
  }, [fetchSearchResults]);

  // Tracked Outbound Safe Redirect
  const handleTrackOutbound = (offerId: string) => {
    // Open through tracked attribution redirect in a new window/tab
    window.open(`/api/out/${offerId}`, '_blank', 'noopener,noreferrer');
    showToast('Weiterleitung zum verifizierten Fachhändler erfolgt...');
  };

  const resetFilters = () => {
    setQuery('');
    setCategory('ALL');
    setPropulsion('ALL');
    setBrand('ALL');
    setLeasingProvider('ALL');
    setPostalCode('');
    setRadiusKm(50);
    setSort('newest');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-medium border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        selectedCity={postalCode}
        setSelectedCity={setPostalCode}
        onOpenCompare={() => setIsCompareModalOpen(true)}
      />

      {/* Dynamic Content Views */}
      <main className="flex-1">
        {currentTab === 'bikes' && (
          <div>
            {/* Search Filters Subheader */}
            <SearchFiltersBar
              query={query}
              setQuery={setQuery}
              category={category}
              setCategory={setCategory}
              propulsion={propulsion}
              setPropulsion={setPropulsion}
              brand={brand}
              setBrand={setBrand}
              leasingProvider={leasingProvider}
              setLeasingProvider={setLeasingProvider}
              postalCode={postalCode}
              setPostalCode={setPostalCode}
              radiusKm={radiusKm}
              setRadiusKm={setRadiusKm}
              sort={sort}
              setSort={setSort}
              availableBrands={availableBrands}
              availableProviders={availableProviders}
              totalResults={totalOffers}
              resetFilters={resetFilters}
              onlyFavorites={onlyFavorites}
              setOnlyFavorites={setOnlyFavorites}
            />

            {/* Offers Grid Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {/* Results Count & Quick Info Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span>
                      {onlyFavorites
                        ? offers.filter((o) => favoriteIds.includes(o.id)).length
                        : totalOffers}{' '}
                      {(onlyFavorites ? offers.filter((o) => favoriteIds.includes(o.id)).length : totalOffers) === 1
                        ? 'Angebot'
                        : 'Angebote'}{' '}
                      {onlyFavorites ? 'in deinen Favoriten' : 'gefunden'}
                    </span>
                    {onlyFavorites && (
                      <span className="px-2 py-0.5 text-xs font-semibold bg-rose-100 text-rose-800 rounded-full flex items-center gap-1">
                        <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                        Gefiltert
                      </span>
                    )}
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    100% verifizierter Fachhändlerbestand aus Deutschland • Alle Preise inkl. MwSt.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Daily Update Freshness Badge & Trigger */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-full shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Täglich aktualisiert: <strong>{lastSyncDate}</strong></span>
                    <button
                      id="btn-sync-catalog"
                      onClick={handleTriggerDailySync}
                      disabled={isSyncing}
                      className="text-slate-400 hover:text-emerald-700 transition-colors p-0.5 rounded"
                      title="Bestand jetzt sofort aktualisieren"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
                    </button>
                  </div>

                  {postalCode && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Umkreis {radiusKm} km um {postalCode}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Grid of Bikes */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3 animate-pulse">
                      <div className="aspect-4/3 bg-slate-200 rounded-xl"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                      <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-8 bg-slate-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (onlyFavorites ? offers.filter((o) => favoriteIds.includes(o.id)) : offers).length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto my-12 space-y-4">
                  <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                    {onlyFavorites ? <Heart className="w-8 h-8 text-rose-400" /> : <Bike className="w-8 h-8" />}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {onlyFavorites ? 'Keine Favoriten gefunden' : 'Keine Angebote für diese Filterung'}
                  </h2>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {onlyFavorites
                      ? 'Du hast für die aktuellen Suchfilter noch keine Favoriten gespeichert. Klicke auf das Herz-Symbol bei einem Fahrrad, um es zu merken.'
                      : 'Versuchen Sie, den Suchbegriff zu verallgemeinern oder den Umkreis zu vergrößern.'}
                  </p>
                  <button
                    onClick={() => {
                      setOnlyFavorites(false);
                      resetFilters();
                    }}
                    className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"
                  >
                    {onlyFavorites ? 'Alle Räder anzeigen' : 'Alle Filter zurücksetzen'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {(onlyFavorites ? offers.filter((o) => favoriteIds.includes(o.id)) : offers).map((offer) => (
                    <OfferCard
                      key={offer.id}
                      offer={offer}
                      onSelectOffer={setSelectedOffer}
                      onTrackOutbound={handleTrackOutbound}
                      onOpenLeadModal={setLeadOffer}
                      onCompareNotice={showToast}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {currentTab === 'favorites' && (
          <FavoritesView
            favoriteIds={favoriteIds}
            allOffers={offers}
            onSelectOffer={setSelectedOffer}
            onOpenLeadModal={setLeadOffer}
            onTrackOutbound={handleTrackOutbound}
            onCompareNotice={showToast}
            onClearFavorites={() => {
              clearFavorites();
              showToast('Alle Favoriten wurden entfernt');
            }}
            onExploreBikes={() => {
              setOnlyFavorites(false);
              setCurrentTab('bikes');
            }}
          />
        )}

        {currentTab === 'leasing' && (
          <LeasingGuideView
            providers={providers}
            onSelectProvider={(slug) => {
              setLeasingProvider(slug);
              setCurrentTab('bikes');
            }}
          />
        )}

        {currentTab === 'dealers' && (
          <DealersDirectoryView
            dealers={dealers}
            onFilterByDealer={(dealerName) => {
              setQuery(dealerName);
              setCurrentTab('bikes');
            }}
          />
        )}

        {currentTab === 'admin' && (
          <DealerAdminPortal
            dealers={dealers}
            onRefreshData={() => {
              fetchSearchResults();
              fetchMetadata();
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-xs text-slate-600">
            <div>
              <div className="flex items-center gap-2 font-bold text-slate-900 text-base mb-2">
                <Bike className="w-5 h-5 text-emerald-600" />
                <span>VeloFind Deutschland</span>
              </div>
              <p className="leading-relaxed text-slate-500">
                Die unabhängige Entdeckungs- und Vergleichsplattform für stationären Fachhändler-Bestand und Dienstrad-Leasing.
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-900 block mb-2">Dienstrad-Leasing</span>
              <ul className="space-y-1.5 text-slate-500">
                <li>JobRad Partnerhändler</li>
                <li>Bikeleasing-Service</li>
                <li>BusinessBike Entdeckung</li>
                <li>Deutsche Dienstrad & Eurorad</li>
              </ul>
            </div>

            <div>
              <span className="font-bold text-slate-900 block mb-2">Für Fachhändler</span>
              <ul className="space-y-1.5 text-slate-500">
                <li>Wawi-Feed-Anbindung (CSV)</li>
                <li>Qualifizierte Vor-Ort-Leads</li>
                <li>Messbare Klick-Attribution</li>
                <li>Kein Dispo-Risiko</li>
              </ul>
            </div>

            <div>
              <span className="font-bold text-slate-900 block mb-2">Rechtliches & DSGVO</span>
              <ul className="space-y-1.5 text-slate-500">
                <li>Impressum (Deutschland)</li>
                <li>Datenschutzerklärung</li>
                <li>Händler bleibt Vertragspartner</li>
                <li>Transparente Evidenzkriterien</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
            <span>© {new Date().getFullYear()} VeloFind Deutschland GmbH. Alle Rechte vorbehalten.</span>
            <span className="mt-2 sm:mt-0">Made for German Bike & E-Bike Retail</span>
          </div>
        </div>
      </footer>

      {/* Offer Detail Modal */}
      <OfferModal
        offer={selectedOffer}
        onClose={() => setSelectedOffer(null)}
        onOpenLeadModal={(offer) => {
          setSelectedOffer(null);
          setLeadOffer(offer);
        }}
        onTrackOutbound={handleTrackOutbound}
        onCompareNotice={showToast}
      />

      {/* Customer Enquiry / Lead Modal */}
      <LeadModal
        offer={leadOffer}
        onClose={() => setLeadOffer(null)}
        onSubmitSuccess={() => {
          showToast('Anfrage erfolgreich an den Fachhändler übermittelt!');
        }}
      />

      {/* Compare Floating Selection Bar */}
      {!isCompareModalOpen && (
        <CompareFloatingBar
          compareOffers={compareOffers}
          onOpenModal={() => setIsCompareModalOpen(true)}
          onRemoveOffer={removeCompare}
          onClearAll={() => {
            clearCompare();
            showToast('Vergleichsliste geleert');
          }}
        />
      )}

      {/* Compare Modal */}
      <CompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        compareOffers={compareOffers}
        onRemoveOffer={removeCompare}
        onClearAll={() => {
          clearCompare();
          showToast('Vergleichsliste geleert');
        }}
        onOpenLeadModal={(offer) => {
          setIsCompareModalOpen(false);
          setLeadOffer(offer);
        }}
        onTrackOutbound={handleTrackOutbound}
        onAddMoreBikes={() => {
          setIsCompareModalOpen(false);
          setCurrentTab('bikes');
        }}
      />
    </div>
  );
}
