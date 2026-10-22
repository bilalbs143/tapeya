import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGetScorecardHubQuery } from '@/features/tournaments';

import {
  filterScorecardHubMatches,
  scorecardHubShowsTournamentChips,
  type ScorecardHubTournamentFilter,
} from '../lib/scorecardHub';

/** Open-tournament scorecard hub query + tournament chip filter. */
export function useScorecardHub() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useGetScorecardHubQuery();
  const [tournamentId, setTournamentId] = useState<ScorecardHubTournamentFilter>('all');

  const matches = useMemo(() => filterScorecardHubMatches(data?.matches, tournamentId), [data?.matches, tournamentId]);
  const tournaments = data?.tournaments ?? [];
  const showTournamentChips = scorecardHubShowsTournamentChips(tournaments.length);

  function goBack() {
    navigate(-1);
  }

  return {
    tournamentId,
    setTournamentId,
    matches,
    tournaments,
    showTournamentChips,
    isLoading,
    isError,
    refetch,
    goBack,
  };
}
