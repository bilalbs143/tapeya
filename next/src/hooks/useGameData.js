import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { fetchAllGames } from '@/website/websiteAction';

export const useGameData = (filter = {}, options = {}) => {
  const dispatch = useDispatch();

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filterRef = useRef(filter);
  const optionsRef = useRef(options);

  // Update refs when props change
  useEffect(() => {
    filterRef.current = filter;
    optionsRef.current = options;
  }, [filter, options]);

  const fetchGames = useCallback(
    async (isRetry = false) => {
      try {
        setLoading(true);
        setError(null);

        const currentFilter = filterRef.current;
        const currentOptions = optionsRef.current;

        const result = await dispatch(
          fetchAllGames({
            page: 1,
            perPage: currentOptions.perPage || 20,
            filter: currentFilter,
          }),
        );

        if (
          result.payload &&
          result.payload.data &&
          result.payload.data.length > 0
        ) {
          setGames(result.payload.data);
          setError(null);
        } else {
          setError('No games available');
          // Try fetching without filter as fallback
          if (isRetry) {
            const fallbackResult = await dispatch(
              fetchAllGames({
                page: 1,
                perPage: currentOptions.perPage || 20,
                filter: {},
              }),
            );
            if (
              fallbackResult.payload &&
              fallbackResult.payload.data &&
              fallbackResult.payload.data.length > 0
            ) {
              setGames(fallbackResult.payload.data);
              setError(null);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch games:', err);
        setError('Failed to load games');
      } finally {
        setLoading(false);
      }
    },
    [], // Remove dispatch dependency to prevent infinite re-renders
  );

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const retry = useCallback(() => {
    setError(null);
    fetchGames(true);
  }, [fetchGames]);

  return {
    games,
    loading,
    error,
    retry,
  };
};
