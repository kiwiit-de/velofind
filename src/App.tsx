import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { NearbyDealersMap } from './components/NearbyDealersMap';
import { PartnerDealerModal } from './components/PartnerDealerModal';
import { MarketTrendsSection } from './components/MarketTrendsSection';
import { OfferCardSkeleton, OfferGridSkeleton } from './components/OfferCardSkeleton';
import { BikeLoadingSpinner } from './components/BikeLoadingSpinner';
import { apiUrl } from './lib/api';
import { Offer, Dealer, LeasingProvider, SearchResponse, BikeCategory } from './types';
import { Bike, Sparkles, Filter, RefreshCw, AlertCircle, CheckCircle2, ShieldCheck, MapPin, Clock, Heart, Scale, Compass, Building2, X, ChevronLeft, ChevronRight, Layers, Globe, ExternalLink } from 'lucide-react';
import { useFavorites } from './utils/favorites';
import { useCompare } from './utils/compare';
import { resolveLocation, getNearbyDealers } from './utils/geo';

export default function App() {
  // Read initial search params from URL
  const initialParams = useMemo(() => {
    try {
      return new URLSearchParams(window.location.search);
    } catch {
      return new URLSearchParams();
    }
  }, []);

  const [currentTab, setCurrentTab] = useState<'bikes' | 'favorites' | 'leasing' | 'dealers' | 'admin'>(() => {
    const tabParam = initialParams.get('tab');
    if (tabParam === 'dealers' || tabParam === 'favorites' || tabParam === 'leasing' || tabParam === 'admin') {
      return tabParam;
    }
    return 'bikes';
  });
  const { favoriteIds, clearFavorites, favoritesCount } = useFavorites();
  const { compareIds, compareCount, removeCompare, clearCompare } = useCompare();

  // Search & Filter State
  const [query, setQuery] = useState(() => initialParams.get('q') || initialParams.get('search') || '');
  const [category, setCategory] = useState(() => initialParams.get('category') || 'ALL');
  const [propulsion, setPropulsion] = useState(() => initialParams.get('propulsion') || 'ALL');
  const [brand, setBrand] = useState(() => initialParams.get('brand') || 'ALL');
  const [leasingProvider, setLeasingProvider] = useState(() => initialParams.get('provider') || 'ALL');
  const [selectedDealerSlug, setSelectedDealerSlug] = useState(() => initialParams.get('dealerSlug') || initialParams.get('dealer') || '');
  const [postalCode, setPostalCode] = useState(() => initialParams.get('postalCode') || '');
  const [radiusKm, setRadiusKm] = useState(() => {
    const r = Number(initialParams.get('radius'));
    return r > 0 ? r : 50;
  });
  const [sort, setSort] = useState(() => initialParams.get('sort') || 'newest');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [bikesViewMode, setBikesViewMode] = useState<'grid' | 'map'>('grid');

  // Pagination & Loading State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number | 'all'>(48);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // Daily Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncDate, setLastSyncDate] = useState<string>('Heute');

  // Results State
  const [offers, setOffers] = useState<Offer[]>([]);
  const [totalOffers, setTotalOffers] = useState(0);
  const [availableBrands, setAvailableBrands] = useState<{ name: string; count: number }[]>([]);
  const [availableCategories, setAvailableCategories] = useState<{ category: BikeCategory; count: number }[]>([]);
  const [availableProviders, setAvailableProviders] = useState<{ slug: string; name: string; count: number }[]>([]);
  const [availableDealers, setAvailableDealers] = useState<{ id: string; name: string; slug: string; count: number; city?: string }[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [providers, setProviders] = useState<LeasingProvider[]>([]);
  const [loading, setLoading] = useState(true);

  // Partner Dealer Modal State
  const [partnerModalDealer, setPartnerModalDealer] = useState<Dealer | null>(null);

  // Geographic calculations based on current postalCode
  const centerLocation = useMemo(() => {
    return postalCode ? resolveLocation(postalCode, dealers) : null;
  }, [postalCode, dealers]);

  const nearbyDealersCount = useMemo(() => {
    if (!centerLocation) return dealers.length;
    return getNearbyDealers(dealers, centerLocation.lat, centerLocation.lng, radiusKm).length;
  }, [dealers, centerLocation, radiusKm]);

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
          const res = await fetch(apiUrl(`/api/offers/${id}`));
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
        fetch(apiUrl('/api/dealers')),
        fetch(apiUrl('/api/leasing-providers'))
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
      const res = await fetch(apiUrl('/api/sync/status'));
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
      const res = await fetch(apiUrl('/api/sync/trigger'), { method: 'POST' });
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

  // Fetch Search Results with Pagination & Full Catalog Retrieval Support
  const fetchSearchResults = useCallback(
    async (pageToLoad = 1, append = false, requestedPageSize: number | 'all' = pageSize) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setLoading(true);
      }
      try {
        const params = new URLSearchParams();
        if (query.trim()) params.append('q', query.trim());
        if (category !== 'ALL') params.append('category', category);
        if (propulsion !== 'ALL') params.append('propulsion', propulsion);
        if (brand !== 'ALL') params.append('brand', brand);
        if (leasingProvider !== 'ALL') params.append('provider', leasingProvider);
        if (selectedDealerSlug) params.append('dealerSlug', selectedDealerSlug);
        if (postalCode) {
          params.append('postalCode', postalCode);
          params.append('radius', String(radiusKm));
        }
        params.append('sort', sort);

        if (requestedPageSize === 'all') {
          params.append('limit', 'all');
        } else {
          params.append('limit', String(requestedPageSize));
          const offset = (pageToLoad - 1) * requestedPageSize;
          params.append('offset', String(offset));
        }

        const res = await fetch(apiUrl(`/api/search?${params.toString()}`));
        if (res.ok) {
          const data: SearchResponse = await res.json();
          if (append) {
            setOffers((prev) => {
              const existingIds = new Set(prev.map((o) => o.id));
              const newOffers = (data.offers || []).filter((o) => !existingIds.has(o.id));
              return [...prev, ...newOffers];
            });
          } else {
            setOffers(data.offers || []);
          }
          setTotalOffers(data.total);
          setCurrentPage(pageToLoad);
          setAvailableBrands(data.available_brands || []);
          setAvailableCategories(data.available_categories || []);
          setAvailableProviders(data.available_providers || []);
          setAvailableDealers(data.available_dealers || []);
        }
      } catch (err) {
        console.error('Search request failed:', err);
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    },
    [query, category, propulsion, brand, leasingProvider, selectedDealerSlug, postalCode, radiusKm, sort, pageSize]
  );

  useEffect(() => {
    setCurrentPage(1);
    fetchSearchResults(1, false, pageSize);
  }, [query, category, propulsion, brand, leasingProvider, selectedDealerSlug, postalCode, radiusKm, sort]);

  const totalPages = typeof pageSize === 'number' ? Math.max(1, Math.ceil(totalOffers / pageSize)) : 1;

  const paginationRange = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | '...')[] = [];
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  }, [totalPages, currentPage]);

  const handleLoadMore = () => {
    if (pageSize === 'all' || isLoadingMore) return;
    const nextPage = currentPage + 1;
    fetchSearchResults(nextPage, true, pageSize);
  };

  const handleShowAllOffers = () => {
    setPageSize('all');
    setCurrentPage(1);
    fetchSearchResults(1, false, 'all');
  };

  const handleSetPageSize = (newSize: number | 'all') => {
    setPageSize(newSize);
    setCurrentPage(1);
    fetchSearchResults(1, false, newSize);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchSearchResults(page, false, pageSize);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

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
    setSelectedDealerSlug('');
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
              selectedDealerSlug={selectedDealerSlug}
              setSelectedDealerSlug={setSelectedDealerSlug}
              availableDealers={availableDealers}
              postalCode={postalCode}
              setPostalCode={setPostalCode}
              radiusKm={radiusKm}
              setRadiusKm={setRadiusKm}
              sort={sort}
              setSort={setSort}
              availableBrands={availableBrands}
              availableCategories={availableCategories}
              availableProviders={availableProviders}
              totalResults={totalOffers}
              resetFilters={resetFilters}
              onlyFavorites={onlyFavorites}
              setOnlyFavorites={setOnlyFavorites}
            />

            {/* Offers Grid Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {/* Partner Dealer Filter Banner */}
              {selectedDealerSlug && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300/80 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-950">
                    <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Gefiltert nach Partner-Händler:{' '}
                      <strong>{dealers.find((d) => d.slug === selectedDealerSlug)?.name || selectedDealerSlug}</strong>
                      {dealers.find((d) => d.slug === selectedDealerSlug)?.locations?.[0]?.city
                        ? ` in ${dealers.find((d) => d.slug === selectedDealerSlug)?.locations?.[0]?.city}`
                        : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const d = dealers.find((x) => x.slug === selectedDealerSlug);
                        if (d) setPartnerModalDealer(d);
                      }}
                      className="text-xs text-emerald-700 hover:text-emerald-900 font-bold underline"
                    >
                      Händlerprofil öffnen
                    </button>
                    <button
                      onClick={() => setSelectedDealerSlug('')}
                      className="px-2 py-1 text-xs font-semibold bg-white hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Händler-Filter aufheben</span>
                    </button>
                  </div>
                </div>
              )}
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
                  {/* View Mode Switcher: Grid vs Map */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-semibold">
                    <button
                      id="btn-view-mode-grid"
                      onClick={() => setBikesViewMode('grid')}
                      className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                        bikesViewMode === 'grid'
                          ? 'bg-white text-slate-900 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Bike className="w-3.5 h-3.5" />
                      <span>Angebote ({totalOffers})</span>
                    </button>
                    <button
                      id="btn-view-mode-map"
                      onClick={() => setBikesViewMode('map')}
                      className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                        bikesViewMode === 'map'
                          ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Händler-Karte {postalCode ? `(${nearbyDealersCount})` : ''}</span>
                    </button>
                  </div>

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

              {/* Postal code active proximity banner (shown in grid mode) */}
              {postalCode && bikesViewMode === 'grid' && (
                <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-white rounded-2xl border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {nearbyDealersCount} Fahrrad-Fachhändler im Umkreis von {radiusKm} km um {postalCode}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Entdecke autorisierte Werkstätten, Probefahrten vor Ort und Leasing-Partner auf der interaktiven Deutschland-Karte.
                      </p>
                    </div>
                  </div>
                  <button
                    id="btn-open-map-from-banner"
                    onClick={() => setBikesViewMode('map')}
                    className="px-3.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-300 transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-2xs"
                  >
                    <Compass className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Auf Karte ansehen</span>
                  </button>
                </div>
              )}

              {/* AI-Powered Market Trends & Regional Price Intelligence */}
              {bikesViewMode === 'grid' && (
                <MarketTrendsSection
                  postalCode={postalCode}
                  radiusKm={radiusKm}
                  category={category as any}
                  propulsion={propulsion as any}
                  brand={brand}
                  leasingProvider={leasingProvider}
                  query={query}
                  dealerSlug={selectedDealerSlug}
                  totalOffersCount={totalOffers}
                />
              )}

              {/* Content depending on View Mode (Map or Bike Grid) */}
              {bikesViewMode === 'map' ? (
                <div className="mb-8">
                  <NearbyDealersMap
                    postalCode={postalCode}
                    setPostalCode={setPostalCode}
                    radiusKm={radiusKm}
                    setRadiusKm={setRadiusKm}
                    dealers={dealers}
                    onFilterByDealer={(dealerName) => {
                      setQuery(dealerName);
                      setBikesViewMode('grid');
                    }}
                    showHeader={true}
                  />
                </div>
              ) : (
                /* Grid of Bikes */
                loading ? (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
                      <div className="flex items-center gap-3">
                        <BikeLoadingSpinner size="sm" variant="emerald" showRoad={true} />
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            Fahrrad-Angebote werden geladen...
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Bestände und Verfügbarkeiten von autorisierten Fachhändlern werden abgeglichen
                          </p>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        <span>Bestandsabgleich läuft</span>
                      </div>
                    </div>
                    <OfferGridSkeleton count={8} />
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
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {(onlyFavorites ? offers.filter((o) => favoriteIds.includes(o.id)) : offers).map((offer) => (
                        <OfferCard
                          key={offer.id}
                          offer={offer}
                          onSelectOffer={setSelectedOffer}
                          onTrackOutbound={handleTrackOutbound}
                          onOpenLeadModal={setLeadOffer}
                          onCompareNotice={showToast}
                          onOpenDealer={(dealerSlug) => {
                            const d = dealers.find((x) => x.slug === dealerSlug);
                            if (d) setPartnerModalDealer(d);
                          }}
                        />
                      ))}
                    </div>

                    {/* Catalog Progress & Pagination Controls */}
                    {!onlyFavorites && totalOffers > 0 && (
                      <div className="mt-10 pt-8 border-t border-slate-200 space-y-5">
                        {/* Progress Bar & Counter Card */}
                        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                                <Layers className="w-3.5 h-3.5" />
                              </div>
                              <span>
                                Geladen: <strong className="text-slate-950 font-bold">{offers.length}</strong> von <strong className="text-slate-950 font-bold">{totalOffers.toLocaleString('de-DE')}</strong> Angeboten aus allen 361 verifizierten Händler-Websites
                              </span>
                            </div>
                            <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80 shrink-0 self-start sm:self-auto flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>{Math.min(100, Math.round((offers.length / totalOffers) * 100))}% des Bestands sichtbar</span>
                            </div>
                          </div>

                          {/* Progress Track */}
                          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 h-2.5 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, Math.max(3, (offers.length / totalOffers) * 100))}%` }}
                            />
                          </div>

                          {/* Load More & Show All Action Buttons */}
                          {offers.length < totalOffers && (
                            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
                              <button
                                id="btn-load-more-offers"
                                type="button"
                                onClick={handleLoadMore}
                                disabled={isLoadingMore}
                                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                              >
                                {isLoadingMore ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span>Nächste Angebote werden geladen...</span>
                                  </>
                                ) : (
                                  <>
                                    <Bike className="w-4 h-4" />
                                    <span>Mehr Angebote laden (+{Math.min(48, totalOffers - offers.length)})</span>
                                  </>
                                )}
                              </button>

                              <button
                                id="btn-show-all-offers"
                                type="button"
                                onClick={handleShowAllOffers}
                                disabled={isLoadingMore}
                                className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-emerald-50/50 active:bg-slate-100 text-slate-800 hover:text-emerald-700 text-xs font-bold rounded-xl border border-slate-300 hover:border-emerald-400 shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                              >
                                <Sparkles className="w-4 h-4 text-emerald-600" />
                                <span>Alle {totalOffers.toLocaleString('de-DE')} Angebote auf einmal anzeigen</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Pagination Bar & Items-per-Page Selector */}
                        {totalPages > 1 && (
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                            {/* Page size selector */}
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <span className="font-semibold text-slate-700">Pro Seite:</span>
                              {([48, 96] as const).map((sz) => (
                                <button
                                  key={sz}
                                  type="button"
                                  onClick={() => handleSetPageSize(sz)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                    pageSize === sz
                                      ? 'bg-slate-900 text-white shadow-2xs'
                                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                  }`}
                                >
                                  {sz}
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={handleShowAllOffers}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                  pageSize === 'all'
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                              >
                                Alle ({totalOffers.toLocaleString('de-DE')})
                              </button>
                            </div>

                            {/* Numbered Pagination Buttons (when paged) */}
                            {pageSize !== 'all' && (
                              <div className="flex items-center gap-1.5">
                                <button
                                  id="btn-prev-page"
                                  type="button"
                                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                  disabled={currentPage === 1}
                                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                  title="Vorherige Seite"
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                </button>

                                {paginationRange.map((p, idx) =>
                                  p === '...' ? (
                                    <span key={`dots-${idx}`} className="px-2 text-slate-400 text-xs select-none">
                                      ...
                                    </span>
                                  ) : (
                                    <button
                                      key={`page-${p}`}
                                      type="button"
                                      onClick={() => handlePageChange(p as number)}
                                      className={`min-w-[34px] h-8 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                        currentPage === p
                                          ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                                          : 'hover:bg-slate-100 text-slate-700'
                                      }`}
                                    >
                                      {p}
                                    </button>
                                  )
                                )}

                                <button
                                  id="btn-next-page"
                                  type="button"
                                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                  disabled={currentPage === totalPages}
                                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                  title="Nächste Seite"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )
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
            onOpenDealer={(dealerSlug) => {
              const d = dealers.find((x) => x.slug === dealerSlug);
              if (d) setPartnerModalDealer(d);
            }}
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
            postalCode={postalCode}
            setPostalCode={setPostalCode}
            radiusKm={radiusKm}
            setRadiusKm={setRadiusKm}
            onFilterByDealer={(dealerName) => {
              const matched = dealers.find((d) => d.name.toLowerCase() === dealerName.toLowerCase());
              if (matched) {
                setSelectedDealerSlug(matched.slug);
              } else {
                setQuery(dealerName);
              }
              setBikesViewMode('grid');
              setCurrentTab('bikes');
            }}
            onOpenPartnerModal={(dealer) => setPartnerModalDealer(dealer)}
            onApplyDealerSlugFilter={(dealerSlug) => {
              setSelectedDealerSlug(dealerSlug);
              setBikesViewMode('grid');
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
        onOpenDealer={(dealerSlug) => {
          const d = dealers.find((x) => x.slug === dealerSlug);
          if (d) setPartnerModalDealer(d);
        }}
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

      {/* Partner Dealer Inventory Modal */}
      <PartnerDealerModal
        dealer={partnerModalDealer}
        onClose={() => setPartnerModalDealer(null)}
        onSelectOffer={(offer) => {
          setPartnerModalDealer(null);
          setSelectedOffer(offer);
        }}
        onTrackOutbound={handleTrackOutbound}
        onOpenLeadModal={(offer) => {
          setPartnerModalDealer(null);
          setLeadOffer(offer);
        }}
        onApplyDealerFilterToMainCatalog={(dealerSlug) => {
          setSelectedDealerSlug(dealerSlug);
          setBikesViewMode('grid');
          setCurrentTab('bikes');
          setPartnerModalDealer(null);
          const matched = dealers.find((d) => d.slug === dealerSlug);
          showToast(`Hauptkatalog nach ${matched?.name || 'Partner-Händler'} gefiltert`);
        }}
        onCompareNotice={showToast}
      />
    </div>
  );
}
