import React, { useState } from 'react';
import { X, Send, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { Offer } from '../types';

interface LeadModalProps {
  offer: Offer | null;
  onClose: () => void;
  onSubmitSuccess?: () => void;
}

export const LeadModal: React.FC<LeadModalProps> = ({
  offer,
  onClose,
  onSubmitSuccess
}) => {
  if (!offer) return null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [enquiryType, setEnquiryType] = useState<'TEST_RIDE' | 'PRICE_QUERY' | 'LEASING_INFO' | 'GENERAL'>('TEST_RIDE');
  const [message, setMessage] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!consentGiven) {
      setError('Bitte willigen Sie in die Kontaktaufnahme durch den Händler ein.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offer_id: offer.id,
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          enquiry_type: enquiryType,
          message,
          consent_given: consentGiven,
          honeypot
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Fehler beim Absenden der Anfrage');
      }

      setSubmitted(true);
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err: any) {
      setError(err.message || 'Verbindung zum Server fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div
        id="lead-enquiry-modal"
        className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Anfrage erfolgreich übermittelt!</h3>
              <p className="text-sm text-slate-600 max-w-sm mx-auto">
                Ihre Anfrage zum <strong>{offer.title}</strong> wurde an <strong>{offer.dealer_name}</strong> weitergeleitet. Der Händler wird sich zeitnah bei Ihnen melden.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors"
              >
                Schließen
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Unverbindliche Anfrage</span>
                <h3 className="text-xl font-bold text-slate-900">Probefahrt & Beratung</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                  Für: {offer.title} bei {offer.dealer_name}
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Honeypot field for bot detection (hidden from real users) */}
              <input
                type="text"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              {/* Enquiry Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Art des Anliegens</label>
                <select
                  id="lead-enquiry-type"
                  value={enquiryType}
                  onChange={(e) => setEnquiryType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="TEST_RIDE">Probefahrt im Geschäft vereinbaren</option>
                  <option value="PRICE_QUERY">Verfügbarkeit & Rahmengröße anfragen</option>
                  <option value="LEASING_INFO">Dienstrad-Leasing Beratung (JobRad etc.)</option>
                  <option value="GENERAL">Allgemeine Frage an den Händler</option>
                </select>
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ihr vollständiger Name *</label>
                <input
                  id="lead-customer-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Max Mustermann"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">E-Mail-Adresse *</label>
                  <input
                    id="lead-customer-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@beispiel.de"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Telefonnummer (optional)</label>
                  <input
                    id="lead-customer-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+49 170 1234567"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ihre Nachricht / Wunschtermin</label>
                <textarea
                  id="lead-customer-message"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Guten Tag, ich würde das E-Bike gerne diesen Samstag besichtigen und Probe fahren..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* DSGVO Consent Checkbox */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    id="lead-consent-checkbox"
                    type="checkbox"
                    required
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    Ich willige ein, dass VeloFind meine angegebenen Kontaktdaten zwecks Beantwortung der Anfrage an <strong>{offer.dealer_name}</strong> übermittelt. (DSGVO-konform, jederzeit widerrufbar).
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                id="lead-submit-button"
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <span>Wird gesendet...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Anfrage jetzt absenden</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
