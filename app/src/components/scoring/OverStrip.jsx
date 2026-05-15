/**
 * OverStrip
 *
 * Horizontal scrollable strip showing ball-by-ball breakdown per over.
 * Free-hit deliveries use the same gold ring + ⚡ badge as BallsTab.
 * Left/right arrow buttons scroll the strip.  The strip auto-scrolls to
 * the newest over whenever the ball history changes (done via the
 * onScrollRef callback pattern — see ScoringTab for usage).
 *
 * Renders null when there are no balls yet.
 *
 * @param {object[]} oversFromBalls  Pre-computed array from ScoringTab.
 *   Each entry: { overIndex: number, runs: number, balls: object[] }
 * @param {React.Ref} scrollRef     Ref forwarded to the inner scroll container.
 */

import { useRef } from 'react';

import { isLegalDelivery } from '@/lib/utils/cricketRules';
import { extraBallLabel, getRunsFromBall } from '@/lib/utils/scoringUtils';

// ─── Ball display helpers ─────────────────────────────────────────────────────

function getBallDisplay(ball) {
  if (!ball) return { label: '•', variant: 'dot' };
  switch (ball.type) {
    case 'runs': {
      const r = ball.runs ?? 0;
      if (r === 0) return { label: '•', variant: 'dot' };
      if (r === 4) return { label: '4', variant: 'four' };
      if (r === 6) return { label: '6', variant: 'six' };
      return { label: String(r), variant: 'runs' };
    }
    case 'out':
      return { label: 'W', variant: 'wicket' };
    case 'retired_hurt':
      return { label: 'RH', variant: 'retired' };
    case 'wd':
      return { label: extraBallLabel('wd', ball.runs), variant: 'extra' };
    case 'nb':
      return { label: extraBallLabel('nb', ball.runs), variant: 'extra' };
    case 'bye':
      return { label: extraBallLabel('bye', ball.runs), variant: 'extra' };
    case 'lb':
      return { label: extraBallLabel('lb', ball.runs), variant: 'extra' };
    case 'penalty': {
      const pr = ball.penaltyRuns ?? 0;
      return { label: pr > 0 ? `P${pr}` : 'P', variant: 'extra' };
    }
    default:
      return { label: '•', variant: 'dot' };
  }
}

function chipClass(variant, isFreeHit) {
  if (isFreeHit) {
    // Gold ring to mark free-hit deliveries (match BallsTab ring weight)
    switch (variant) {
      case 'four':
        return 'bg-[#22C55E] text-white ring-2 ring-[#DA9811]';
      case 'six':
        return 'bg-[#A855F7] text-white ring-2 ring-[#DA9811]';
      case 'wicket':
        return 'bg-[#EF4444] text-white ring-2 ring-[#DA9811]';
      default:
        return 'bg-[#2a2a28] text-[#E5E7EB] ring-2 ring-[#DA9811]';
    }
  }
  switch (variant) {
    case 'four':
      return 'bg-[#22C55E] text-white';
    case 'six':
      return 'bg-[#A855F7] text-white';
    case 'wicket':
      return 'bg-[#EF4444] text-white';
    case 'retired':
      return 'bg-[#6B7280] text-white';
    default:
      return 'bg-[#2a2a28] text-[#E5E7EB]';
  }
}

function overOrdinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * @param {object}         props
 * @param {object[]}       props.oversFromBalls  Pre-computed overs array.
 * @param {React.Ref|null} [props.scrollRef]     Optional external ref for auto-scroll.
 */
export function OverStrip({ oversFromBalls = [], scrollRef }) {
  const internalRef = useRef(null);
  const ref = scrollRef ?? internalRef;

  if (oversFromBalls.length === 0) return null;

  const scroll = (dir) => {
    ref.current?.scrollBy({ left: dir * 200, behavior: 'smooth' });
  };

  return (
    <div className="mt-4 flex items-center gap-2">
      {/* Scroll left */}
      <button
        type="button"
        onClick={() => scroll(-1)}
        className="flex h-13 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1C1C1A] text-white transition-opacity hover:opacity-90 active:opacity-80"
        aria-label="Scroll to previous overs"
      >
        <span className="text-lg font-bold">&lsaquo;</span>
      </button>

      {/* Over cards */}
      <div
        ref={ref}
        className="flex flex-1 flex-nowrap items-center gap-3 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {oversFromBalls.map(({ overIndex, balls }) => {
          const legalBallCount = balls.filter((b) =>
            isLegalDelivery(b.type),
          ).length;
          const overRuns = balls.reduce(
            (s, b) => s + (b ? getRunsFromBall(b) : 0),
            0,
          );

          return (
            <div
              key={overIndex}
              className="flex shrink-0 flex-col items-start gap-1 border-r border-[#1C1C1A] pr-3 last:border-r-0 last:pr-0"
            >
              {/* Header: "1st Over • 7 runs" */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium tracking-wide text-[#6B7280] uppercase">
                  {overOrdinal(overIndex)} over
                </span>
                {legalBallCount === 6 && (
                  <span className="text-[11px] text-white/40">
                    {overRuns} runs
                  </span>
                )}
              </div>

              {/* Ball chips */}
              <div className="flex gap-1">
                {balls.map((b, i) => {
                  const { label, variant } = getBallDisplay(b);
                  const isFreeHit = Boolean(b?.isFreeHit);
                  return (
                    <div key={i} className="relative shrink-0">
                      <span
                        className={`flex h-7 min-w-[1.75rem] items-center justify-center rounded-md px-1 text-[11px] font-bold ${chipClass(variant, isFreeHit)}`}
                      >
                        {label}
                      </span>
                      {isFreeHit && (
                        <span
                          className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#DA9811] text-[7px] font-black text-[#080807]"
                          title="Free Hit"
                          aria-label="Free Hit delivery"
                        >
                          ⚡
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Scroll right */}
      <button
        type="button"
        onClick={() => scroll(1)}
        className="flex h-13 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1C1C1A] text-white transition-opacity hover:opacity-90 active:opacity-80"
        aria-label="Scroll to next overs"
      >
        <span className="text-lg font-bold">&rsaquo;</span>
      </button>
    </div>
  );
}
