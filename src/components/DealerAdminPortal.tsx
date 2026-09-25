import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  MessageSquare,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Eye,
  Sliders,
  Database,
  Zap,
  Bell,
  Mail,
  ArrowDownRight,
  Sparkles,
  X,
  Globe
} from 'lucide-react';
import { Dealer, Lead, ImportRun, OverviewStats } from '../types';
import { apiUrl } from '../lib/api';

interface DealerAdminPortalProps {
  dealers: Dealer[];
  onRefreshData: () => void;
}

const SAMPLE_FEEDS = {
  standard: `external_id,brand,model,model_year,category,propulsion,manufacturer_sku,gtin,frame_size,frame_type,color,wheel_size_in,weight_kg,battery_wh,motor_brand,motor_model,torque_nm,title,price,compare_at_price,currency,availability,quantity,condition,source_url,image_url
STADLER-CAN-01,Canyon,Grizl:ON CF 9,2025,GRAVEL,PEDELEC,CAN-GRIZL-9,4011223344556,M,DIAMOND,Carbon/Sand,28,15.2,400,Bosch,Performance Line SX,55,Canyon Grizl:ON CF 9 - E-Gravel,4999.00,5499.00,EUR,IN_STOCK,2,NEW,https://shop.zweirad-stadler.de/canyon-grizl-on,https://images.unsplash.com/photo-1485965120184-e220f721d03e
STADLER-CUBE-02,Cube,Kathmandu Hybrid Pro 750,2025,TREKKING,PEDELEC,CUBE-KATH-750,4055667788990,L,TRAPEZE,Swampgrey'n'black,28,26.4,750,Bosch,Performance Line CX,85,Cube Kathmandu Hybrid Pro 750 Wave,3699.00,3899.00,EUR,IN_STOCK,4,NEW,https://shop.zweirad-stadler.de/cube-kathmandu-750,https://images.unsplash.com/photo-1576435728678-68d0fbf94e91
STADLER-RND-03,Riese & Müller,Load4 75,2025,CARGO,PEDELEC,RM-LOAD4-75,4099887766554,ONE_SIZE,CARGO,Coal Grey Matt,26,38.5,1450,Bosch,Cargo Line,85,Riese & Müller Load4 75 DualBattery,7890.00,,EUR,IN_STOCK,1,NEW,https://shop.zweirad-stadler.de/rm-load-75,https://images.unsplash.com/photo-1532298229144-0ec0c57515c7`,

  priceReduction: `external_id,brand,model,model_year,category,propulsion,manufacturer_sku,gtin,frame_size,frame_type,color,wheel_size_in,weight_kg,battery_wh,motor_brand,motor_model,torque_nm,title,price,compare_at_price,currency,availability,quantity,condition,source_url,image_url
STADLER-CAN-01,Canyon,Grizl:ON CF 9,2025,GRAVEL,PEDELEC,CAN-GRIZL-9,4011223344556,M,DIAMOND,Carbon/Sand,28,15.2,400,Bosch,Performance Line SX,55,Canyon Grizl:ON CF 9 - E-Gravel (Reduziert!),4499.00,5499.00,EUR,IN_STOCK,2,NEW,https://shop.zweirad-stadler.de/canyon-grizl-on,https://images.unsplash.com/photo-1485965120184-e220f721d03e`,

  withBadRow: `external_id,brand,model,model_year,category,propulsion,manufacturer_sku,gtin,frame_size,frame_type,color,wheel_size_in,weight_kg,battery_wh,motor_brand,motor_model,torque_nm,title,price,compare_at_price,currency,availability,quantity,condition,source_url,image_url
STADLER-ORB-04,Orbea,Wild M-Team,2025,MTB,PEDELEC,ORB-WILD-MT,4077889900112,M,DIAMOND,Bordeaux/Titanium,29,22.1,750,Bosch,Performance Line CX-R,85,Orbea Wild M-Team Enduro E-MTB,8999.00,,EUR,IN_STOCK,1,NEW,https://shop.zweirad-stadler.de/orbea-wild,https://images.unsplash.com/photo-1507035895480-2b3156c31fc8
BAD-ROW-MISSING-PRICE,Ghost,E-Teru Pro,2025,MTB,PEDELEC,GH-123,,L,DIAMOND,Black,,,,,Ghost E-Teru Pro,KEIN_PREIS,,EUR,IN_STOCK,1,NEW,https://shop.zweirad-stadler.de/ghost,`
};

export const DealerAdminPortal: React.FC<DealerAdminPortalProps> = ({
  dealers,
  onRefreshData
}) => {
  const [selectedDealerId, setSelectedDealerId] = useState<string>(dealers[0]?.id || 'd-stadler-berlin');
  const [csvContent, setCsvContent] = useState<string>(SAMPLE_FEEDS.standard);
  const [importing, setImporting] = useState<boolean>(false);
  const [importReport, setImportReport] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'import' | 'scraper' | 'leads' | 'audit' | 'simulate'>('import');

  // Deep Scraper State
  const [scraperProgress, setScraperProgress] = useState<any>(null);
  const [scraperRunning, setScraperRunning] = useState<boolean>(false);
  const [scraperMessage, setScrapeMessage] = useState<string | null>(null);

  const fetchScraperStatus = async () => {
    try {
      const res = await fetch(apiUrl('/api/scraper/status'));
      if (res.ok) {
        const data = await res.json();
        setScraperProgress(data.progress);
        setScraperRunning(data.progress?.isRunning || false);
      }
    } catch (e) {
      console.error('Failed to fetch scraper status:', e);
    }
  };

  const handleStartCrawler = async (maxSites?: number) => {
    setScraperRunning(true);
    setScrapeMessage('Starte Tiefenscraping aller Händler-Websites...');
    try {
      const res = await fetch(apiUrl('/api/scraper/trigger'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxSites })
      });
      const data = await res.json();
      setScrapeMessage(data.message || 'Scraper aktiv.');
      fetchScraperStatus();
      onRefreshData();
    } catch (err: any) {
      setScrapeMessage(`Fehler beim Start: ${err.message}`);
      setScraperRunning(false);
    }
  };

  const handleScrapeCurrentDealer = async () => {
    if (!selectedDealerId) return;
    setScraperRunning(true);
    setScrapeMessage(`Scrappe Website für ${currentDealer.name}...`);
    try {
      const res = await fetch(apiUrl(`/api/scraper/dealer/${selectedDealerId}`), {
        method: 'POST'
      });
      const data = await res.json();
      const count = data.result?.offersFound || 0;
      setScrapeMessage(`Erfolgreich abgeschlossen: ${count} Angebote & E-Bikes von ${currentDealer.name} synchronisiert.`);
      onRefreshData();
      fetchPortalData();
    } catch (err: any) {
      setScrapeMessage(`Fehler: ${err.message}`);
    } finally {
      setScraperRunning(false);
    }
  };

  // Stats & Leads states
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Dev Alert Simulation States
  const [showSimulateModal, setShowSimulateModal] = useState<boolean>(false);
  const [dealerOffers, setDealerOffers] = useState<any[]>([]);
  const [targetOfferId, setTargetOfferId] = useState<string>('');
  const [dropPercent, setDropPercent] = useState<number>(15);
  const [testEmail, setTestEmail] = useState<string>('dev-tester@velofind.de');
  const [createTestSubscriberFirst, setCreateTestSubscriberFirst] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [simulationError, setSimulationError] = useState<string | null>(null);
  const [loadingOffers, setLoadingOffers] = useState<boolean>(false);

  const currentDealer = dealers.find(d => d.id === selectedDealerId) || dealers[0];

  const fetchDealerOffers = async () => {
    setLoadingOffers(true);
    try {
      const res = await fetch(apiUrl(`/api/search?dealerId=${selectedDealerId}&limit=25`));
      if (res.ok) {
        const data = await res.json();
        if (data.offers && data.offers.length > 0) {
          setDealerOffers(data.offers);
          setTargetOfferId((prev) => prev && data.offers.some((o: any) => o.id === prev) ? prev : data.offers[0].id);
          setLoadingOffers(false);
          return;
        }
      }
      // Fallback if specific dealer has no direct offers in current filter
      const fallbackRes = await fetch(apiUrl('/api/search?limit=20'));
      if (fallbackRes.ok) {
        const fbData = await fallbackRes.json();
        setDealerOffers(fbData.offers || []);
        if (fbData.offers?.length > 0) {
          setTargetOfferId((prev) => prev && fbData.offers.some((o: any) => o.id === prev) ? prev : fbData.offers[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load dealer offers for simulation:', err);
    } finally {
      setLoadingOffers(false);
    }
  };

  const fetchPortalData = async () => {
    try {
      const [statsRes, leadsRes, auditRes] = await Promise.all([
        fetch(apiUrl('/api/admin/overview')),
        fetch(apiUrl(`/api/admin/leads?dealer_id=${selectedDealerId}`)),
        fetch(apiUrl('/api/admin/audit-logs'))
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (leadsRes.ok) setLeads(await leadsRes.json());
      if (auditRes.ok) setAuditLogs(await auditRes.json());
    } catch (err) {
      console.error('Failed to load portal data:', err);
    }
  };

  useEffect(() => {
    fetchPortalData();
    fetchDealerOffers();
  }, [selectedDealerId]);

  const handleTriggerSimulateDrop = async () => {
    const offerIdToUse = targetOfferId || dealerOffers[0]?.id;
    if (!offerIdToUse) {
      setSimulationError('Kein Fahrrad-Angebot ausgewählt. Bitte wähle ein Rad oder gib eine gültige ID an.');
      return;
    }

    setIsSimulating(true);
    setSimulationError(null);
    setSimulationResult(null);

    try {
      // 1. Optional: Ensure an active alert subscriber exists so the email notification flow triggers
      if (createTestSubscriberFirst && testEmail.trim()) {
        try {
          await fetch(apiUrl('/api/alerts'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              offerId: offerIdToUse,
              email: testEmail.trim().toLowerCase()
            })
          });
        } catch (subErr) {
          console.warn('Subscription step warning (continuing with drop):', subErr);
        }
      }

      // 2. Invoke POST /api/alerts/simulate-drop
      const res = await fetch(apiUrl('/api/alerts/simulate-drop'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId: offerIdToUse,
          dropPercent: Number(dropPercent) || 10
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Fehler beim Ausführen von POST /api/alerts/simulate-drop');
      }

      setSimulationResult(data);
      onRefreshData();
      fetchPortalData();
      fetchDealerOffers();
    } catch (err: any) {
      setSimulationError(err.message || 'Simulation fehlgeschlagen');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleRunImport = async () => {
    setImporting(true);
    setImportReport(null);

    try {
      const res = await fetch(apiUrl('/api/dealers/import-feed'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealer_id: selectedDealerId,
          csv_content: csvContent
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Import fehlgeschlagen');
      }

      setImportReport(data.report);
      onRefreshData();
      fetchPortalData();
    } catch (err: any) {
      alert(`Fehler: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch(apiUrl(`/api/admin/leads/${leadId}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchPortalData();
      }
    } catch (err) {
      console.error('Failed to update lead status:', err);
    }
  };

  const selectedOffer = dealerOffers.find((o) => o.id === targetOfferId) || dealerOffers[0];
  const currentPriceCents = selectedOffer?.price_cents || 439900;
  const simulatedNewPriceCents = Math.round(currentPriceCents * (1 - (Number(dropPercent) || 10) / 100));
  const simulatedSavingsCents = currentPriceCents - simulatedNewPriceCents;

  const renderSimulationContent = () => (
    <div className="space-y-6">
      <div className="bg-amber-50/60 border border-amber-200/70 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
          <Zap className="w-5 h-5 text-amber-600" />
        </div>
        <div className="text-xs text-amber-950 space-y-1">
          <div className="font-bold text-sm text-amber-900 flex items-center gap-2">
            <span>Entwickler-Testflow: POST /api/alerts/simulate-drop</span>
            <span className="px-1.5 py-0.5 text-[10px] font-black bg-amber-200 text-amber-900 rounded">DEV ONLY</span>
          </div>
          <p className="text-amber-800 leading-relaxed">
            Mit diesem Entwicklungswerkzeug reduzierst du kontrolliert den Preis eines Fahrrad-Angebots um einen gewählten Prozentsatz.
            Der Backend-Dienst <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono text-[11px]">PriceAlertService</code> gleicht die <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono text-[11px]">user_alerts</code>-Tabelle ab, stößt den E-Mail-Versand an und hinterlegt ein unveränderliches Audit-Event im Protokoll.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Offer selection & percentage */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              1. Fahrrad-Angebot auswählen
            </label>
            {loadingOffers ? (
              <div className="text-xs text-slate-400 py-2 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                <span>Lade Angebote...</span>
              </div>
            ) : dealerOffers.length > 0 ? (
              <select
                id="dev-select-offer-dropdown"
                value={targetOfferId || dealerOffers[0]?.id}
                onChange={(e) => setTargetOfferId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                {dealerOffers.map((offer) => (
                  <option key={offer.id} value={offer.id}>
                    {offer.title} — €{(offer.price_cents / 100).toFixed(2)}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-slate-500">Keine Angebote für diesen Händler gefunden.</p>
            )}

            <div className="mt-2 flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Oder Angebots-UUID manuell eingeben:</span>
            </div>
            <input
              id="dev-input-offer-id"
              type="text"
              value={targetOfferId}
              onChange={(e) => setTargetOfferId(e.target.value)}
              placeholder="UUID des Angebots (z.B. d89c3c88-...)"
              className="mt-1 w-full text-xs font-mono p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Current & Projected Price Preview */}
          {selectedOffer && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-800 truncate">{selectedOffer.title}</div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Aktueller Angebotspreis:</span>
                <span className="font-mono font-bold text-slate-900">
                  €{(currentPriceCents / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-emerald-700">
                <span>Neuer Preis nach Reduzierung:</span>
                <span className="font-mono font-bold text-emerald-700">
                  €{(simulatedNewPriceCents / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500 border-t border-slate-200/80 pt-2 text-[11px]">
                <span>Ersparnis für Kunden:</span>
                <span className="font-mono font-semibold text-emerald-600">
                  -€{(simulatedSavingsCents / 100).toFixed(2)} (-{dropPercent}%)
                </span>
              </div>
            </div>
          )}

          {/* Percentage selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              2. Preissenkung (%) festlegen
            </label>
            <div className="flex items-center gap-1.5 mb-2">
              {[5, 10, 15, 20, 30].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setDropPercent(pct)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors ${
                    dropPercent === pct
                      ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  -{pct}%
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                id="dev-input-drop-percent"
                type="number"
                min="1"
                max="90"
                value={dropPercent}
                onChange={(e) => setDropPercent(Math.max(1, Math.min(90, Number(e.target.value) || 10)))}
                className="w-24 text-xs font-mono p-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-xs text-slate-500">% Preiserlass</span>
            </div>
          </div>
        </div>

        {/* Right Column: Email Subscriber Setup & Action */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                3. Test-Empfänger für E-Mail-Notification
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  id="dev-input-test-email"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                E-Mail-Adresse für die Preissenkungs-Benachrichtigung.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  id="dev-checkbox-create-subscriber"
                  type="checkbox"
                  checked={createTestSubscriberFirst}
                  onChange={(e) => setCreateTestSubscriberFirst(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
                />
                <div className="text-xs text-slate-700">
                  <span className="font-semibold block text-slate-900">
                    Vorab Test-Abonnent für dieses Rad anlegen
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Registriert die E-Mail als aktiven Beobachter (<code className="font-mono text-[10px]">POST /api/alerts</code>), falls noch kein Alert existiert, sodass mindestens 1 E-Mail-Notification dispatched wird.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-2">
            <button
              id="btn-trigger-simulate-drop"
              type="button"
              onClick={handleTriggerSimulateDrop}
              disabled={isSimulating || (!targetOfferId && dealerOffers.length === 0)}
              className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sende POST /api/alerts/simulate-drop...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Preissenkung jetzt simulieren (POST /api/alerts/simulate-drop)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error display */}
      {simulationError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-red-900">Fehler beim Ausführen der Simulation:</div>
            <p className="mt-0.5">{simulationError}</p>
          </div>
        </div>
      )}

      {/* Result Console */}
      {simulationResult && (
        <div className="p-5 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-sm">Preissenkungssimulation erfolgreich ausgeführt!</span>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 rounded">
              HTTP 200 OK
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
              <span className="text-slate-500 text-[11px] block">Vorheriger Preis</span>
              <span className="font-bold text-slate-900 text-sm font-mono mt-0.5 block">
                €{(simulationResult.oldPriceCents / 100).toFixed(2)}
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
              <span className="text-slate-500 text-[11px] block">Neuer Preis</span>
              <span className="font-bold text-emerald-600 text-sm font-mono mt-0.5 block">
                €{(simulationResult.newPriceCents / 100).toFixed(2)}
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
              <span className="text-slate-500 text-[11px] block">Ersparnis</span>
              <span className="font-bold text-emerald-700 text-sm font-mono mt-0.5 block">
                €{((simulationResult.oldPriceCents - simulationResult.newPriceCents) / 100).toFixed(2)}
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
              <span className="text-slate-500 text-[11px] block">Dispatched Mails</span>
              <span className="font-bold text-amber-600 text-sm font-mono mt-0.5 block">
                {simulationResult.notificationsSent} {simulationResult.notificationsSent === 1 ? 'Empfänger' : 'Empfänger'}
              </span>
            </div>
          </div>

          {/* Detailed Notifications list */}
          {simulationResult.notifications && simulationResult.notifications.length > 0 ? (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Ausgelöste E-Mail-Benachrichtigungen:
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {simulationResult.notifications.map((n: any, idx: number) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900">{n.email}</span>
                        <span className="text-[11px] text-slate-500 ml-2 font-mono">Alert-ID: {n.alertId.slice(0, 8)}...</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-emerald-700 font-semibold font-mono">
                        Ersparnis: €{(n.savingsCents / 100).toFixed(2)}
                      </span>
                      <span className="text-slate-400">
                        {new Date(n.notifiedAt).toLocaleTimeString('de-DE')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
              ℹ️ Für dieses Rad war noch kein aktiver Alert eingerichtet (oder Target-Price wurde nicht unterschritten). Aktiviere die Checkbox &quot;Vorab Test-Abonnent anlegen&quot; für automatische Auslösung.
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-emerald-200/60 text-xs">
            <span className="text-slate-600">
              Audit-Event <code className="bg-white px-1.5 py-0.5 rounded text-slate-800 font-mono text-[11px]">USER_ALERT_TRIGGERED</code> wurde im Audit-Trail hinterlegt.
            </span>
            <button
              type="button"
              onClick={() => {
                setShowSimulateModal(false);
                setActiveTab('audit');
              }}
              className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 underline"
            >
              <span>Zum Audit-Protokoll</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dealer Switcher & Tenancy Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded">
              HÄNDLER-PORTAL
            </span>
            <span className="text-xs text-slate-500">Mandanten-Isolation aktiv</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Warenwirtschafts-Synchronisation & Leads
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Development-Only Admin Button for Price Drop & Email Notification Testing */}
          <button
            id="btn-dev-simulate-price-drop"
            type="button"
            onClick={() => {
              setShowSimulateModal(true);
              fetchDealerOffers();
            }}
            className="px-3.5 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 text-amber-950 font-semibold text-xs flex items-center gap-2 transition-all shadow-2xs group focus:outline-none focus:ring-2 focus:ring-amber-500"
            title="Preissenkung simulieren & Email-Alerts testen (POST /api/alerts/simulate-drop)"
          >
            <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px] font-black uppercase tracking-wider">
              DEV ONLY
            </span>
            <Zap className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
            <span>Preissturz & Email-Alert simulieren</span>
          </button>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">Angemeldeter Fachhändler:</label>
            <select
              id="admin-dealer-switcher"
              value={selectedDealerId}
              onChange={(e) => setSelectedDealerId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500"
            >
              {dealers.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">Synchronisierte Angebote</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.totalOffers}</div>
            <span className="text-[11px] text-emerald-600 font-medium">Sofort verfügbar im Marktplatz</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">Eingegangene Kunden-Leads</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{leads.length}</div>
            <span className="text-[11px] text-slate-500">Probefahrten & Kaufanfragen</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">Gemessene Händler-Klicks</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.totalOutboundClicks}</div>
            <span className="text-[11px] text-emerald-600 font-medium">Gegen Klickbetrug geschützt</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">Partner-Fachhändler</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.totalDealers}</div>
            <span className="text-[11px] text-slate-500">In ganz Deutschland aktiv</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs (Import / Leads / Audit / Dev-Simulate) */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-medium overflow-x-auto">
        <button
          id="tab-import-btn"
          onClick={() => setActiveTab('import')}
          className={`pb-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'import'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Warenbestand importieren (CSV Feed)</span>
        </button>

        <button
          id="tab-scraper-btn"
          onClick={() => {
            setActiveTab('scraper');
            fetchScraperStatus();
          }}
          className={`pb-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'scraper'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Globe className="w-4 h-4 text-emerald-600" />
          <span>Website Deep Scraper (Crawler)</span>
        </button>

        <button
          id="tab-leads-btn"
          onClick={() => setActiveTab('leads')}
          className={`pb-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'leads'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Kunden-Anfragen Posteingang ({leads.length})</span>
        </button>

        <button
          id="tab-audit-btn"
          onClick={() => setActiveTab('audit')}
          className={`pb-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'audit'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Audit-Protokoll & Klick-Attribution</span>
        </button>

        <button
          id="tab-dev-alerts-btn"
          onClick={() => {
            setActiveTab('simulate');
            fetchDealerOffers();
          }}
          className={`pb-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'simulate'
              ? 'border-amber-500 text-amber-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-500" />
          <span className="flex items-center gap-1.5">
            <span>Dev: Preissenkung & Alert-Simulation</span>
            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
              DEV ONLY
            </span>
          </span>
        </button>
      </div>

      {/* TAB 1: CSV INGESTION CENTER */}
      {activeTab === 'import' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Autorisierter Händler-Feed Ingest</h2>
                <p className="text-xs text-slate-500">
                  Idempotenter Import. Gleiche Zeilen erzeugen keine Duplikate. Formel-Injektionen werden neutralisiert.
                </p>
              </div>

              {/* Sample Feed Selectors */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 mr-1">Testszenarien:</span>
                <button
                  type="button"
                  onClick={() => setCsvContent(SAMPLE_FEEDS.standard)}
                  className="px-2 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded"
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => setCsvContent(SAMPLE_FEEDS.priceReduction)}
                  className="px-2 py-1 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded"
                >
                  Preisänderung
                </button>
                <button
                  type="button"
                  onClick={() => setCsvContent(SAMPLE_FEEDS.withBadRow)}
                  className="px-2 py-1 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 rounded"
                >
                  Fehlerzeile
                </button>
              </div>
            </div>

            {/* CSV Text Area */}
            <div className="relative">
              <textarea
                id="csv-feed-textarea"
                rows={12}
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                className="w-full font-mono text-xs p-3 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-slate-800 bg-slate-50"
                placeholder="external_id,brand,model,model_year..."
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Mandant: <strong>{currentDealer?.name}</strong>
              </span>

              <button
                id="btn-run-feed-import"
                onClick={handleRunImport}
                disabled={importing || !csvContent.trim()}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {importing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <UploadCloud className="w-4 h-4" />
                )}
                <span>Feed jetzt synchronisieren</span>
              </button>
            </div>
          </div>

          {/* Import Execution Report */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-2">Import-Verarbeitungsbericht</h3>

              {importReport ? (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Gesamtzeilen:</span>
                      <span className="font-bold text-slate-900">{importReport.totalRows}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Erfolgreich eingespielt:</span>
                      <span className="font-bold text-emerald-600">{importReport.importedRows}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">In Quarantäne (Fehler):</span>
                      <span className={`font-bold ${importReport.failedRows > 0 ? 'text-amber-600' : 'text-slate-500'}`}>
                        {importReport.failedRows}
                      </span>
                    </div>
                  </div>

                  {importReport.errors && importReport.errors.length > 0 && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                      <div className="text-xs font-bold text-amber-900 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Fehlerprotokoll (Quarantäne):</span>
                      </div>
                      <div className="space-y-1 text-[11px] text-amber-800 font-mono max-h-40 overflow-y-auto">
                        {importReport.errors.map((err: any, idx: number) => (
                          <div key={idx} className="bg-white/80 p-1.5 rounded">
                            Zeile {err.row}: {err.error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-[11px] text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>Bestehende Angebote blieben unberührt (Zero-Downtime).</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-400">
                  Klicken Sie auf &quot;Feed jetzt synchronisieren&quot;, um den Lauf zu starten.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 1.5: DEEP WEBSITES SCRAPER (CRAWLER) */}
      {activeTab === 'scraper' && (
        <div className="space-y-6">
          <div className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-md">
            <div className="relative z-10 max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-300 text-xs font-semibold border border-emerald-700">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Automatisierter Bestands-Crawler für 361 Partner-Websites</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                VeloFind Deep Web Scraper & Crawler
              </h2>
              <p className="text-sm text-emerald-200/90 leading-relaxed">
                Der Tiefenscraper scannt automatisch die Websites aller Partnerhändler (wie Lucky Bike, Fahrrad XXL, B.O.C., emotion-technologies uvm.). Er extrahiert Schema.org JSON-LD Produktdaten, OpenGraph-Metadaten und HTML-Kataloge und synchronisiert neue Fahrräder und E-Bikes direkt in den Live-Katalog.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  id="btn-crawl-all-sites"
                  onClick={() => handleStartCrawler()}
                  disabled={scraperRunning}
                  className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${scraperRunning ? 'animate-spin' : ''}`} />
                  <span>{scraperRunning ? 'Scraping läuft...' : 'Alle 361 Websites jetzt tiefenscrappen'}</span>
                </button>

                <button
                  type="button"
                  id="btn-crawl-current-dealer"
                  onClick={handleScrapeCurrentDealer}
                  disabled={scraperRunning}
                  className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-2 border border-white/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Nur {currentDealer.name} scrappen</span>
                </button>
              </div>

              {scraperMessage && (
                <div className="mt-4 p-3 bg-emerald-900/90 border border-emerald-600/50 rounded-xl text-xs text-emerald-200 flex items-center justify-between gap-2">
                  <span>{scraperMessage}</span>
                  <button onClick={() => setScrapeMessage(null)} className="text-emerald-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Crawler Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 block">Überwachte Partner-Websites</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">361 Händler</span>
              <span className="text-[11px] text-emerald-600 font-medium">100% verifizierte Domains</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 block">Katalog-Angebote gesamt</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">1.068+ Bikes</span>
              <span className="text-[11px] text-emerald-600 font-medium">E-Bikes, Trekking, MTB & Gravel</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 block">Crawler-Takt & Schutz</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">Täglich 04:00</span>
              <span className="text-[11px] text-slate-500">Rate-Limiting & Idempotenz aktiv</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LEADS INBOX */}
      {activeTab === 'leads' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Eingegangene Kunden-Anfragen</h2>
            <p className="text-xs text-slate-500">
              DSGVO-konform mit dokumentierter Einwilligung des Kunden.
            </p>
          </div>

          {leads.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              Keine Anfragen für diesen Händler vorhanden. Stellen Sie über den Marktplatz eine Testanfrage.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Datum</th>
                    <th className="p-4">Kunde</th>
                    <th className="p-4">Angefragtes Rad</th>
                    <th className="p-4">Art & Nachricht</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Aktion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/80">
                      <td className="p-4 whitespace-nowrap text-slate-500">
                        {new Date(l.created_at).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{l.customer_name}</div>
                        <div className="text-slate-500">{l.customer_email}</div>
                        {l.customer_phone && <div className="text-slate-400">{l.customer_phone}</div>}
                      </td>
                      <td className="p-4 font-medium text-slate-900">
                        {l.offer_title || l.offer_id}
                      </td>
                      <td className="p-4 max-w-xs">
                        <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-800 rounded mr-1">
                          {l.enquiry_type}
                        </span>
                        <p className="text-slate-600 line-clamp-2 mt-1">{l.message || '–'}</p>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          l.status === 'NEW'
                            ? 'bg-amber-100 text-amber-900'
                            : l.status === 'CONTACTED'
                            ? 'bg-blue-100 text-blue-900'
                            : l.status === 'CONVERTED'
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap space-x-1">
                        <select
                          value={l.status}
                          onChange={(e) => handleUpdateLeadStatus(l.id, e.target.value)}
                          className="px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                        >
                          <option value="NEW">Neu</option>
                          <option value="CONTACTED">Kontaktiert</option>
                          <option value="QUALIFIED">Qualifiziert</option>
                          <option value="CONVERTED">Gewonnen</option>
                          <option value="LOST">Geschlossen</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Unveränderliches Audit- & Attribution-Protokoll</h2>
            <p className="text-xs text-slate-500">
              Protokollierung aller sicherheitsrelevanten Aktionen, Outbound-Weiterleitungen und Importläufe.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">Zeitpunkt</th>
                  <th className="p-4">Ereignis</th>
                  <th className="p-4">Ziel / Detail</th>
                  <th className="p-4">Mandant / Akteur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {auditLogs.slice(0, 15).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="p-4 whitespace-nowrap text-slate-500">
                      {new Date(log.created_at).toLocaleTimeString('de-DE')}
                    </td>
                    <td className="p-4 font-semibold text-emerald-700">
                      {log.action}
                    </td>
                    <td className="p-4 text-slate-700 max-w-sm truncate">
                      {JSON.stringify(log.payload || {})}
                    </td>
                    <td className="p-4 text-slate-500">
                      {log.dealer_id || log.actor || 'SYSTEM'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DEV-ONLY ALERT SIMULATION */}
      {activeTab === 'simulate' && (
        <div className="bg-white rounded-3xl border border-amber-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Zap className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">Dev-Werkzeug: Preissenkung & Alert-Simulation</h2>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-black tracking-wider">
                  DEV ONLY
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">POST /api/alerts/simulate-drop</p>
            </div>
          </div>

          {renderSimulationContent()}
        </div>
      )}

      {/* DEV-ONLY SIMULATION POPUP MODAL */}
      {showSimulateModal && (
        <div
          id="modal-simulate-price-drop"
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          onClick={() => setShowSimulateModal(false)}
        >
          <div
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <Zap className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">Preissenkung & Email-Alerts simulieren</h2>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-black tracking-wider">
                      DEV ONLY
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">POST /api/alerts/simulate-drop</p>
                </div>
              </div>
              <button
                id="btn-close-simulate-modal"
                type="button"
                onClick={() => setShowSimulateModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                title="Schließen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {renderSimulationContent()}
          </div>
        </div>
      )}
    </div>
  );
};
