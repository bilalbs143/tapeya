import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useGetDramaSerialsQuery } from '../api/entertainmentApi';
import {
  applyEntertainmentSearchParams,
  ENTERTAINMENT_MIN_SEARCH,
  ENTERTAINMENT_SEARCH_DEBOUNCE_MS,
  resolveEntertainmentDebounced,
  seedEntertainmentDebounced,
} from '../lib/entertainmentPage';
import { filterSerialsByTitle } from '../model/schemas';

/** Drama serials catalog + URL-synced search (≥2 chars). */
export function useEntertainmentPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(() => params.get('q') ?? '');
  const [debounced, setDebounced] = useState(() => seedEntertainmentDebounced(params.get('q')));

  const { data = [], isLoading, isError, refetch } = useGetDramaSerialsQuery({ perPage: 50 });

  useEffect(() => {
    const t = window.setTimeout(() => {
      const next = q.trim();
      setDebounced(resolveEntertainmentDebounced(next));
      setParams((prev) => applyEntertainmentSearchParams(prev, next), { replace: true });
    }, ENTERTAINMENT_SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [q, setParams]);

  const searching = debounced.length >= ENTERTAINMENT_MIN_SEARCH;
  const results = useMemo(
    () => (searching ? filterSerialsByTitle(data, debounced) : null),
    [data, debounced, searching]
  );

  function goBack() {
    navigate(-1);
  }

  return {
    q,
    setQ,
    debounced,
    data,
    results,
    isLoading,
    isError,
    refetch,
    goBack,
  };
}
