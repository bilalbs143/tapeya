import { useNavigate } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';

import { useGetTournamentsQuery } from '../api/tournamentsApi';
import { partitionTournamentHub, tournamentsHubSubtitle } from '../lib/tournamentsList';
import { tournamentRoutes } from '../tournamentPaths';

/** My-tournaments hub query and Active · Previous partition. */
export function useTournamentsList() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useGetTournamentsQuery({});

  const items = data?.items ?? [];
  const { needsYou, previous } = partitionTournamentHub(items);
  const isEmpty = !isLoading && !isError && items.length === 0;
  const summary = tournamentsHubSubtitle({
    isEmpty,
    isLoading,
    needsYouCount: needsYou.length,
    previousCount: previous.length,
  });

  function goHome() {
    navigate(APP_PATHS.home);
  }

  function goCreate() {
    navigate(tournamentRoutes.create());
  }

  return {
    isLoading,
    isError,
    refetch,
    needsYou,
    previous,
    isEmpty,
    summary,
    goHome,
    goCreate,
  };
}
