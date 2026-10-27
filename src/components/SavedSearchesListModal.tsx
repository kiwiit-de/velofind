import React, { useState, useEffect } from 'react';
import { Bell, Trash2, X, ExternalLink, RefreshCw, CheckCircle2, Clock, Mail, Search, Bike } from 'lucide-react';
import { SavedSearch } from '../types';
import { apiUrl } from '../lib/api';

interface SavedSearchesListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  onNotice: (msg: string) => void;
}

export const SavedSearchesListModal: React.FC<SavedSearchesListModalProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  onNotice
}) => {
  const [emailInput, setEmailInput] = useState(() => {
    try {
      return localStorage.getItem('velofind_user_email') || '';
    } catch {
      return '';
    }
  });
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasQueried, setHasQueried] = useState(false);

  const fetchSearches = async (email: string) => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/saved-searches?email=${encodeURIComponent(email.trim().toLowerCase())}`));
      if (res.ok) {
        const data = await res.json();
        setSearches(data.searches || []);
        setHasQueried(true);
        try {
          localStorage.setItem('velofind_user_email', email.trim().toLowerCase());
        } catch {}
      }
    } catch (err) {
      console.error('Fetch saved searches failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && emailInput) {
      fetchSearches(emailInput);
    }
  }, [isOpen]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(apiUrl(`/api/saved-searches/${id}`), { method: 'DELETE' });
      if (res.ok) {
        setSearches((prev) => prev.filter((s) => s.id !== id));
        onNotice('Suchagent erfolgreich gelöscht');
      }
    } catch (err) {
      console.error('Failed to delete saved search:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold mb-2">
            <Bell className="w-3.5 h-3.5" />
            <span>Meine Suchagenten</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Verwalte deine gespeicherten Suchaufträge
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Überprüfe Treffer oder lösche Suchaufträge, die du nicht mehr benötigst.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Email query field if not loaded */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchSearches(emailInput);
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Deine E-Mail-Adresse eingeben..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              {loading ? 'Laden...' : 'Suchen'}
            </button>
          </form>

          {/* List of Searches */}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {searches.length > 0 ? (
              searches.map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-emerald-300 transition-colors flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-bold text-sm text-slate-900">{s.title}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                        {s.frequency === 'INSTANT' ? 'Sofort-Alert' : s.frequency}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {s.filter_summary}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Erstellt am {new Date(s.created_at).toLocaleDateString('de-DE')}
                      </span>
                      {s.new_matches_count !== undefined && s.new_matches_count > 0 && (
                        <span className="font-bold text-emerald-700">
                          +{s.new_matches_count} neue Treffer
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => {
                        onApplyFilters(s.filters);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Im Katalog anzeigen</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(s.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Suchagent löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : hasQueried ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                Keine gespeicherten Suchagenten unter dieser E-Mail-Adresse gefunden.
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                Gib deine E-Mail-Adresse ein, um deine aktiven Suchagenten anzuzeigen.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
