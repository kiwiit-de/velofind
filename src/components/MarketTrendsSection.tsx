/**
 * VeloFind Market Trends & Regional Price Intelligence Component
 * Powered by Gemini 3.5 Flash AI
 * Analyzes live search results, dealer inventories, and price distributions in real-time.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  TrendingUp,
  Percent,
  Euro,
  Bike,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Info,
  MapPin,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { apiUrl } from '../lib/api.ts';
import type { BikeCategory, PropulsionType } from '../types.ts';

export interface MarketTrendStats {
  totalOffers: number;
  avgPrice: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  eBikeSharePercentage: number;
  topCategories: { category: string; count: number; share: number }[];
  topBrands: { brand: string; count: number; share: number }[];
  leasingCoveragePercentage: number;
  sampleModels: { title: string; price: number; brand: string }[];
}

export interface MarketTrendAnalysis {
  headline: string;
  summary: string;
  categoryTrend: string;
  priceInsight: string;
  keyTakeaways: string[];
  leasingTip: string;
}

export interface MarketTrendsResult {
  aiGenerated: boolean;
  model: string;
  regionName: string;
  searchFilterSummary: string;
  stats: MarketTrendStats;
  analysis: MarketTrendAnalysis;
}

interface MarketTrendsSectionProps {
  postalCode?: string;
  radiusKm?: number;
  category?: BikeCategory | 'ALL';
  propulsion?: PropulsionType | 'ALL';
  brand?: string;
  leasingProvider?: string;
  query?: string;
  dealerSlug?: string;
  totalOffersCount: number;
}

export const MarketTrendsSection: React.FC<MarketTrendsSectionProps> = ({
  postalCode,
  radiusKm = 50,
  category = 'ALL',
  propulsion = 'ALL',
  brand = 'ALL',
  leasingProvider = 'ALL',
  query = '',
  dealerSlug,
  totalOffersCount
}) => {
  const [data, setData] = useState<MarketTrendsResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const fetchTrends = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(apiUrl('/api/market-trends'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          postalCode: postalCode || undefined,
          radiusKm: radiusKm || 50,
          category: category !== 'ALL' ? category : undefined,
          propulsion: propulsion !== 'ALL' ? propulsion : undefined,
          brand: brand !== 'ALL' ? brand : undefined,
          provider: leasingProvider !== 'ALL' ? leasingProvider : undefined,
          query: query.trim() ? query.trim() : undefined,
          dealerSlug: dealerSlug || undefined
        })
      });

      if (!response.ok) {
        throw new Error(`Server status ${response.status}`);
      }

      const json = await response.json();
      setData(json);
    } catch (err: any) {
      console.error('Failed to fetch market trends:', err);
      setError('Marktanalyse konnte nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, [postalCode, radiusKm, category, propulsion, brand, leasingProvider, query, dealerSlug]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  // Don't render empty if there is an error and no previous data
  if (error && !data) {
    return (
      <div
        id="market-trends-error"
        className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs text-slate-600"
      >
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-400" />
          <span>Markttrends konnten vorübergehend nicht aktualisiert werden.</span>
        </div>
        <button
          id="btn-retry-market-trends"
          onClick={fetchTrends}
          className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl font-medium text-slate-800 transition-colors"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <section
      id="market-trends-section"
      aria-label="KI-Marktanalyse & Preis-Radar"
      className="mb-6 bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden transition-all"
    >
      {/* Header bar */}
      <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Markt-Trends & Preis-Radar
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                <Sparkles className="w-2.5 h-2.5" />
                {data?.aiGenerated ? 'Gemini AI Analyse' : 'Live-Bestandsanalyse'}
              </span>
            </div>
            <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>
                {data?.regionName || (postalCode ? `PLZ ${postalCode}` : 'Deutschlandweit')}
              </span>
              {data?.searchFilterSummary && data.searchFilterSummary !== 'Alle Kategorien & Marken' && (
                <>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300">{data.searchFilterSummary}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            id="btn-refresh-market-trends"
            onClick={fetchTrends}
            disabled={loading}
            className="p-1.5 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors"
            title="Marktanalyse mit aktuellen Filtern aktualisieren"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
          <button
            id="btn-toggle-collapse-trends"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            aria-expanded={!isCollapsed}
          >
            <span>{isCollapsed ? 'Details einblenden' : 'Einklappen'}</span>
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      {!isCollapsed && (
        <div className="p-5 space-y-5">
          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Metric 1: Average Price */}
            <div
              id="stat-avg-price"
              className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Durchschnittspreis</span>
                <Euro className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="text-lg font-bold text-slate-900">
                {loading && !data ? (
                  <span className="inline-block w-16 h-5 bg-slate-200 rounded animate-pulse" />
                ) : (
                  `${data?.stats.avgPrice.toLocaleString('de-DE')} €`
                )}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {data ? `Median: ${data.stats.medianPrice.toLocaleString('de-DE')} €` : 'Berechnung läuft...'}
              </div>
            </div>

            {/* Metric 2: E-Bike Share */}
            <div
              id="stat-ebike-share"
              className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-emerald-700 text-xs mb-1">
                <span>E-Bike-Anteil</span>
                <Percent className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-lg font-bold text-emerald-950">
                {loading && !data ? (
                  <span className="inline-block w-12 h-5 bg-emerald-200 rounded animate-pulse" />
                ) : (
                  `${data?.stats.eBikeSharePercentage}%`
                )}
              </div>
              <div className="text-[11px] text-emerald-700/80 mt-1">
                Elektrifizierte Antriebe
              </div>
            </div>

            {/* Metric 3: Top Category */}
            <div
              id="stat-top-category"
              className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Beliebteste Kategorie</span>
                <Bike className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="text-sm font-bold text-slate-900 truncate">
                {loading && !data ? (
                  <span className="inline-block w-20 h-5 bg-slate-200 rounded animate-pulse" />
                ) : (
                  data?.stats.topCategories[0]?.category.replace('_', '-') || 'Vielseitig'
                )}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {data?.stats.topCategories[0]
                  ? `${data.stats.topCategories[0].share}% des lokalen Bestands`
                  : 'Ausgewogenes Sortiment'}
              </div>
            </div>

            {/* Metric 4: Leasing Coverage */}
            <div
              id="stat-leasing-coverage"
              className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-amber-800 text-xs mb-1">
                <span>Dienstrad-Leasing</span>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-lg font-bold text-amber-950">
                {loading && !data ? (
                  <span className="inline-block w-12 h-5 bg-amber-200 rounded animate-pulse" />
                ) : (
                  `${data?.stats.leasingCoveragePercentage}%`
                )}
              </div>
              <div className="text-[11px] text-amber-800/80 mt-1">
                JobRad & Bikeleasing fähig
              </div>
            </div>
          </div>

          {/* AI Narrative Analysis */}
          {loading && !data ? (
            <div className="space-y-3 py-3 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-full" />
              <div className="h-3 bg-slate-100 rounded w-5/6" />
            </div>
          ) : data ? (
            <div className="space-y-4">
              {/* Executive Headline & Summary */}
              <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-xl">
                <h3 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{data.analysis.headline}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {data.analysis.summary}
                </p>
              </div>

              {/* Two Column Deep Dive: Category Trends & Price/Leasing Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Trends Card */}
                <div
                  id="card-category-trend"
                  className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-2xs"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <Bike className="w-4 h-4 text-emerald-600" />
                    <span>Kategorie- & Modell-Trends</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {data.analysis.categoryTrend}
                  </p>

                  {/* Top categories tags */}
                  {data.stats.topCategories.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {data.stats.topCategories.slice(0, 4).map((cat) => (
                        <span
                          key={cat.category}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-medium rounded-md flex items-center gap-1"
                        >
                          <Tag className="w-2.5 h-2.5 text-slate-400" />
                          <span>{cat.category.replace('_', '-')}: {cat.share}%</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price Radar & Leasing Tip Card */}
                <div
                  id="card-price-insight"
                  className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-2xs"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <Euro className="w-4 h-4 text-emerald-600" />
                    <span>Preistrend & Leasing-Vorteil</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {data.analysis.priceInsight}
                  </p>

                  {/* Leasing Tip banner */}
                  <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-lg text-xs text-emerald-900 leading-relaxed">
                    <div className="font-semibold text-emerald-950 flex items-center gap-1.5 mb-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Dienstrad-Ersparnis-Tipp:</span>
                    </div>
                    {data.analysis.leasingTip}
                  </div>
                </div>
              </div>

              {/* 3 Key Takeaways */}
              {data.analysis.keyTakeaways && data.analysis.keyTakeaways.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                    Wichtigste Markterkenntnisse auf einen Blick:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {data.analysis.keyTakeaways.map((takeaway, idx) => (
                      <div
                        key={idx}
                        id={`takeaway-item-${idx}`}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2 text-xs text-slate-700"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{takeaway}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
};
