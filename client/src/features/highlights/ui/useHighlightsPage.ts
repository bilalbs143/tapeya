import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useGetHighlightsQuery } from '../api/highlightsApi';
import {
  applyHighlightsSearchParams,
  HIGHLIGHTS_MIN_SEARCH,
  HIGHLIGHTS_SEARCH_DEBOUNCE_MS,
  resolveHighlightsDebounced,
  seedHighlightsDebounced,
} from '../lib/highlightsPage';
import { filterByTitle, sortByRecent } from '../model/schemas';

/** Highlights catalog query + URL-synced search (≥2 chars). */
export function useHighlightsPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(() => params.get('q') ?? '');
  const [debounced, setDebounced] = useState(() => seedHighlightsDebounced(params.get('q')));

  const { data = [], isLoading, isError, refetch } = useGetHighlightsQuery({ perPage: 50 });

  useEffect(() => {
    const t = window.setTimeout(() => {
      const next = q.trim();
      setDebounced(resolveHighlightsDebounced(next));
      setParams((prev) => applyHighlightsSearchParams(prev, next), { replace: true });
    }, HIGHLIGHTS_SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [q, setParams]);

  const searching = debounced.length >= HIGHLIGHTS_MIN_SEARCH;
  const results = useMemo(() => (searching ? filterByTitle(data, debounced) : null), [data, debounced, searching]);
  const clips = useMemo(() => sortByRecent(data), [data]);

  function goBack() {
    navigate(-1);
  }

  return {
    q,
    setQ,
    debounced,
    results,
    clips,
    isLoading,
    isError,
    refetch,
    goBack,
  };
}
