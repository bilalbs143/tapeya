import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

import type { BowlerLine, CreasePlayer } from '../model/scoringSession';

type CreaseStripProps = {
  striker: CreasePlayer | null;
  nonStriker: CreasePlayer | null;
  bowler: BowlerLine | null;
  empty?: boolean | undefined;
  awaitingBowler?: boolean | undefined;
  className?: string | undefined;
};

function sr(player: CreasePlayer): string {
  if (player.balls <= 0) return '—';
  return ((player.runs / player.balls) * 100).toFixed(1);
}

export function CreaseStrip({
  striker,
  nonStriker,
  bowler,
  empty = false,
  awaitingBowler = false,
  className,
}: CreaseStripProps) {
  const showEmpty = empty || (!striker && !nonStriker);
  const showBowling = showEmpty || Boolean(bowler) || awaitingBowler;

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="border-border-subtle bg-surface overflow-hidden rounded-card border">
        <SectionHead
          title="At the Crease"
          cols={
            showEmpty ? (
              'R · B · 4s · 6s · SR'
            ) : (
              <>
                <span className="w-7 text-right">R</span>
                <span className="w-7 text-right">B</span>
                <span className="w-7 text-right">4s</span>
                <span className="w-7 text-right">6s</span>
                <span className="w-9 text-right">SR</span>
              </>
            )
          }
        />
        {showEmpty ? (
          <>
            <EmptyRow label="Striker — Not Set" dashed />
            <EmptyRow label="Non-Striker — Not Set" last />
          </>
        ) : (
          <>
            <BatterRow player={striker} onStrike />
            <BatterRow player={nonStriker} last />
          </>
        )}
      </div>

      {showBowling ? (
        <div className="border-border-subtle bg-surface overflow-hidden rounded-card border">
          <SectionHead
            title="Bowling"
            cols={
              bowler && !showEmpty ? (
                <>
                  <span className="w-8 text-right">O</span>
                  <span className="w-6 text-right">M</span>
                  <span className="w-7 text-right">R</span>
                  <span className="w-6 text-right">W</span>
                  <span className="w-10 text-right">Econ</span>
                </>
              ) : (
                'O · M · R · W · Econ'
              )
            }
          />
          {bowler && !showEmpty ? (
            <div className="flex min-h-11 items-center gap-1 px-3.5">
              <span className="min-w-0 flex-1 truncate pl-3 text-xs leading-normal font-bold text-ink">
                {bowler.name}
              </span>
              <span className="font-mono w-8 text-right text-2xs font-semibold text-ink tabular-nums">
                {bowler.overs}
              </span>
              <span className="font-mono text-muted w-6 text-right text-2xs font-semibold tabular-nums">
                {bowler.maidens}
              </span>
              <span className="font-mono text-muted w-7 text-right text-2xs font-semibold tabular-nums">
                {bowler.runs}
              </span>
              <span className="font-mono w-6 text-right text-xs leading-normal font-extrabold text-ink tabular-nums">
                {bowler.wickets}
              </span>
              <span className="font-mono text-muted w-10 text-right text-2xs font-semibold tabular-nums">
                {bowler.econ}
              </span>
            </div>
          ) : (
            <EmptyRow label="Bowler — Not Set" last dashed={awaitingBowler} bowling />
          )}
        </div>
      ) : null}
    </div>
  );
}

function SectionHead({ title, cols }: { title: string; cols: ReactNode }) {
  return (
    <div className="font-mono text-dim border-border-subtle/70 flex min-h-8 items-center gap-1 border-b bg-page-deep/40 px-3.5 text-4xs font-bold tracking-eyebrow uppercase">
      <span className="min-w-0 flex-1">{title}</span>
      {typeof cols === 'string' ? <span className="text-right">{cols}</span> : cols}
    </div>
  );
}

function BatterRow({
  player,
  onStrike = false,
  last = false,
}: {
  player: CreasePlayer | null;
  onStrike?: boolean | undefined;
  last?: boolean | undefined;
}) {
  if (!player) {
    return <EmptyRow label={onStrike ? 'Striker — Not Set' : 'Non-Striker — Not Set'} last={last} />;
  }
  return (
    <div
      className={cn(
        'border-border-subtle flex min-h-11 items-center gap-1.5 px-3.5',
        !last && 'border-b',
        onStrike && 'bg-brand/8'
      )}
    >
      {onStrike ? (
        <span className="bg-danger h-1.5 w-1.5 shrink-0 rounded-full" aria-label="On Strike" />
      ) : (
        <span className="w-1.5 shrink-0" />
      )}
      <span className="min-w-0 flex-1 truncate text-xs leading-normal font-bold text-ink">{player.name}</span>
      <span className="font-mono w-7 text-right text-xs leading-normal font-extrabold text-ink tabular-nums">
        {player.runs}
      </span>
      <span className="font-mono text-muted w-7 text-right text-2xs font-semibold tabular-nums">{player.balls}</span>
      <span className="font-mono text-muted w-7 text-right text-2xs font-semibold tabular-nums">{player.fours}</span>
      <span className="font-mono text-muted w-7 text-right text-2xs font-semibold tabular-nums">{player.sixes}</span>
      <span className="font-mono text-muted w-9 text-right text-2xs font-semibold tabular-nums">{sr(player)}</span>
    </div>
  );
}

function EmptyRow({
  label,
  last = false,
  dashed = false,
  bowling = false,
}: {
  label: string;
  last?: boolean | undefined;
  dashed?: boolean | undefined;
  bowling?: boolean | undefined;
}) {
  return (
    <div className={cn('flex min-h-13 items-center gap-2.5 px-3.5', !last && 'border-border-subtle border-b')}>
      <span
        className={cn(
          'grid h-6 w-6 shrink-0 place-items-center rounded-full',
          dashed ? 'border-border-subtle border border-dashed' : 'bg-transparent'
        )}
        aria-hidden
      />
      <span className={cn('flex-1 text-xs leading-normal font-semibold', bowling ? 'text-muted' : 'text-dim')}>
        {label}
      </span>
    </div>
  );
}
