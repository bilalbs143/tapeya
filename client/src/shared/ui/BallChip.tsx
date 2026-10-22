import { type ComponentPropsWithoutRef } from 'react';

import { cn } from '@/shared/lib/cn';

type BallChipProps = {
  value: string | number;
  className?: string | undefined;
} & Omit<ComponentPropsWithoutRef<'span'>, 'children'>;

function toneFor(v: string | number): string {
  const s = String(v).toLowerCase();
  if (s === 'w' || s === 'm' || s.endsWith('+w')) return 'bg-danger text-white';
  if (s === 'rh' || s === 'ro' || s === 'to') return 'bg-page-deep text-dim border-border-subtle border';
  if (s === '6') return 'bg-positive text-white';
  if (s === '4') return 'bg-positive/25 text-positive-2';
  if (s === '0' || s === '.') return 'bg-page-deep text-dim border-border-subtle border';
  if (
    s === 'ot' ||
    s.startsWith('p') ||
    s.startsWith('+') ||
    /^\d*wd/.test(s) ||
    /^\d*nb/.test(s) ||
    /^\d*lb/.test(s) ||
    /^\d*b$/.test(s)
  ) {
    return 'border-brand/50 text-brand-text border bg-transparent';
  }
  return 'bg-surface-raised text-ink';
}

export function BallChip({ value, className, ...props }: BallChipProps) {
  const label = String(value) === '0' ? '•' : String(value);
  return (
    <span
      className={cn(
        'font-mono inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full px-1 text-2xs font-bold',
        toneFor(value),
        className
      )}
      {...props}
    >
      {label}
    </span>
  );
}

type OverTimelineProps = {
  over?: number | null | undefined;
  balls?: Array<string | number> | undefined;
  emptyHint?: string | undefined;
  className?: string | undefined;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children'>;

/** Current over deliveries or empty run slots — raised card, not a footer strip. */
export function OverTimeline({ over, balls = [], className, emptyHint = 'Tap a run', ...props }: OverTimelineProps) {
  const empty = !balls.length;
  const overRuns = balls.reduce((sum: number, ball) => {
    if (typeof ball === 'number') return sum + ball;
    const n = Number(String(ball).replace(/\D/g, ''));
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);

  return (
    <div
      className={cn(
        'border-border-subtle bg-surface flex min-h-13 items-center gap-3 rounded-panel border px-3.5 py-2.5',
        className
      )}
      {...props}
    >
      {over != null ? (
        <span className="font-mono text-muted shrink-0 text-4xs font-extrabold tracking-eyebrow uppercase">
          Over {over}
        </span>
      ) : null}
      {empty ? (
        <>
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <span
                key={i}
                className="border-border-subtle bg-page-deep h-7 w-7 rounded-full border border-dashed"
                aria-hidden
              />
            ))}
          </div>
          <span className="font-mono text-dim shrink-0 text-4xs font-semibold tracking-eyebrow uppercase">
            {emptyHint}
          </span>
        </>
      ) : (
        <>
          <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
            {balls.map((ball, i) => (
              <BallChip key={`${String(ball)}-${i}`} value={ball} />
            ))}
          </div>
          <span className="font-mono text-ink bg-page-deep shrink-0 rounded-full px-2.5 py-1 text-4xs font-extrabold tracking-eyebrow uppercase tabular-nums">
            {overRuns} run{overRuns === 1 ? '' : 's'}
          </span>
        </>
      )}
    </div>
  );
}
