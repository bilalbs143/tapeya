/**
 * Canonical inline batter score — runs + balls faced (no parentheses).
 * Zone B (ControllerBar HBat) is the reference layout; reuse everywhere.
 */
import { cn } from '@/lib/utils';

import { AnimatedNumber } from './atoms';
import {
  BATTER_SCORE_CLUSTER_CLASS,
  BATTER_SCORE_GAP_PX,
  batterScoreBallsClass,
  batterScoreBallsStyle,
  batterScoreRunsClass,
} from './batterScoreStyles';
import { fsFont } from './formatters';

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
