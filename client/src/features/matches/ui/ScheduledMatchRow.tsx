import { cn } from '@/shared/lib/cn';

import { useGetMatchResultQuery } from '../api/matchesApi';
import { dateParts, shortDate, timeOf } from '../lib/format';
import type { Match } from '../model/schemas';

type ScheduledMatchRowProps = {
  match: Match;
  onOpen: () => void;
  className?: string | undefined;
};

export function ScheduledMatchRow({ match, onOpen, className }: ScheduledMatchRowProps) {
  const { mon, day } = dateParts(match.matchDate ?? match.createdAt);
  const title =
    match.home && match.away
      ? `${match.home.short} vs ${match.away.short}`
      : match.home?.name && match.away?.name
        ? `${match.home.name} vs ${match.away.name}`
        : 'Match';
  const meta = match.tournamentShort
    ? [timeOf(match.matchTime), match.overs != null ? `${match.overs} overs` : match.formatLabel]
        .filter(Boolean)
        .join(' · ')
    : `Quick Match · ${match.overs ?? 10} overs`;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'hover:bg-surface-raised/80 focus-visible:outline-brand flex min-h-[52px] w-full items-center gap-2.5 px-3.5 text-left focus-visible:outline-2 focus-visible:-outline-offset-2',
        className
      )}
    >
      <div className="w-10 shrink-0 text-center">
        <span className="font-mono block text-body-sm leading-none font-extrabold text-ink">{day}</span>
        <span className="font-mono text-dim mt-0.5 block text-4xs font-semibold tracking-wide uppercase">{mon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-body-sm font-bold text-ink">{title}</p>
        <p className="font-mono text-dim mt-0.5 truncate text-4xs leading-normal font-medium tracking-wide uppercase">
          {meta}
        </p>
      </div>
      <span className="text-dim text-body-lg leading-normal font-semibold" aria-hidden>
        ›
      </span>
    </button>
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
