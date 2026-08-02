/**
 * ProfileReels — grid of a user's ready reels on their cricket profile.
 */

import { ReelPosterGrid } from '@/components/reels/ReelPosterGrid';
import { useGetUserReelsQuery } from '@/store/api/reelsApi';

export function ProfileReels({ userId }) {
  const { data, isLoading, isError } = useGetUserReelsQuery({ userId, perPage: 12 }, { skip: !userId });

  const items = data?.items ?? [];

  if (!userId) {
    return <p className="text-muted py-6 text-center text-sm">Sign in to see reels.</p>;
  }

  if (isLoading) {
    return <p className="text-muted py-6 text-center text-sm">Loading reels…</p>;
  }

  if (isError) {
    return <p className="text-muted py-6 text-center text-sm">Could not load reels.</p>;
  }

  return (
    <div className="pt-2">
      <ReelPosterGrid items={items} emptyMessage="No reels yet." emptyAction={{ to: '/reels/upload', label: 'Upload a Reel' }} />
    </div>
  );
}
