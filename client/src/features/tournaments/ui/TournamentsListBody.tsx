import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';
import { PageDock, ScreenBar } from '@/shared/layout';
import { cn } from '@/shared/lib/cn';
import { Alert } from '@/shared/ui/Alert';
import { Button } from '@/shared/ui/Button';
import { PlusIcon, TrophyIcon } from '@/shared/ui/icons';
import { EmptyState, Skeleton } from '@/shared/ui/states';

import type { Tournament } from '../model/schemas';
import { TournamentCard } from './TournamentCard';
import type { useTournamentsList } from './useTournamentsList';

type TournamentsListFlow = ReturnType<typeof useTournamentsList>;

type TournamentsListBodyProps = {
  flow: TournamentsListFlow;
};

function HubSection({ title, count, children }: { title: string; count?: number | undefined; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <div className="mb-0.5 flex items-baseline justify-between">
        <h2 className="font-mono text-4xs font-bold tracking-eyebrow text-muted uppercase">{title}</h2>
        {count != null ? <span className="text-brand-text font-mono text-4xs font-bold">{count}</span> : null}
      </div>
      {children}
    </section>
  );
}

function HubSkeleton() {
  return (
    <div className={cn('border-border-subtle bg-surface overflow-hidden rounded-card border p-3.5')}>
      <div className="flex gap-3">
        <Skeleton className="h-14 w-14 rounded-panel" />
        <div className="flex flex-1 flex-col gap-2 pt-1">
          <Skeleton className="h-3.5 w-2/3" />
          <Skeleton className="h-2.5 w-4/5" />
          <Skeleton className="h-2.5 w-1/2" />
        </div>
      </div>
      <div className="mt-3 flex gap-1.5">
        <Skeleton className="h-14 flex-1 rounded-panel" />
        <Skeleton className="h-14 flex-1 rounded-panel" />
      </div>
      <Skeleton className="mt-3 h-12 w-full rounded-none" />
    </div>
  );
}

function HubBody({ needsYou, previous }: { needsYou: Tournament[]; previous: Tournament[] }) {
  return (
    <>
      {needsYou.length ? (
        <HubSection title="Active" count={needsYou.length}>
          {needsYou.map((t) => (
            <TournamentCard key={t.id} tournament={t} />
          ))}
        </HubSection>
      ) : null}

      {previous.length ? (
        <HubSection title="Previous">
          {previous.map((t) => (
            <TournamentCard key={t.id} tournament={t} />
          ))}
        </HubSection>
      ) : null}
    </>
  );
}

/** ScreenBar + empty create CTA or Active · Previous hub. */
export function TournamentsListBody({ flow }: TournamentsListBodyProps) {
  const { isLoading, isError, refetch, needsYou, previous, isEmpty, summary, goHome, goCreate } = flow;

  return (
    <PageDock
      header={
        <ScreenBar
          title="My Tournaments"
          subtitle={summary}
          onBack={goHome}
          action={
            !isEmpty && !isLoading ? (
              <Button
                size="sm"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-icon p-0"
                aria-label="Create Tournament"
                onClick={goCreate}
              >
                <PlusIcon size="sm" strokeWidth={2.6} />
              </Button>
            ) : undefined
          }
        />
      }
    >
      {isEmpty ? (
        <EmptyState
          size="lg"
          className="min-h-full"
          icon={<TrophyIcon size="lg" className="text-brand-text" />}
          title="No Tournaments Yet"
          description="Pick the format, dates and venue. Your workspace opens as soon as you create — then add teams and fixtures."
          action={
            <div className="flex w-full max-w-xs flex-col gap-2">
              <Button className="min-h-12 font-bold" onClick={goCreate}>
                Create Tournament
              </Button>
              <Button variant="secondary" className="min-h-11 font-semibold" asChild>
                <Link to={APP_PATHS.matches}>Score a Quick Match Instead</Link>
              </Button>
            </div>
          }
        />
      ) : null}

      {!isEmpty ? (
        <div className="flex flex-col gap-5 px-4 pt-4 pb-6">
          {isLoading ? (
            <>
              <HubSkeleton />
              <HubSkeleton />
            </>
          ) : null}

          {isError ? (
            <Alert
              tone="danger"
              title="Couldn't Load Your Tournaments"
              description="Check your connection and try again."
              action={
                <Button size="sm" variant="secondary" onClick={() => void refetch()}>
                  Try Again
                </Button>
              }
            />
          ) : null}

          {!isLoading ? <HubBody needsYou={needsYou} previous={previous} /> : null}
        </div>
      ) : null}
    </PageDock>
  );
}
