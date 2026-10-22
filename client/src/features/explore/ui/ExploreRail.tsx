import { useGetSuggestedUsersQuery } from '../api/exploreApi';
import { SuggestedForYouCard } from './SuggestedForYouCard';

/** Desktop third column — suggestions first; live/highlights land later. */
export function ExploreRail() {
  const { data: users } = useGetSuggestedUsersQuery({ limit: 20 });
  const slice = (users ?? []).slice(0, 5);

  if (!slice.length) return null;

  return <SuggestedForYouCard users={slice} />;
}
