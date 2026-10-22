import { useNavigate } from 'react-router-dom';

import { useMeQuery } from '@/features/auth';

import { APP_PATHS } from '@/shared/config/paths';

import { useGetQuickMatchesQuery } from '../api/matchesApi';
import { filterSectionedMatches, matchesListScorerFirstName, matchesListSubtitle } from '../lib/matchesList';
import type { Match } from '../model/schemas';
import { matchRoutes } from '../routes';

/** Quick-match list + scorer subtitle for MatchesListPage. */
export function useMatchesList() {
  const navigate = useNavigate();
  const { data: me } = useMeQuery();
  const { data, isLoading, isError, refetch } = useGetQuickMatchesQuery(undefined);

  const scorer = matchesListScorerFirstName(me?.nickname, me?.name);
  const subtitle = matchesListSubtitle(scorer);
  const matches = filterSectionedMatches(data?.items);

  function onResume(match: Match) {
    navigate(matchRoutes.score(match.id));
  }

  function onSaveToss(match: Match) {
    navigate(matchRoutes.toss(match.id));
  }

  function onOpen(match: Match) {
    navigate(matchRoutes.card(match.id));
  }

  function goHome() {
    navigate(APP_PATHS.home);
  }

  return {
    subtitle,
    matches,
    isLoading,
    isError,
    refetch,
    onResume,
    onSaveToss,
    onOpen,
    goHome,
  };
}
