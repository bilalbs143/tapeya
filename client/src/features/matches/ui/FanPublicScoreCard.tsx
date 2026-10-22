import { cn } from '@/shared/lib/cn';
import { BallChip } from '@/shared/ui/BallChip';

import type { MatchBandModel } from '../lib/fanMatchView';

type FanPublicScoreCardProps = {
  band: MatchBandModel;
  className?: string | undefined;
};

const OVER_SLOTS = 6;

/** LIVE · score · chase · this over (filled + dashed empties). No pad / Action. */

export function FanPublicScoreCard({ band, className }: FanPublicScoreCardProps) {
  const chase = band.chase;
  const metaLine = [
    band.battingShort,
    band.overs !== '—' ? `${band.overs} OV` : null,
    band.crr ? `CRR ${band.crr}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const tokens = band.overTokens.slice(0, OVER_SLOTS);
  const emptySlots = Math.max(0, OVER_SLOTS - tokens.length);

  return (
    <div className={cn('w-full px-4 pb-3', className)}>
      <div
        className={cn(
          'bg-surface rounded-card border p-3.5',
          band.live ? 'border-positive/40 shadow-positive-glow' : 'border-border-subtle'
        )}
      >
        <div className="mb-3 flex items-center gap-2">
          {band.live ? (
            <>
              <span className="bg-positive shadow-positive-dot h-1.5 w-1.5 rounded-full" aria-hidden />
              <span className="font-mono text-positive text-4xs font-bold tracking-[.13em] uppercase">Live</span>
              <span className="font-mono text-dim ml-auto text-4xs font-semibold tracking-[.06em] uppercase">
                Updated just now
              </span>
            </>
          ) : (
            <>
              <span className="font-mono text-dim text-4xs font-bold tracking-[.13em] uppercase">
                {band.result ? 'Result' : band.inningsLabel}
              </span>
              {band.meta ? (
                <span className="font-mono text-dim ml-auto truncate text-4xs font-semibold uppercase">
                  {band.meta}
                </span>
              ) : null}
            </>
          )}
        </div>

        <div className="mb-2.5 flex items-end gap-2.5">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-display leading-none font-extrabold text-ink tabular-nums">
              {band.runs}
              <span className="text-muted text-title-sm">/{band.wickets}</span>
            </p>
            {metaLine ? (
              <p className="font-mono text-dim mt-1 text-4xs font-semibold tracking-[.06em] uppercase">{metaLine}</p>
            ) : null}
          </div>

          {band.result && !band.live ? (
            <p className="text-positive max-w-[45%] text-right text-xs font-bold">{band.result}</p>
          ) : chase != null ? (
            <div className="shrink-0 text-right">
              <p className="text-positive text-body-sm font-extrabold tracking-tight">Need {chase.need}</p>
              <p className="font-mono text-dim mt-0.5 text-4xs font-semibold uppercase tabular-nums">
                {chase.ballsLeft != null ? `From ${chase.ballsLeft}` : null}
                {chase.ballsLeft != null && chase.rrr ? ' · ' : null}
                {chase.rrr ? `RRR ${chase.rrr}` : null}
              </p>
            </div>
          ) : null}
        </div>

        <div className="border-border-subtle flex items-center gap-2 border-t pt-2.5">
          <span className="font-mono text-dim shrink-0 text-4xs font-bold tracking-[.1em] uppercase">This Over</span>
          <div className="flex min-w-0 flex-wrap gap-1">
            {tokens.map((token, i) => (
              <BallChip
                key={`pub-over-${i}`}
                value={token}
                className={cn(
                  'h-5.5 w-5.5 min-w-0 !rounded-chip px-0 text-4xs font-extrabold',
                  String(token) === '4' && 'bg-brand/20 text-brand-text border-0'
                )}
              />
            ))}
            {Array.from({ length: emptySlots }).map((_, i) => (
              <span
                key={`pub-empty-${i}`}
                className="border-border-subtle box-border h-5.5 w-5.5 rounded-chip border border-dashed"
                aria-hidden
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
