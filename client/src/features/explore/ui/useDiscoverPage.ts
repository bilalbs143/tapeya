import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';

import { useGetSuggestedUsersQuery, useSearchUsersQuery } from '../api/exploreApi';
import {
  DISCOVER_SEARCH_DEBOUNCE_MS,
  DISCOVER_SUGGESTIONS_LIMIT,
  discoverSearchResultsHeading,
} from '../lib/discoverPage';

/** Suggested list + shop-style search that replaces the list below (no popover). */
export function useDiscoverPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query.trim()), DISCOVER_SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [query]);

  const searching = debounced.length > 0;

  const {
    data: suggestions,
    isLoading: suggestionsLoading,
    isError: suggestionsError,
    refetch: refetchSuggestions,
  } = useGetSuggestedUsersQuery({ limit: DISCOVER_SUGGESTIONS_LIMIT }, { skip: searching });

  const {
    data: searchResults,
    isLoading: searchLoading,
    isError: searchError,
    refetch: refetchSearch,
  } = useSearchUsersQuery(debounced, { skip: !searching });

  const users = searching ? (searchResults ?? []) : (suggestions ?? []);
  const isLoading = searching ? searchLoading : suggestionsLoading;
  const isError = searching ? searchError : suggestionsError;

  function refetch() {
    if (searching) void refetchSearch();
    else void refetchSuggestions();
  }

  function goHome() {
    navigate(APP_PATHS.home);
  }

  return {
    query,
    setQuery,
    searching,
    users,
    isLoading,
    isError,
    refetch,
    searchHeading: discoverSearchResultsHeading(users.length),
    goHome,
  };
}
