/**
 * VeloFind LocalStorage Favorites Service & React Hook
 * Persists saved bikes in browser localStorage with cross-tab and cross-component reactivity.
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'velofind_saved_bikes_v1';
const EVENT_NAME = 'velofind:favorites_updated';

/**
 * Retrieve saved favorite offer IDs from localStorage
 */
export function getFavoriteOfferIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((id) => typeof id === 'string' && id.trim().length > 0);
    }
    return [];
  } catch (err) {
    console.warn('[Favorites] Failed to read from localStorage:', err);
    return [];
  }
}

/**
 * Persist favorite offer IDs to localStorage and notify all listeners
 */
export function setFavoriteOfferIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    const uniqueIds = Array.from(new Set(ids));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(uniqueIds));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: uniqueIds }));
  } catch (err) {
    console.warn('[Favorites] Failed to write to localStorage:', err);
  }
}

/**
 * Check if an offer is currently favorited
 */
export function isOfferFavorited(offerId: string): boolean {
  const ids = getFavoriteOfferIds();
  return ids.includes(offerId);
}

/**
 * Toggle favorite status for an offer ID.
 * Returns true if now favorited, false if removed.
 */
export function toggleOfferFavorite(offerId: string): boolean {
  const current = getFavoriteOfferIds();
  const exists = current.includes(offerId);
  let updated: string[];

  if (exists) {
    updated = current.filter((id) => id !== offerId);
  } else {
    updated = [...current, offerId];
  }

  setFavoriteOfferIds(updated);
  return !exists;
}

/**
 * Clear all favorites
 */
export function clearAllFavorites(): void {
  setFavoriteOfferIds([]);
}

/**
 * React Hook for consuming and modifying favorite bikes
 */
export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => getFavoriteOfferIds());

  useEffect(() => {
    // Initial sync
    setFavoriteIds(getFavoriteOfferIds());

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<string[]>;
      if (customEvent.detail) {
        setFavoriteIds(customEvent.detail);
      } else {
        setFavoriteIds(getFavoriteOfferIds());
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setFavoriteIds(getFavoriteOfferIds());
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
    return toggleOfferFavorite(offerId);
  }, []);

  const isFav = useCallback(
    (offerId: string) => {
      return favoriteIds.includes(offerId);
    },
    [favoriteIds]
  );

  const clear = useCallback(() => {
    clearAllFavorites();
  }, []);

  return {
    favoriteIds,
    favoritesCount: favoriteIds.length,
    isFavorite: isFav,
    toggleFavorite: toggle,
    clearFavorites: clear
  };
}
