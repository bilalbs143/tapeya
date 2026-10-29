import { Link } from 'react-router-dom';

import type { ScorecardHubMatch } from '@/features/tournaments';

import { PageDock, ScreenBar } from '@/shared/layout';
import { Chip, ChipRow } from '@/shared/ui/Chip';
import { LiveBadge } from '@/shared/ui/LiveBadge';
import { EmptyState, ErrorState, Skeleton } from '@/shared/ui/states';

import { matchRoutes } from '../routes';
import type { useScorecardHub } from './useScorecardHub';

type ScorecardHubFlow = ReturnType<typeof useScorecardHub>;

type ScorecardHubBodyProps = {
  flow: ScorecardHubFlow;
};

function ScorecardMatchRow({ match }: { match: ScorecardHubMatch }) {
  return (
    <Link
      to={matchRoutes.card(match.id)}
      className="border-border-subtle bg-surface flex flex-col gap-2.5 rounded-card border px-3.5 py-3 hover:border-border"
    >
      <span className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          {match.status === 'live' ? (
            <LiveBadge />
          ) : (
            <span className="text-dim font-mono text-3xs font-bold tracking-eyebrow uppercase">
              {match.statusLabel}
            </span>
          )}
        </span>
        <span className="text-dim truncate font-mono text-3xs font-medium">{match.tournamentName}</span>
      </span>
      <span className="text-body-sm font-extrabold text-ink">{match.title}</span>
      <span className="text-muted text-2xs font-medium">{match.meta}</span>
    </Link>
  );
}

/** Tournament chips + fixture cards for the fan scorecard hub. */
export function ScorecardHubBody({ flow }: ScorecardHubBodyProps) {
  const {
    tournamentId,
    setTournamentId,
    matches,
    tournaments,
    showTournamentChips,
    isLoading,
    isError,
    refetch,
    goBack,
  } = flow;

  return (
    <PageDock header={<ScreenBar title="Score Card" subtitle="Open Tournament Fixtures" onBack={goBack} />}>
      <div className="flex flex-col gap-2.5 px-4 pt-4 pb-6">
        {showTournamentChips ? (
          <ChipRow>
            <Chip size="sm" selected={tournamentId === 'all'} onClick={() => setTournamentId('all')}>
              All
            </Chip>
            {tournaments.map((t) => (
              <Chip key={t.id} size="sm" selected={tournamentId === t.id} onClick={() => setTournamentId(t.id)}>
                {t.name}
              </Chip>
            ))}
          </ChipRow>
        ) : null}

        {isLoading ? (
          <div className="flex flex-col gap-2.5" aria-busy="true" aria-label="Loading Scorecards">
            <div className="flex gap-2 overflow-hidden">
              {['All', 'Cup', 'League'].map((label) => (
                <Skeleton key={label} className="h-7 w-14 shrink-0 rounded-full" />
              ))}
            </div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="border-border-subtle flex flex-col gap-2.5 rounded-card border px-3.5 py-3">
                <div className="flex items-center justify-between gap-2">
                  <Skeleton className="h-2.5 w-12" />
                  <Skeleton className="h-2.5 w-24" />
                </div>
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-2.5 w-1/2" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <ErrorState title="Could Not Load Scorecards" onRetry={() => void refetch()} />
          </div>
        ) : matches.length ? (
          matches.map((m) => <ScorecardMatchRow key={m.id} match={m} />)
        ) : (
          <EmptyState
            title="No Matches Yet"
            description="Fixtures from open tournaments show up here as they are scheduled."
          />
        )}
      </div>
    </PageDock>
  );
}
