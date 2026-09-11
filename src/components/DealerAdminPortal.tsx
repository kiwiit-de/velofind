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
  Database
} from 'lucide-react';
import { Dealer, Lead, ImportRun, OverviewStats } from '../types';

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
  const [activeTab, setActiveTab] = useState<'import' | 'leads' | 'audit'>('import');

  // Stats & Leads states
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const currentDealer = dealers.find(d => d.id === selectedDealerId) || dealers[0];

  const fetchPortalData = async () => {
    try {
      const [statsRes, leadsRes, auditRes] = await Promise.all([
        fetch('/api/admin/overview'),
        fetch(`/api/admin/leads?dealer_id=${selectedDealerId}`),
        fetch('/api/admin/audit-logs')
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
  }, [selectedDealerId]);

  const handleRunImport = async () => {
    setImporting(true);
    setImportReport(null);

    try {
      const res = await fetch('/api/dealers/import-feed', {
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
      const res = await fetch(`/api/admin/leads/${leadId}`, {
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

        <div className="flex items-center gap-3">
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

      {/* Navigation Tabs (Import / Leads / Audit) */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-medium">
        <button
          id="tab-import-btn"
          onClick={() => setActiveTab('import')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'import'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Warenbestand importieren (CSV Feed)</span>
        </button>

        <button
          id="tab-leads-btn"
          onClick={() => setActiveTab('leads')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
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
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'audit'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Audit-Protokoll & Klick-Attribution</span>
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
    </div>
  );
};
