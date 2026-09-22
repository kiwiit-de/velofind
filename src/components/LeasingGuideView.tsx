import React, { useState } from 'react';
import { ShieldCheck, Calculator, ArrowRight, CheckCircle2, HelpCircle, FileText, Info } from 'lucide-react';
import { LeasingProvider } from '../types';
import { LeasingProviderLogo } from './LeasingProviderLogo';

interface LeasingGuideViewProps {
  providers: LeasingProvider[];
  onSelectProvider: (slug: string) => void;
}

export const LeasingGuideView: React.FC<LeasingGuideViewProps> = ({
  providers,
  onSelectProvider
}) => {
  const [bikePrice, setBikePrice] = useState(3500);
  const [grossIncome, setGrossIncome] = useState(3800);

  // Simplified estimation of gross deduction savings (~35%)
  const estimatedMonthlyGross = Math.round((bikePrice / 36) * 1.08);
  const estimatedMonthlyNetCost = Math.round(estimatedMonthlyGross * 0.62);
  const totalNetCostOver3Years = estimatedMonthlyNetCost * 36;
  const buyoutEstimate = Math.round(bikePrice * 0.18);
  const totalEffectiveCost = totalNetCostOver3Years + buyoutEstimate;
  const estimatedSavingsEuro = Math.max(0, bikePrice - totalEffectiveCost);
  const savingsPercent = Math.round((estimatedSavingsEuro / bikePrice) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
            <ShieldCheck className="w-4 h-4" />
            <span>0,25%-Regel nach § 3 Nr. 37 EStG</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Dienstrad-Leasing in Deutschland verstehen & sparen
          </h1>
          <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
            Über die Gehaltsumwandlung sparen Arbeitnehmer und Selbstständige bis zu 40% gegenüber dem regulären Barkauf. Entdecken Sie hier alle autorisierten Partner und berechnen Sie Ihre Ersparnis.
          </p>
        </div>
      </div>

      {/* Interactive Savings Estimator */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2.5 mb-6">
          <Calculator className="w-6 h-6 text-emerald-600" />
          <h2 className="text-xl font-bold text-slate-900">Beispielrechnung & Ersparnis-Simulator</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sliders Input */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex justify-between text-sm font-semibold text-slate-800 mb-2">
                <span>Fahrrad / E-Bike Kaufpreis (UVP)</span>
                <span className="text-emerald-700 font-bold">{bikePrice.toLocaleString('de-DE')} €</span>
              </div>
              <input
                type="range"
                min={1000}
                max={9000}
                step={100}
                value={bikePrice}
                onChange={(e) => setBikePrice(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>1.000 €</span>
                <span>5.000 €</span>
                <span>9.000 €</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm font-semibold text-slate-800 mb-2">
                <span>Monatliches Bruttogehalt (Richtwert)</span>
                <span className="text-slate-900 font-bold">{grossIncome.toLocaleString('de-DE')} €</span>
              </div>
              <input
                type="range"
                min={2000}
                max={8000}
                step={100}
                value={grossIncome}
                onChange={(e) => setGrossIncome(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>2.000 €</span>
                <span>5.000 €</span>
                <span>8.000 €</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-2">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Berechnungsgrundlage: 36 Monate Laufzeit, steuerliche 0,25%-Geldwerter-Vorteil-Versteuerung, geschätzte Restwertübernahme ca. 18%.
                </span>
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="lg:col-span-6 bg-slate-900 text-white rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">Geschätzter Nettoaufwand</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold">ca. {estimatedMonthlyNetCost} €</span>
                <span className="text-slate-400 text-sm">/ Monat</span>
              </div>
              <p className="text-xs text-slate-300">
                Tatsächliche monatliche Netto-Gehaltsbelastung statt einmaliger Barkaufzahlung von {bikePrice.toLocaleString('de-DE')} €.
              </p>

              <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-400 block">Gesamtersparnis ca.</span>
                  <span className="text-xl font-bold text-emerald-400">{estimatedSavingsEuro.toLocaleString('de-DE')} €</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Prozentualer Vorteil</span>
                  <span className="text-xl font-bold text-emerald-400">~ {savingsPercent}%</span>
                </div>
              </div>
            </div>

            <div className="mt-6 text-[11px] text-slate-400">
              * Unverbindliche Beispielrechnung. Die tatsächliche Rate ermittelt Ihr Arbeitgeber oder der Dienstrad-Rechner des jeweiligen Anbieters.
            </div>
          </div>
        </div>
      </div>

      {/* Provider Profiles Grid */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Unterstützte Dienstrad-Leasing Partner in Deutschland
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map(p => (
            <div
              key={p.slug}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-emerald-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <LeasingProviderLogo slug={p.slug} name={p.name} size="md" />
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">{p.name}</h3>
                      <span className="text-[11px] text-slate-400">Autorisierter Partner</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-md">
                    Aktiv
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {p.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={p.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 underline"
                >
                  Zur Anbieter-Website
                </a>
                <button
                  onClick={() => onSelectProvider(p.slug)}
                  className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <span>Angebote filtern</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
