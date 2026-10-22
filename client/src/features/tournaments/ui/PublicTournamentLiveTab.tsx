import { Link } from 'react-router-dom';

import { type HomeLiveMatch, useGetHomeLiveScoresQuery } from '@/features/feed';
import { matchRoutes } from '@/features/matches';

import { BallChip } from '@/shared/ui/BallChip';
import { Spinner } from '@/shared/ui/Spinner';
import { EmptyState, ErrorState } from '@/shared/ui/states';

import { useGetTournamentMatchesQuery } from '../api/tournamentsApi';

type PublicTournamentLiveTabProps = {
  tournamentId: number;
};

/** Public `/tournaments/:id` Live tab — rich live-score cards for this tournament, else live fixtures. */

export function PublicTournamentLiveTab({ tournamentId }: PublicTournamentLiveTabProps) {
  const liveScores = useGetHomeLiveScoresQuery(undefined, { pollingInterval: 60_000 });
  const fixtures = useGetTournamentMatchesQuery(tournamentId);

  if (liveScores.isLoading && fixtures.isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner label="Loading Live Matches" />
      </div>
    );
  }

  if (liveScores.isError && fixtures.isError) {
    return (
      <ErrorState
        title="Couldn't Load Live Matches"
        onRetry={() => {
          void liveScores.refetch();
          void fixtures.refetch();
        }}
      />
    );
  }

  const rich = (liveScores.data ?? []).filter((m) => m.tournamentId === tournamentId);
  if (rich.length > 0) {
    return (
      <ul className="flex flex-col gap-2.5">
        {rich.map((m) => (
          <li key={m.id}>
            <TournamentLiveCard match={m} />
          </li>
        ))}
      </ul>
    );
  }

  const liveFixtures = (fixtures.data ?? []).filter((fx) => fx.status === 'live');
  if (liveFixtures.length > 0) {
    return (
      <ul className="flex flex-col gap-2">
        {liveFixtures.map((fx) => (
          <li key={fx.id}>
            <Link
              to={matchRoutes.card(fx.id)}
              className="border-border-subtle bg-surface flex items-center gap-2.5 rounded-card border px-3.5 py-3"
            >
              <span className="bg-danger-text font-mono flex shrink-0 items-center gap-1.5 rounded-md px-2 py-0.5 text-4xs font-bold tracking-eyebrow text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                LIVE
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-bold text-ink">{fx.title}</span>
                <span className="font-mono text-body block text-4xs font-medium">{fx.meta}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <EmptyState title="No Live Matches" description="When a fixture in this tournament goes live, it shows up here." />
  );
}

function TournamentLiveCard({ match }: { match: HomeLiveMatch }) {
  const homeActive = match.batting === 'home';
  const awayActive = match.batting === 'away';
  const chaseNeed = match.chase ? Math.max(0, match.chase.target - match.chase.runs) : null;

  return (
    <Link
      to={matchRoutes.card(match.id)}
      className="border-border-subtle bg-surface block rounded-card border px-3.5 py-3.5"
    >
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <span className="text-navy-text font-mono text-4xs font-semibold tracking-[.1em] uppercase">
          {match.label || `${match.format ?? 'Live'} · ${match.venue ?? ''}`}
        </span>
        <span className="font-mono bg-danger/20 text-danger-text rounded-full px-1.5 py-0.5 text-4xs leading-normal font-bold tracking-[.12em]">
          LIVE
        </span>
      </div>

      <ScoreLine name={match.home.name} score={match.homeScore} overs={match.homeOvers} active={homeActive} />
      <ScoreLine
        name={match.away.name}
        score={match.awayScore ?? (awayActive ? match.score : null)}
        overs={match.awayOvers ?? (awayActive ? match.overs : null)}
        active={awayActive}
        yetToBat={!awayActive && !match.awayScore}
        className="mb-2.5"
      />

      {match.chase ? (
        <p className="text-positive-2 text-2xs font-semibold">
          Need {chaseNeed} off {match.chase.ballsLeft}
          {match.chase.rrr ? <span className="text-muted font-normal"> · rrr {match.chase.rrr}</span> : null}
        </p>
      ) : (
        <p className="text-dim text-2xs font-semibold">1st innings</p>
      )}

      {match.over.length ? (
        <div className="mt-2.5 flex items-center gap-1.5">
          <span className="text-dim font-mono text-4xs font-bold tracking-[.1em] uppercase">OV {match.overNum}</span>
          <span className="flex gap-1">
            {match.over.slice(0, 6).map((b, i) => (
              <BallChip key={`${match.id}-${i}`} value={b} className="h-5 w-5 text-4xs leading-normal" />
            ))}
          </span>
        </div>
      ) : null}
    </Link>
  );
}

function ScoreLine({
  name,
  score,
  overs,
  active,
  yetToBat,
  className,
}: {
  name: string;
  score: string | null;
  overs: string | null;
  active: boolean;
  yetToBat?: boolean | undefined;
  className?: string | undefined;
}) {
  return (
    <div className={`flex items-baseline justify-between gap-2 ${className ?? ''}`}>
      <span className={`min-w-0 truncate text-2xs ${active ? 'font-extrabold text-ink' : 'font-semibold text-body'}`}>
        {name}
      </span>
      <span className="font-mono shrink-0 text-2xs tabular-nums">
        {yetToBat ? (
          <span className="text-dim">Yet to Bat</span>
        ) : (
          <>
            <span className={active ? 'font-extrabold text-ink' : 'font-bold text-ink'}>{score ?? '—'}</span>
            {overs ? <span className="text-dim ml-1 font-medium">({overs})</span> : null}
          </>
        )}
      </span>
    </div>
  );
}
