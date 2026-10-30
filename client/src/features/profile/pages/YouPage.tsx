import { PageDock } from '@/shared/layout';
import { ErrorState, ProfileHeaderSkeleton, ReelGridSkeleton, SKELETON } from '@/shared/ui/states';

import { useYouPage } from '../ui/useYouPage';
import { YouPageBody } from '../ui/YouPageBody';

/** Own profile (`/you`) — reels/posts/saved; edit at `/profile`. */
export default function YouPage() {
  const flow = useYouPage();
  const { me, isLoading, isError, refetch } = flow;
  const reelCount = SKELETON.reelGrid;

  if (isLoading) {
    return (
      <PageDock header={<ProfileHeaderSkeleton />}>
        <ReelGridSkeleton count={reelCount} className="gap-1.5 p-4 [&>*]:rounded-icon" />
      </PageDock>
    );
  }

  if (isError || !me) {
    return (
      <PageDock>
        <div className="px-4 py-8">
          <ErrorState
            title="Couldn't Load Your Profile"
            description="Check your connection and try again."
            onRetry={() => void refetch()}
          />
        </div>
      </PageDock>
    );
  }

  return <YouPageBody flow={flow} />;
}
