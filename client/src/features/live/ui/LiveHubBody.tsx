import { PageDock, ScreenBar } from '@/shared/layout';
import { EmptyState, ErrorState, StreamCardSkeleton } from '@/shared/ui/states';

import { StreamCard } from './StreamCard';
import type { useLiveHub } from './useLiveHub';

type LiveHubFlow = ReturnType<typeof useLiveHub>;

type LiveHubBodyProps = {
  flow: LiveHubFlow;
};

/** Live-only stream cards for the hub. */
export function LiveHubBody({ flow }: LiveHubBodyProps) {
  const { streams, isLoading, isError, isFetching, refetch, goHome } = flow;

  return (
    <PageDock header={<ScreenBar title="Live" subtitle="Watch Live Streams" onBack={goHome} />}>
      <div className="flex flex-col gap-3.5 px-4 pt-3.5 pb-6">
        {isLoading ? (
          <ul className="-mx-4 flex flex-col" aria-busy="true" aria-label="Loading Live Streams">
            <StreamCardSkeleton />
            <StreamCardSkeleton />
          </ul>
        ) : isError ? (
          <ErrorState
            className="min-h-80 justify-center"
            title="Could Not Load Live Matches"
            description="The stream list didn't come back. It's usually a moment's connection trouble."
            onRetry={() => void refetch()}
          />
        ) : streams.length === 0 ? (
          <EmptyState
            size="lg"
            title="No Live Broadcasts Right Now"
            description="When a match or a phone camera goes on air, it lands here first."
          />
        ) : (
          <ul className="-mx-4 flex flex-col" aria-busy={isFetching || undefined}>
            {streams.map((s) => (
              <StreamCard key={s.id} stream={s} />
            ))}
          </ul>
        )}
      </div>
    </PageDock>
  );
}
