import { Link } from 'react-router-dom';

import { ScreenBar } from '@/shared/layout';
import { PinIcon } from '@/shared/ui/icons';
import { EmptyState, ErrorState, Skeleton } from '@/shared/ui/states';

import { upcomingTournamentFixturesLine, upcomingTournamentPlace } from '../lib/upcomingTournaments';
import { formatTournamentDateRange, type Tournament } from '../model/schemas';
import { tournamentRoutes } from '../tournamentPaths';
import type { useUpcomingTournaments } from './useUpcomingTournaments';

type UpcomingTournamentsFlow = ReturnType<typeof useUpcomingTournaments>;

type UpcomingTournamentsBodyProps = {
  flow: UpcomingTournamentsFlow;
};

function UpcomingCard({ tournament: t }: { tournament: Tournament }) {
  const place = upcomingTournamentPlace(t.city, t.country);
  const dates = formatTournamentDateRange(t.startDate, t.endDate);
  const fixturesLine = upcomingTournamentFixturesLine(t.matchesCount);

  return (
    <Link
      to={tournamentRoutes.public(t.id)}
      className="border-border-subtle bg-surface overflow-hidden rounded-card border hover:border-border"
    >
      <span className="border-border-subtle text-dim flex h-[118px] items-center justify-center overflow-hidden border-b bg-[repeating-linear-gradient(135deg,var(--c-surface-raised),var(--c-surface-raised)_8px,var(--c-page)_8px,var(--c-page)_16px)] font-mono text-4xs font-semibold tracking-eyebrow uppercase">
        {t.coverImage ? <img src={t.coverImage} alt="" className="h-full w-full object-cover" /> : 'Cover Image'}
      </span>
      <span className="flex flex-col gap-1 px-3.5 py-3">
        <span className="text-sm leading-normal font-extrabold text-ink">{t.name}</span>
        <span className="font-mono text-body text-3xs leading-normal font-medium">{dates}</span>
        {place ? (
          <span className="text-dim mt-0.5 inline-flex items-center gap-1.5 text-2xs">
            <PinIcon size="xs" className="h-3 w-3 shrink-0" strokeWidth={1.9} />
            {place}
          </span>
        ) : null}
        {fixturesLine ? (
          <span className="text-brand-text mt-0.5 text-3xs leading-normal font-semibold">{fixturesLine}</span>
        ) : null}
      </span>
    </Link>
  );
}

/** Upcoming open-tournament cards for fans. */
export function UpcomingTournamentsBody({ flow }: UpcomingTournamentsBodyProps) {
  const { upcoming, isLoading, isError, refetch, goBack } = flow;

  return (
    <div className="bg-surface flex min-h-full flex-col">
      <ScreenBar title="Upcoming Tournaments" subtitle="Open Events You Can Follow" onBack={goBack} />

      <div className="flex flex-col gap-2.5 px-4 pt-3.5 pb-6">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-card" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <ErrorState title="Could Not Load Tournaments" onRetry={() => void refetch()} />
          </div>
        ) : upcoming.length ? (
          upcoming.map((t) => <UpcomingCard key={t.id} tournament={t} />)
        ) : (
          <EmptyState
            title="No Upcoming Tournaments"
            description="Open tournaments with active schedules appear here."
          />
        )}
      </div>
    </div>
  );
}
