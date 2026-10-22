import { ErrorState, ProfileHeaderSkeleton, Skeleton } from '@/shared/ui/states';

import { useYouPage } from '../ui/useYouPage';
import { YouPageBody } from '../ui/YouPageBody';

/** Own profile (`/you`) — reels/posts/saved; edit at `/profile`. */
export default function YouPage() {
  const flow = useYouPage();
  const { me, isLoading, isError, refetch } = flow;

  if (isLoading) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        <ProfileHeaderSkeleton />
        <div className="grid grid-cols-3 gap-1.5 p-4">
          <Skeleton className="aspect-reel-poster rounded-icon" />
          <Skeleton className="aspect-reel-poster rounded-icon" />
          <Skeleton className="aspect-reel-poster rounded-icon" />
        </div>
      </div>
    );
  }

  if (isError || !me) {
    return (
      <div className="px-4 py-8">
        <ErrorState
          title="Couldn't Load Your Profile"
          description="Check your connection and try again."
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  return <YouPageBody flow={flow} />;
}
