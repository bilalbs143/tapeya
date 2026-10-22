import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';

import { useGetMatchLiveSnapshotQuery } from '../api/matchesApi';
import type { MatchLiveSnapshot } from '../model/liveSchemas';
import type { Match } from '../model/schemas';

type ScorerLiveCardProps = {
  match: Match;
  onResume: () => void;
};

/** Scorer live card — short codes, overs pill, chase line; totals from match-state. */

export function ScorerLiveCard({ match, onResume }: ScorerLiveCardProps) {
  const { data: live } = useGetMatchLiveSnapshotQuery(
    {
      matchId: match.id,
      homeId: match.home?.id ?? null,
      awayId: match.away?.id ?? null,
    },
    { pollingInterval: 15_000 }
  );

  const place = [match.tournamentShort, match.venueName].filter(Boolean).join(' · ');
  const pill = livePill(match, live);
  const batting = live?.batting === 'away' ? match.away : match.home;
  const fielding = live?.batting === 'away' ? match.home : match.away;
  const battingScore = live?.batting === 'away' ? live.awayScore : (live?.homeScore ?? null);
  const fieldingScore = live?.batting === 'away' ? live.homeScore : (live?.awayScore ?? null);
  const chase = chaseLine(match, live);

  return (
    <div className="border-positive/45 bg-surface rounded-card border p-3.5">
      <div className="mb-2.5 flex items-center gap-2.5">
        <span className="bg-positive/14 text-positive font-mono rounded-chip px-1.5 py-0.5 text-4xs leading-normal font-bold tracking-eyebrow uppercase">
          {pill}
        </span>
        {place ? <span className="font-mono text-dim truncate text-4xs font-medium uppercase">{place}</span> : null}
      </div>

      <div className={cn(chase ? 'mb-1' : 'mb-3')}>
        <p className="text-body-lg leading-normal font-extrabold text-ink">
          {batting?.short ?? 'HOME'} <span className="font-mono">{battingScore || '—'}</span>
        </p>
        <p className="text-muted mt-0.5 text-xs leading-normal font-semibold">
          {fielding?.short ?? 'AWAY'}{' '}
          {fieldingScore ? (
            <span className="font-mono">{fieldingScore}</span>
          ) : (
            <span className="font-mono text-dim text-4xs font-semibold tracking-[.04em] uppercase">yet to bat</span>
          )}
        </p>
      </div>

      {chase ? <p className="text-positive mb-3 text-2xs leading-normal font-semibold">{chase}</p> : null}

      <Button variant="positive" className="h-11 w-full rounded-panel text-body-sm font-extrabold" onClick={onResume}>
        Resume Scoring
      </Button>
    </div>
  );
}

function livePill(match: Match, live: MatchLiveSnapshot | null | undefined): string {
  if (!live) {
    const overs = match.overs != null ? `${match.overs} overs` : null;
    return ['In Progress', overs].filter(Boolean).join(' · ');
  }
  if (live.inningsBreak) return 'Innings Break';
  const phase = live.inningsNumber >= 2 ? '2nd Innings' : '1st Innings';
  return live.oversDisplay ? `${phase} · ${live.oversDisplay}` : phase;
}

function chaseLine(match: Match, live: MatchLiveSnapshot | null | undefined): string | null {
  if (!live?.chase || live.inningsBreak) return null;
  const chasing = live.batting === 'away' ? match.away : match.home;
  const { need, ballsLeft } = live.chase;
  if (need <= 0) return null;
  if (ballsLeft != null) return `${chasing?.short ?? 'Side'} need ${need} runs from ${ballsLeft} balls`;
  return `${chasing?.short ?? 'Side'} need ${need} runs`;
}
