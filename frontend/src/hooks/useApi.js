// Small wrapper around an async function that tracks loading, error and data state.
// - `loading`: first fetch only (no cached data yet)
// - `refreshing`: background refetch when data already exists
// - Ignores stale responses when deps change or a newer request is in flight
// - Use `{ immediate: false }` when the screen fetches via useFocusEffect (avoids double fetch on mount)

import { useCallback, useEffect, useRef, useState } from 'react';

export default function useApi(asyncFn, deps = [], { immediate = true } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const fnRef = useRef(asyncFn);
  const dataRef = useRef(null);
  const requestIdRef = useRef(0);

  fnRef.current = asyncFn;

  const run = useCallback(async (...args) => {
    const reqId = ++requestIdRef.current;
    const isRefresh = dataRef.current != null;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const result = await fnRef.current(...args);
      if (reqId !== requestIdRef.current) return result;
      dataRef.current = result;
      setData(result);
      return result;
    } catch (e) {
      if (reqId === requestIdRef.current) {
        if (dataRef.current == null) {
          setError(e?.message || 'Something went wrong.');
        } else {
          setError(null);
        }
      }
      throw e;
    } finally {
      if (reqId !== requestIdRef.current) return;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const setDataAndRef = useCallback((value) => {
    dataRef.current = value;
    setData(value);
  }, []);

  useEffect(() => {
    requestIdRef.current += 1;
    dataRef.current = null;
    setData(null);
    setError(null);
    setLoading(false);
    setRefreshing(false);

    if (immediate) {
      run().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const refresh = useCallback(() => run(), [run]);

  return { data, error, loading, refreshing, run, refresh, setData: setDataAndRef };
}
