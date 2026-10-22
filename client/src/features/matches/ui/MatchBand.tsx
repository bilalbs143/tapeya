import { useState } from 'react';

import { cn } from '@/shared/lib/cn';
import { BallChip } from '@/shared/ui/BallChip';
import { Button } from '@/shared/ui/Button';
import { StatusBadge } from '@/shared/ui/StatusBadge';

import type { MatchBandModel } from '../lib/fanMatchView';

type MatchBandProps = {
  band: MatchBandModel;
  className?: string | undefined;
};

function ordinal(n: number): string {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return 'th';
  return ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th';
}

function MiniStat({ label, value, live }: { label: string; value: string; live: boolean }) {
  return (
    <div className="min-w-0">
      <p className="font-mono text-muted text-4xs font-bold tracking-eyebrow uppercase">{label}</p>
      <p
        className={cn('font-mono mt-1 text-xs font-extrabold tabular-nums', live ? 'text-positive-light' : 'text-ink')}
      >
        {value}
      </p>
    </div>
  );
}

export function MatchBand({ band, className }: MatchBandProps) {
  const [followed, setFollowed] = useState(false);
  const overRuns = band.overTokens.reduce((sum, token) => {
    const n = Number(String(token).replace(/\D/g, ''));
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);

  return (
    <section
      data-surface={band.live ? 'navy' : undefined}
      aria-label="Match Summary"
      className={cn('border-border-subtle shrink-0 border-b', band.live ? 'bg-brand-deep' : 'bg-surface', className)}
    >
      <div className="mx-auto w-full px-4 py-3 tab:px-6 tab:py-4">
        <div className="flex items-center gap-x-2.5">
          <StatusBadge kind="match" status={band.status} />
          {band.meta ? (
            <p className="text-muted font-mono min-w-0 flex-1 truncate text-3xs tracking-eyebrow uppercase">
              {band.meta}
            </p>
          ) : (
            <span className="flex-1" />
          )}
          <Button
            variant="secondary"
            size="sm"
            aria-pressed={followed}
            onClick={() => setFollowed((v) => !v)}
            className="shrink-0"
          >
            {followed ? 'Following' : 'Follow Match'}
          </Button>
        </div>

        <div className="mt-2.5 flex flex-wrap items-end gap-x-6 gap-y-3 tab:mt-3 tab:gap-x-8">
          <div className="min-w-0">
            <p
              className={cn(
                'font-mono flex items-center gap-1.5 truncate text-3xs font-bold tracking-eyebrow uppercase',
                band.live ? 'text-positive-light' : 'text-muted'
              )}
            >
              {band.live ? <span className="bg-positive-light h-1.5 w-1.5 shrink-0 rounded-full" aria-hidden /> : null}
              {band.battingName} batting
              <span className="text-dim">· {band.inningsLabel}</span>
            </p>
            <p className="mt-1.5 flex items-baseline gap-2 whitespace-nowrap">
              <span className="font-mono text-score font-extrabold text-ink tabular-nums">
                {band.runs}
                <span className="text-muted">/{band.wickets}</span>
              </span>
              <span className="text-muted font-mono text-body-sm font-semibold tabular-nums">({band.overs})</span>
            </p>
          </div>

          {band.chase != null ? (
            <div className="min-w-0">
              <p className="text-muted font-mono text-3xs font-bold tracking-eyebrow uppercase">
                Target {band.chase.target}
              </p>
              <p
                className={cn(
                  'mt-1.5 whitespace-nowrap text-title font-extrabold tracking-tight',
                  band.live ? 'text-positive-light' : 'text-ink'
                )}
              >
                {band.chase.ballsLeft != null
                  ? `${band.chase.need} off ${band.chase.ballsLeft}`
                  : `Need ${band.chase.need}`}
              </p>
            </div>
          ) : null}

          {band.result ? <p className="text-positive-2 min-w-0 text-body-sm font-bold">{band.result}</p> : null}

          {band.firstInnings ? (
            <MiniStat label={band.firstInnings.label} value={band.firstInnings.value} live={band.live} />
          ) : null}
          {band.chase?.rrr != null || band.crr != null ? (
            <MiniStat label="RRR / CRR" value={`${band.chase?.rrr ?? '—'} / ${band.crr ?? '—'}`} live={band.live} />
          ) : null}
        </div>

        {band.overTokens.length ? (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-dim font-mono shrink-0 text-4xs font-bold tracking-eyebrow uppercase">
              {band.overNum != null ? `${band.overNum}${ordinal(band.overNum)} Over` : 'This Over'}
            </span>
            <div className="flex gap-1.5">
              {band.overTokens.map((token, i) => (
                <BallChip key={`band-ball-${i}`} value={token} className="h-7 w-7 rounded-chip text-3xs" />
              ))}
            </div>
            <span
              className={cn(
                'font-mono ml-auto shrink-0 text-2xs font-bold tabular-nums',
                band.live ? 'text-positive-2' : 'text-body'
              )}
            >
              {overRuns} runs
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
