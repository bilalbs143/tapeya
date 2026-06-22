/**
 * Canonical inline batter score — runs + balls faced (no parentheses).
 * Zone B (ControllerBar HBat) is the reference layout; reuse everywhere.
 */
import { cn } from '@/lib/utils';

import { batterScore as batterScoreTokens } from '../config';
import { TEXT_SECONDARY } from '../layouts/shared/textStyles';
import { AnimatedNumber } from './atoms';
import { DISPLAY_FONT, fsFont } from './formatters';

/** Gap between runs and balls (px) — keep in sync with `batterScore.gap` in config.js. */
export const BATTER_SCORE_GAP_PX = 6;

export const BATTER_SCORE_CLUSTER_CLASS = 'flex shrink-0 items-baseline';

export function batterScoreRunsClass({ onStrike = true } = {}) {
  return cn(
    '[font-family:var(--font-display)] leading-none font-extrabold tabular-nums',
    onStrike ? 'text-white' : TEXT_SECONDARY,
  );
}

export const batterScoreBallsClass = cn('tabular-nums', TEXT_SECONDARY, DISPLAY_FONT);

/** Balls faced / overs — size + weight from `batterScore` tokens (override weight when needed). */
export function batterScoreBallsStyle(sizePx, weight = batterScoreTokens.ballsWeight) {
  return {
    ...fsFont(sizePx),
    fontWeight: weight,
  };
}

/**
 * @param {{
 *   runs: number|string|null|undefined,
 *   balls: number|string|null|undefined,
 *   runsSize: number,
 *   ballsSize: number,
 *   onStrike?: boolean,
 *   accentColor?: string,
 *   className?: string,
 *   gap?: number,
 *   animateRuns?: boolean,
 * }} props
 */
export function BatterScoreInline({
  runs,
  balls,
  runsSize,
  ballsSize,
  onStrike = true,
  accentColor,
  className,
  gap = BATTER_SCORE_GAP_PX,
  animateRuns = true,
}) {
  const runsStyle = {
    ...fsFont(runsSize),
    ...(accentColor ? { color: accentColor } : undefined),
  };

  return (
    <span className={cn(BATTER_SCORE_CLUSTER_CLASS, className)} style={{ gap }}>
      {animateRuns ? (
        <AnimatedNumber value={runs ?? 0} className={batterScoreRunsClass({ onStrike })} style={runsStyle} />
      ) : (
        <span className={batterScoreRunsClass({ onStrike })} style={runsStyle}>
          {runs ?? 0}
        </span>
      )}
      <span className={batterScoreBallsClass} style={batterScoreBallsStyle(ballsSize)}>
        {balls ?? 0}
      </span>
    </span>
  );
}
