import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGetDiscoverTournamentsQuery } from '../api/tournamentsApi';
import { sortUpcomingTournaments } from '../lib/upcomingTournaments';

/** Discover tournaments filtered to upcoming for UpcomingTournamentsPage. */
export function useUpcomingTournaments() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useGetDiscoverTournamentsQuery();

  const upcoming = useMemo(() => sortUpcomingTournaments(data?.items ?? []), [data?.items]);

  function goBack() {
    navigate(-1);
  }

  return {
    upcoming,
    isLoading,
    isError,
    refetch,
    goBack,
  };
}
