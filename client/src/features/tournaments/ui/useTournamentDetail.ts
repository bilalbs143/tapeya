import { useNavigate } from 'react-router-dom';

import { useGetTournamentQuery } from '../api/tournamentsApi';

/** Tournament fetch for the workspace/public redirect shell. */
export function useTournamentDetail(tournamentId: number | null) {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useGetTournamentQuery(tournamentId ?? 0, {
    skip: tournamentId == null,
  });

  function goBack() {
    navigate(-1);
  }

  return {
    data,
    isLoading,
    isError,
    refetch,
    goBack,
  };
}
