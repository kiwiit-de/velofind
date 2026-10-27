import React, { useState } from 'react';
import { Bell, Check, X, Sparkles, Bike, ShieldCheck, Mail, SlidersHorizontal, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiUrl } from '../lib/api';

interface SaveSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilters: {
    query?: string;
    category?: string;
    propulsion?: string;
    brand?: string;
    motorBrand?: string;
    engineType?: string;
    frameType?: string;
    maxWeight?: number;
    minTorque?: number;
    minPrice?: number;
    maxPrice?: number;
    leasingProvider?: string;
    postalCode?: string;
    radiusKm?: number;
  };
  totalMatches: number;
  onSuccessNotice: (msg: string) => void;
}

export const SaveSearchModal: React.FC<SaveSearchModalProps> = ({
  isOpen,
  onClose,
  activeFilters,
  totalMatches,
  onSuccessNotice
}) => {
  const [email, setEmail] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [frequency, setFrequency] = useState<'INSTANT' | 'DAILY' | 'WEEKLY'>('INSTANT');
  const [notifyOnNew, setNotifyOnNew] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Build a human-readable summary of active filter criteria
  const activeTags: string[] = [];
  if (activeFilters.query) activeTags.push(`Suchbegriff: „${activeFilters.query}“`);
  if (activeFilters.category && activeFilters.category !== 'ALL') activeTags.push(`Kategorie: ${activeFilters.category}`);
  if (activeFilters.propulsion && activeFilters.propulsion !== 'ALL') activeTags.push(`Antrieb: ${activeFilters.propulsion}`);
  if (activeFilters.brand && activeFilters.brand !== 'ALL') activeTags.push(`Marke: ${activeFilters.brand}`);
  if (activeFilters.motorBrand && activeFilters.motorBrand !== 'ALL') activeTags.push(`Motor: ${activeFilters.motorBrand}`);
  if (activeFilters.engineType && activeFilters.engineType !== 'ALL') {
    const label = activeFilters.engineType === 'MITTELMOTOR' ? 'Mittelmotor' : activeFilters.engineType === 'HECKMOTOR' ? 'Heckmotor' : activeFilters.engineType;
    activeTags.push(`Motortyp: ${label}`);
  }
  if (activeFilters.frameType && activeFilters.frameType !== 'ALL') {
    const label = activeFilters.frameType === 'DIAMOND' ? 'Diamant / Herren' : activeFilters.frameType === 'TRAPEZE' ? 'Trapez' : activeFilters.frameType === 'WAVE' ? 'Tiefeinsteiger / Wave' : activeFilters.frameType;
    activeTags.push(`Rahmen: ${label}`);
  }
  if (activeFilters.minTorque && activeFilters.minTorque > 0) activeTags.push(`ab ${activeFilters.minTorque} Nm`);
  if (activeFilters.maxWeight && activeFilters.maxWeight > 0) activeTags.push(`bis ${activeFilters.maxWeight} kg`);
  if (activeFilters.minPrice || activeFilters.maxPrice) {
    if (activeFilters.minPrice && activeFilters.maxPrice) activeTags.push(`${activeFilters.minPrice} € – ${activeFilters.maxPrice} €`);
    else if (activeFilters.minPrice) activeTags.push(`ab ${activeFilters.minPrice} €`);
    else if (activeFilters.maxPrice) activeTags.push(`bis ${activeFilters.maxPrice} €`);
  }
  if (activeFilters.leasingProvider && activeFilters.leasingProvider !== 'ALL') activeTags.push(`Leasing: ${activeFilters.leasingProvider}`);
  if (activeFilters.postalCode) activeTags.push(`PLZ: ${activeFilters.postalCode} (+${activeFilters.radiusKm || 50} km)`);

  const summaryString = activeTags.length > 0 ? activeTags.join(' • ') : 'Alle aktuellen Angebote deutschlandweit';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMessage('Bitte gib eine gültige E-Mail-Adresse ein.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(apiUrl('/api/saved-searches'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          title: customTitle.trim() || summaryString,
          filters: activeFilters,
          filterSummary: summaryString,
          matchCountAtSave: totalMatches,
          notifyOnNew,
          frequency
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Suchagent konnte nicht gespeichert werden');
      }

      const data = await res.json();
      onSuccessNotice(data.message || 'Suchagent erfolgreich aktiviert!');
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Ein Fehler ist aufgetreten.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold mb-2">
            <Bell className="w-3.5 h-3.5" />
            <span>VeloFind Suchagent</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Suchauftrag kostenlos speichern
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Werde sofort benachrichtigt, sobald ein Fachhändler ein passendes Fahrrad einstellt.
          </p>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Active Criteria Box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                <span>Gespeicherte Kriterien ({activeTags.length || 1})</span>
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                {totalMatches} {totalMatches === 1 ? 'aktueller Treffer' : 'aktuelle Treffer'}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {activeTags.length > 0 ? (
                activeTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-slate-800 border border-slate-200 shadow-2xs"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">Gesamter Deutschland-Katalog</span>
              )}
            </div>
          </div>

          {/* Custom Name (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Name des Suchauftrags (Optional)
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="z. B. Mein Traum-Gravelbike oder E-MTB Fully"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900"
            />
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Deine E-Mail-Adresse für Benachrichtigungen *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="beispiel@domain.de"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Kein Spam. Ausschließlich Benachrichtigungen bei neuen passenden Händlerangeboten. Jederzeit mit 1 Klick abbestellbar.
            </p>
          </div>

          {/* Notification Frequency */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Benachrichtigungs-Intervall
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'INSTANT', label: 'Sofort', desc: 'Bei neuem Rad' },
                { id: 'DAILY', label: 'Täglich', desc: '1x Zusammenfassung' },
                { id: 'WEEKLY', label: 'Wöchentlich', desc: 'Wochen-Digest' }
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setFrequency(item.id as any)}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    frequency === item.id
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold text-xs">{item.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Toggle */}
          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="notify-toggle"
              checked={notifyOnNew}
              onChange={(e) => setNotifyOnNew(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
            />
            <label htmlFor="notify-toggle" className="text-xs text-slate-700 cursor-pointer select-none">
              E-Mail senden, wenn neue passende Fahrräder vor Ort eingestellt werden
            </label>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Wird gespeichert...</span>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  <span>Suchagent aktivieren</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
