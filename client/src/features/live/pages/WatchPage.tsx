import { Link, useParams } from 'react-router-dom';

import { ScreenBar } from '@/shared/layout';
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

  if (!valid) {
    return (
      <div className="bg-surface flex min-h-full flex-col px-4 py-8">
        <EmptyState
          title="Stream Not Found"
          description="It may have ended and been taken down."
          action={
            <Button asChild variant="secondary">
              <Link to={liveRoutes.list()}>Back to Live</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (streamQuery.isLoading) {
    return (
      <div className="bg-surface flex min-h-full flex-col" aria-busy="true" aria-label="Loading Stream">
        <ScreenBar title="Live" subtitle="Watch" onBack={goLiveList} />
        <Skeleton className="aspect-video w-full rounded-none" />
        <div className="flex flex-col gap-3 px-4 pt-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (streamQuery.isError || !stream) {
    return (
      <div className="bg-surface flex min-h-full flex-col gap-4 px-4 py-8">
        <ErrorState title="Couldn't Load This Stream" onRetry={() => void streamQuery.refetch()} />
        <Button asChild variant="secondary" className="mx-auto">
          <Link to={liveRoutes.list()}>Back to Live</Link>
        </Button>
      </div>
    );
  }

  return <WatchPageBody flow={flow} stream={stream} />;
}
