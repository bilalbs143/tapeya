import { Link } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';
import { PageDock, ScreenBar } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { EmptyState, ErrorState, Skeleton } from '@/shared/ui/states';

import { CreateMatchTiles } from './CreateMatchTiles';
import { MatchListSections } from './MatchListSections';
import type { useMatchesList } from './useMatchesList';

type MatchesListFlow = ReturnType<typeof useMatchesList>;

type MatchesListBodyProps = {
  flow: MatchesListFlow;
};

/** Create tiles + sectioned match list for the scorer hub. */
export function MatchesListBody({ flow }: MatchesListBodyProps) {
  const { subtitle, matches, isLoading, isError, refetch, onResume, onSaveToss, onOpen, goHome } = flow;

  return (
    <PageDock header={<ScreenBar title="Matches" subtitle={subtitle} onBack={goHome} />}>
      <div className="flex flex-col gap-5 px-4 pt-4 pb-8">
        <CreateMatchTiles startMatchTo={APP_PATHS.startMatch} quickMatchTo={APP_PATHS.quickMatch} />

        {isLoading ? (
          <div className="flex flex-col gap-5" aria-busy="true" aria-label="Loading Matches">
            <section className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <Skeleton className="h-1.5 w-1.5 rounded-full" />
                <Skeleton className="h-2.5 w-12" />
              </div>
              <Skeleton className="h-[100px] w-full rounded-card" />
              <Skeleton className="h-[100px] w-full rounded-card" />
            </section>
            <section className="flex flex-col gap-2">
              <Skeleton className="h-2.5 w-20" />
              <div className="border-border-subtle overflow-hidden rounded-panel border">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`flex min-h-[52px] items-center gap-2.5 px-3.5${i < 2 ? ' border-border-subtle border-b' : ''}`}
                  >
                    <div className="flex w-10 shrink-0 flex-col items-center gap-1">
                      <Skeleton className="h-3.5 w-5" />
                      <Skeleton className="h-2 w-6" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-2 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : null}

        {isError ? (
          <ErrorState
            title="Couldn't Load Matches"
            description="Check your connection and try again."
            onRetry={() => void refetch()}
          />
        ) : null}

        {!isLoading && !isError && matches.length === 0 ? (
          <EmptyState
            title="No Matches Yet"
            description="Start a tournament fixture or a quick match — both land here."
            action={
              <Button variant="positive" asChild>
                <Link to={APP_PATHS.quickMatch}>Quick Match</Link>
              </Button>
            }
          />
        ) : null}

        {!isLoading && !isError && matches.length > 0 ? (
          <MatchListSections matches={matches} onResume={onResume} onSaveToss={onSaveToss} onOpen={onOpen} />
        ) : null}
      </div>
    </PageDock>
  );
}
