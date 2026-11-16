import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';

import { useGetMatchResultQuery } from '../api/matchesApi';
import { dateParts, shortDate, timeOf } from '../lib/format';
import type { Match } from '../model/schemas';

type ScheduledMatchRowProps = {
  match: Match;
  /** Toss saved — open scoring desk. */
  onScore: () => void;
};

/** Toss-done / scheduled-with-toss — same CTA pattern as Save Toss. */
export function ScheduledMatchRow({ match, onScore }: ScheduledMatchRowProps) {
  const { mon, day } = dateParts(match.matchDate ?? match.createdAt);
  const home = match.home?.short ?? match.home?.name ?? 'HOME';
  const away = match.away?.short ?? match.away?.name ?? 'AWAY';
  const meta = [
    timeOf(match.matchTime) || null,
    match.overs != null ? `${match.overs} overs` : null,
    match.tournamentShort ?? 'Quick Match',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="border-brand/45 bg-surface flex items-center gap-3 rounded-card border px-3.5 py-3.5">
      <div className="w-10 shrink-0 text-center" aria-hidden>
        <span className="font-mono block text-body-sm leading-none font-extrabold text-ink">{day}</span>
        <span className="font-mono text-dim mt-0.5 block text-4xs font-semibold tracking-wide uppercase">{mon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-body-sm font-bold tracking-tight text-ink">
          {home} <span className="text-dim">vs</span> {away}
        </p>
        <p className="font-mono text-dim mt-1 truncate text-4xs font-medium tracking-wide uppercase">{meta}</p>
      </div>
      <Button
        size="sm"
        className="h-9 shrink-0 rounded-icon px-3.5 text-xs leading-normal font-extrabold"
        onClick={onScore}
      >
        Start Scoring
      </Button>
    </div>
  );
}

type DoneMatchRowProps = {
  match: Match;
  onOpen: () => void;
  className?: string | undefined;
};

/** Done row — result + MOTM from GET /matches/:id when the list omits them. */
export function DoneMatchRow({ match, onOpen, className }: DoneMatchRowProps) {
  const { data: detail } = useGetMatchResultQuery(match.id);
  const line =
    detail?.resultSummary || (match.home && match.away ? `${match.home.name} vs ${match.away.name}` : 'Match Complete');
  const foot = [
    shortDate(match.matchDate ?? match.createdAt),
    detail?.motmName ? `MOTM ${detail.motmName}` : match.statusLabel,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'hover:bg-surface-raised/80 focus-visible:outline-brand flex min-h-[52px] w-full items-center gap-2.5 px-3.5 py-2.5 text-left focus-visible:outline-2 focus-visible:-outline-offset-2',
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-muted text-body-sm leading-snug font-bold">{line}</p>
        {foot ? (
          <p className="font-mono text-dim mt-1 text-4xs leading-normal font-medium tracking-wide uppercase">{foot}</p>
        ) : null}
      </div>
      <span className="text-dim text-body-lg leading-normal font-semibold" aria-hidden>
        ›
      </span>
    </button>
  );
}
