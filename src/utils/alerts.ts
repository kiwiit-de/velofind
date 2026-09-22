/**
 * VeloFind Price Drop Alert Service & React Hook
 * Persists and synchronizes price alert preferences with the backend UserAlerts database table.
 */

import { useState, useEffect, useCallback } from 'react';
import { apiUrl } from '../lib/api';

const STORAGE_ALERTS_KEY = 'velofind_user_alerts_v1';
const STORAGE_EMAIL_KEY = 'velofind_user_email_v1';
const EVENT_NAME = 'velofind:alerts_updated';

export interface LocalAlertInfo {
  offerId: string;
  email: string;
  initialPriceCents: number;
  targetPriceCents?: number | null;
  subscribedAt: string;
}

export function getSavedAlertEmail(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_EMAIL_KEY) || '';
}

export function setSavedAlertEmail(email: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_EMAIL_KEY, email.trim().toLowerCase());
}

export function getLocalAlerts(): LocalAlertInfo[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_ALERTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalAlert(info: LocalAlertInfo): void {
  if (typeof window === 'undefined') return;
  try {
    const alerts = getLocalAlerts().filter((a) => a.offerId !== info.offerId);
    alerts.unshift(info);
    localStorage.setItem(STORAGE_ALERTS_KEY, JSON.stringify(alerts));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: alerts }));
  } catch (err) {
    console.warn('[Alerts] Failed to save local alert:', err);
  }
}

export function isOfferAlerted(offerId: string): boolean {
  return getLocalAlerts().some((a) => a.offerId === offerId);
}

/**
 * React hook to manage price drop alerts for a specific offer
 */
export function usePriceAlert(offerId?: string, currentPriceCents?: number) {
  const [hasAlert, setHasAlert] = useState<boolean>(() =>
    offerId ? isOfferAlerted(offerId) : false
  );
  const [subscribersCount, setSubscribersCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync state with localStorage events
  useEffect(() => {
    if (!offerId) return;
    setHasAlert(isOfferAlerted(offerId));

    const handleUpdate = () => {
      setHasAlert(isOfferAlerted(offerId));
    };

    window.addEventListener(EVENT_NAME, handleUpdate);
    return () => window.removeEventListener(EVENT_NAME, handleUpdate);
  }, [offerId]);

  // Fetch subscriber count for this offer from backend
  const fetchCount = useCallback(async () => {
    if (!offerId) return;
    try {
      const res = await fetch(apiUrl(`/api/alerts/count/${offerId}`));
      if (res.ok) {
        const data = await res.json();
        setSubscribersCount(data.count || 0);
      }
    } catch {
      // Non-critical background call
    }
  }, [offerId]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  // Submit alert to backend UserAlerts table
  const subscribeAlert = async (
    email: string,
    targetPriceCents?: number | null
  ): Promise<boolean> => {
    if (!offerId) return false;
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        throw new Error('Bitte gib eine gültige E-Mail-Adresse ein.');
      }

      const res = await fetch(apiUrl('/api/alerts'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId,
          email: cleanEmail,
          targetPriceCents: targetPriceCents ?? null
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Fehler beim Erstellen des Preisalarms');
      }

      // Persist in local storage
      setSavedAlertEmail(cleanEmail);
      saveLocalAlert({
        offerId,
        email: cleanEmail,
        initialPriceCents: currentPriceCents || 0,
        targetPriceCents: targetPriceCents ?? null,
        subscribedAt: new Date().toISOString()
      });

      setHasAlert(true);
      setSuccessMessage(data.message || 'Preisalarm erfolgreich scharfgeschaltet!');
      setSubscribersCount((prev) => prev + 1);
      return true;
    } catch (err: any) {
      setError(err.message || 'Verbindung zum Server fehlgeschlagen.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    hasAlert,
    subscribersCount,
    loading,
    error,
    successMessage,
    subscribeAlert,
    savedEmail: getSavedAlertEmail()
  };
}
