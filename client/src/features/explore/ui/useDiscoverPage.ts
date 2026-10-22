import { useNavigate } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';

import { useGetSuggestedUsersQuery } from '../api/exploreApi';
import { DISCOVER_SUGGESTIONS_LIMIT } from '../lib/discoverPage';

/** Suggested-users list for DiscoverPage. */
export function useDiscoverPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useGetSuggestedUsersQuery({
    limit: DISCOVER_SUGGESTIONS_LIMIT,
  });
  const users = data ?? [];

  function goHome() {
    navigate(APP_PATHS.home);
  }

  return {
    users,
    isLoading,
    isError,
    refetch,
    goHome,
  };
}
