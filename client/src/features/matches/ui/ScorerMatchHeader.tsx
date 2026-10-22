import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';
import { Avatar } from '@/shared/ui/Avatar';
import { IconButton } from '@/shared/ui/IconButton';
import { ChevronLeftIcon } from '@/shared/ui/icons';

import type { ConnectionState } from './ConnectionBanner';

export type ScorerHeaderSide = {
  name: string;
  short: string;
};

export type ScorerChase = {
  need: number;
  ballsLeft: number | null;
  target: number;
};

type ScorerMatchHeaderProps = {
  home: ScorerHeaderSide | null;
  away: ScorerHeaderSide | null;
  batting: ScorerHeaderSide | null;
  inningsNumber: number;
  runs: number;
  wickets: number;
  oversDisplay: string | null;
  oversPerSide: number | null;
  venue: string | null;
  currentRunRate: string | null;
  /** Current-over tokens — CRR under identity once any ball is bowled (1st inn). */
  overTokens: string[];
  chase: ScorerChase | null;
  onBack: () => void;
  action?: ReactNode | undefined;
  /** Online: green dot beside score; degraded: save-meta replaces overs. */
  connection?: ConnectionState | undefined;
  lastSent?: string | null | undefined;
  className?: string | undefined;
};

/** 1st inn: CRR + overs under score. 2nd: chase in meta. Degraded connection swaps overs for save-meta. */
export function ScorerMatchHeader({
  home,
  away,
  batting,
  inningsNumber,
  runs,
  wickets,
  oversDisplay,
  oversPerSide,
  venue,
  currentRunRate,
  overTokens,
  chase,
  onBack,
  action = null,
  connection = 'online',
  lastSent = null,
  className,
}: ScorerMatchHeaderProps) {
  const inningsPill = inningsNumber >= 2 ? '2nd innings' : '1st innings';
  const healthy = !connection || connection === 'online';
  const saveMeta =
    connection === 'reconnecting'
      ? `${oversDisplay ?? '—'} · SAVED ON THIS PHONE`
      : connection === 'offline'
        ? `${oversDisplay ?? '—'} · LAST SENT AT ${lastSent ?? '—'}`
        : null;
  const showCrr = overTokens.length > 0 && !chase && Boolean(currentRunRate) && !saveMeta;
  const headerMeta = [
    venue,
    oversPerSide != null ? `${oversPerSide} OVERS` : null,
    chase ? `TARGET ${chase.target}` : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const oversLine = (
    <>
      {oversDisplay ?? '—'}
      {oversPerSide != null ? ` / ${oversPerSide} OVERS` : oversDisplay ? ' OV' : ''}
    </>
  );

  const leftMeta = saveMeta ? (
    <span className="min-w-0 flex-1" />
  ) : chase ? (
    <p className="font-mono text-muted min-w-0 flex-1 truncate text-2xs font-semibold tabular-nums">
      <span className="text-positive-light font-bold">{chase.need} to win</span>
      {chase.ballsLeft != null ? <span> from {chase.ballsLeft} balls</span> : null}
    </p>
  ) : showCrr ? (
    <p className="font-mono text-muted min-w-0 flex-1 truncate text-2xs font-semibold tabular-nums">
      CRR {currentRunRate}
    </p>
  ) : (
    <span className="min-w-0 flex-1" />
  );

  return (
    <header
      data-surface="navy"
      className={cn(
        'bg-brand-deep border-ink/10 shrink-0 border-b px-4 pt-[max(10px,env(safe-area-inset-top))] pb-3.5',
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        <IconButton
          label="Back"
          size="lg"
          variant="ghost"
          onClick={onBack}
          className="focus-visible:outline-ink text-body hover:text-ink -ml-3"
        >
          <ChevronLeftIcon className="h-4.5 w-4.5" strokeWidth={2.2} />
        </IconButton>
        <div className="min-w-0 flex-1">
          <p className="flex min-w-0 items-center gap-2 truncate text-sm font-bold text-ink">
            <span className="font-mono bg-danger text-ink inline-flex shrink-0 items-center gap-1 rounded-chip px-2 py-0.5 text-4xs font-bold tracking-eyebrow">
              <span className="bg-ink h-1 w-1 rounded-full" aria-hidden />
              LIVE
            </span>
            <span className="truncate">
              {home?.short ?? 'HOME'} <span className="text-muted">vs</span> {away?.short ?? 'AWAY'}
            </span>
          </p>
          {headerMeta ? (
            <p className="font-mono text-muted mt-0.5 text-3xs tracking-eyebrow uppercase">{headerMeta}</p>
          ) : null}
        </div>
        {action}
      </div>

      <div className="mt-3 flex items-start gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Avatar name={batting?.name ?? batting?.short ?? 'Bat'} size="sm" crest className="ring-ink/15 ring-2" />
          <span className="truncate text-body-lg font-extrabold tracking-tight text-ink">
            {batting?.short ?? 'BAT'}
          </span>
          <span className="font-mono bg-surface-raised text-muted shrink-0 rounded-chip px-2 py-0.5 text-4xs font-bold uppercase">
            {inningsPill}
          </span>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2">
          <p className="font-mono text-score font-extrabold text-ink tabular-nums">
            {runs}
            <span className="text-muted">/{wickets}</span>
          </p>
          {healthy ? <ConnectedDot /> : null}
        </div>
      </div>

      <div className="mt-1 flex items-baseline justify-between gap-3">
        {leftMeta}
        <p className="font-mono text-muted shrink-0 text-2xs font-semibold uppercase tabular-nums">
          {saveMeta ?? oversLine}
        </p>
      </div>
    </header>
  );
}

/** Online: green dot beside score (ConnectionBanner owns the strip). */

function ConnectedDot() {
  return (
    <span
      className="bg-positive ring-positive/20 h-1.5 w-1.5 shrink-0 rounded-full ring-3"
      title="Connected"
      aria-label="Connected"
    />
  );
}
