import { Link, useParams } from 'react-router-dom';

import { DockScreen } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { EmptyState, ErrorState, Skeleton } from '@/shared/ui/states';

import { liveRoutes } from '../routes';
import { useWatchPage } from '../ui/useWatchPage';
import { WatchPageBody } from '../ui/WatchPageBody';

/** Live watch — ScreenBar + player; portrait self-serve stays upright; URL/match streams can rotate. */
export default function WatchPage() {
  const params = useParams();
  const streamId = Number(params.streamId);
  const valid = Number.isFinite(streamId) && streamId > 0;

  const flow = useWatchPage(streamId, valid);
  const { streamQuery, stream, goLiveList } = flow;

  if (valid && !streamQuery.isLoading && !streamQuery.isError && stream) {
    return <WatchPageBody flow={flow} stream={stream} />;
  }

  return (
    <DockScreen title="Live" subtitle={valid ? 'Watch' : undefined} onBack={goLiveList}>
      {!valid ? (
        <EmptyState
          size="lg"
          title="Stream Not Found"
          description="It may have ended and been taken down."
          action={
            <Button asChild variant="secondary">
              <Link to={liveRoutes.list()}>Back to Live</Link>
            </Button>
          }
        />
      ) : streamQuery.isLoading ? (
        <>
          <Skeleton className="aspect-video w-full rounded-none" />
          <div className="flex flex-col gap-3 px-4 pt-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </>
      ) : (
        <ErrorState
          page
          title="Couldn't Load This Stream"
          onRetry={() => void streamQuery.refetch()}
          action={
            <Button asChild variant="secondary">
              <Link to={liveRoutes.list()}>Back to Live</Link>
            </Button>
          }
        />
      )}
    </DockScreen>
  );
}
