/**
 * VeloFind Bike Comparison Service & React Hook
 * Allows selecting up to 3 bikes to compare specs, geometry, motors, and pricing side-by-side.
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'velofind_compare_bikes_v1';
const EVENT_NAME = 'velofind:compare_updated';
export const MAX_COMPARE_BIKES = 3;

/**
 * Retrieve saved compare offer IDs from localStorage
 */
export function getCompareOfferIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((id) => typeof id === 'string' && id.trim().length > 0).slice(0, MAX_COMPARE_BIKES);
    }
    return [];
  } catch (err) {
    console.warn('[Compare] Failed to read from localStorage:', err);
    return [];
  }
}

/**
 * Persist compare offer IDs to localStorage and notify listeners
 */
export function setCompareOfferIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    const uniqueIds = Array.from(new Set(ids)).slice(0, MAX_COMPARE_BIKES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(uniqueIds));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: uniqueIds }));
  } catch (err) {
    console.warn('[Compare] Failed to write to localStorage:', err);
  }
}

/**
 * Check if an offer is currently in comparison
 */
export function isOfferInCompare(offerId: string): boolean {
  const ids = getCompareOfferIds();
  return ids.includes(offerId);
}

/**
 * Toggle an offer into/out of comparison.
 * Enforces maximum limit of 3 bikes.
 */
export function toggleCompareOffer(offerId: string): {
  success: boolean;
  added: boolean;
  count: number;
  error?: string;
} {
  const current = getCompareOfferIds();
  const exists = current.includes(offerId);

  if (exists) {
    const updated = current.filter((id) => id !== offerId);
    setCompareOfferIds(updated);
    return { success: true, added: false, count: updated.length };
  }

  if (current.length >= MAX_COMPARE_BIKES) {
    return {
      success: false,
      added: false,
      count: current.length,
      error: `Maximal ${MAX_COMPARE_BIKES} Fahrräder können gleichzeitig verglichen werden.`
    };
  }

  const updated = [...current, offerId];
  setCompareOfferIds(updated);
  return { success: true, added: true, count: updated.length };
}

/**
 * Remove an offer from comparison
 */
export function removeCompareOffer(offerId: string): void {
  const current = getCompareOfferIds();
  const updated = current.filter((id) => id !== offerId);
  setCompareOfferIds(updated);
}

/**
 * Clear all offers from comparison
 */
export function clearCompare(): void {
  setCompareOfferIds([]);
}

/**
 * React Hook for consuming and modifying comparison state
 */
export function useCompare() {
  const [compareIds, setCompareIds] = useState<string[]>(() => getCompareOfferIds());

  useEffect(() => {
    setCompareIds(getCompareOfferIds());

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<string[]>;
      if (customEvent.detail) {
        setCompareIds(customEvent.detail);
      } else {
        setCompareIds(getCompareOfferIds());
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setCompareIds(getCompareOfferIds());
      }
    };

    window.addEventListener(EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const toggle = useCallback((offerId: string) => {
    return toggleCompareOffer(offerId);
  }, []);

  const remove = useCallback((offerId: string) => {
    removeCompareOffer(offerId);
  }, []);

  const clear = useCallback(() => {
    clearCompare();
  }, []);

  const inCompare = useCallback(
    (offerId: string) => {
      return compareIds.includes(offerId);
    },
    [compareIds]
  );

  return {
    compareIds,
    compareCount: compareIds.length,
    isFull: compareIds.length >= MAX_COMPARE_BIKES,
    maxAllowed: MAX_COMPARE_BIKES,
    isInCompare: inCompare,
    toggleCompare: toggle,
    removeCompare: remove,
    clearCompare: clear
  };
}
