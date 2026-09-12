import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Global in-memory cache shared across the client app session
const globalAdminCache = new Map<string, CacheEntry<any>>();

export function getAdminCache<T>(key: string): T | undefined {
  const entry = globalAdminCache.get(key);
  return entry ? (entry.data as T) : undefined;
}

export function setAdminCache<T>(key: string, data: T): void {
  globalAdminCache.set(key, { data, timestamp: Date.now() });
}

export function mutateAdminCache<T>(
  key: string,
  updater: (prev: T | undefined) => T
): T {
  const current = getAdminCache<T>(key);
  const updated = updater(current);
  setAdminCache(key, updated);
  return updated;
}

export function clearAdminCache(key?: string): void {
  if (key) {
    globalAdminCache.delete(key);
  } else {
    globalAdminCache.clear();
  }
}

/**
 * High-performance Stale-While-Revalidate hook for Admin panel pages.
 * - Serves cached data instantly (0ms) if available
 * - Fetches fresh data silently in the background
 * - Prevents blank loading states when navigating back and forth between tabs
 */
export function useAdminData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: {
    initialData?: T;
    ttlMs?: number;
  }
) {
  const cached = getAdminCache<T>(key) ?? options?.initialData;
  const [data, setDataState] = useState<T | undefined>(cached);
  const [loading, setLoading] = useState<boolean>(!cached);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refresh = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) {
        setRefreshing(true);
      } else if (!getAdminCache<T>(key)) {
        setLoading(true);
      }

      try {
        const fresh = await fetcherRef.current();
        setAdminCache(key, fresh);
        setDataState(fresh);
        setError(null);
      } catch (err) {
        console.error(`Admin cache fetch error for key "${key}":`, err);
        setError(err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [key]
  );

  useEffect(() => {
    // 1. Immediately hydrate with cached data if available
    const existing = getAdminCache<T>(key);
    if (existing !== undefined) {
      setDataState(existing);
      setLoading(false);
    } else {
      setLoading(true);
    }

    // 2. Perform background revalidation
    refresh();
  }, [key, refresh]);

  const updateData = useCallback(
    (action: T | ((prev: T | undefined) => T)) => {
      setDataState((prev) => {
        const next = typeof action === 'function' ? (action as any)(prev) : action;
        setAdminCache(key, next);
        return next;
      });
    },
    [key]
  );

  return {
    data,
    setData: updateData,
    loading,
    refreshing,
    refresh: (isManual?: boolean) => refresh(isManual ?? true),
    error,
  };
}
