import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { matchRoutes } from '@/features/matches';

import { LiveBadge } from '@/shared/ui/LiveBadge';
import { EmptyState, ErrorState, Skeleton } from '@/shared/ui/states';

import { useGetTournamentMatchesQuery } from '../api/tournamentsApi';
import type { TournamentFixture } from '../model/matchSchemas';

type TournamentFixturesPanelProps = {
  tournamentId: number;
  groupCount: number | null;
};

/** Public schedule — fixtures grouped by day; live/result rows link to `/match/:id`. */

export function TournamentFixturesPanel({ tournamentId, groupCount }: TournamentFixturesPanelProps) {
  const { data: fixtures = [], isLoading, isError, refetch } = useGetTournamentMatchesQuery(tournamentId);

  const days = useMemo(() => groupFixturesByDay(fixtures), [fixtures]);
  const hasGroups = (groupCount ?? 1) > 1;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[0, 1].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-card" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <ErrorState title="Could Not Load Fixtures" onRetry={() => void refetch()} />;
  }

  if (!fixtures.length) {
    return (
      <EmptyState
        title="No Fixtures Yet"
        description="The organizer hasn't published a schedule. Teams and squads may still be listed."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {days.map((day) => (
        <div key={day.key} className="flex flex-col gap-2.5">
          <h3 className="font-mono text-muted text-4xs font-bold tracking-eyebrow uppercase">{day.label}</h3>
          {day.items.map((fx) => {
            const linkable = fx.status === 'live' || fx.status === 'result';
            const inner = (
              <>
                <StatusChip status={fx.status} />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-xs font-bold text-ink">{fx.title}</span>
                  <span className="font-mono text-body text-4xs font-medium">
                    {fx.meta}
                    {hasGroups && fx.groupIndex != null ? ` · Group ${fx.groupIndex}` : ''}
                  </span>
                </span>
              </>
            );
            const className =
              'border-border-subtle bg-surface flex items-center gap-2.5 rounded-card border px-3.5 py-3';
            return linkable ? (
              <Link key={fx.id} to={matchRoutes.card(fx.id)} className={className}>
                {inner}
              </Link>
            ) : (
              <div key={fx.id} className={className}>
                {inner}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function groupFixturesByDay(fixtures: TournamentFixture[]) {
  const map = new Map<string, { key: string; label: string; items: TournamentFixture[] }>();
  for (const fx of fixtures) {
    const key = fx.matchDate ?? 'tba';
    const label = fx.matchDate
      ? new Date(`${fx.matchDate}T12:00:00`).toLocaleDateString(undefined, {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        })
      : 'Schedule TBA';
    const bucket = map.get(key) ?? { key, label, items: [] };
    bucket.items.push(fx);
    map.set(key, bucket);
  }
  return [...map.values()];
}

function StatusChip({ status }: { status: TournamentFixture['status'] }) {
  if (status === 'live') {
    return <LiveBadge variant="media" className="shrink-0" />;
  }
  const label = status === 'result' ? 'RESULT' : 'UPCOMING';
  return (
    <span className="border-border bg-surface-raised text-muted font-mono flex shrink-0 items-center rounded-md border px-2 py-0.5 text-4xs font-bold tracking-eyebrow">
      {label}
    </span>
  );
}
