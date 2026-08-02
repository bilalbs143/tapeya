import { cn } from '@/lib/utils';

import { batterScore as batterScoreTokens } from '../config';
import { DISPLAY_FONT, fsFont } from './formatters';

/** Gap between runs and balls (px) — keep in sync with `batterScore.gap` in config.js. */
export const BATTER_SCORE_GAP_PX = batterScoreTokens.gap;

export const BATTER_SCORE_CLUSTER_CLASS = 'flex shrink-0 items-baseline';

export function batterScoreRunsClass({ onStrike: _onStrike = true } = {}) {
  return cn(DISPLAY_FONT, 'leading-none font-bold tabular-nums text-white');
}

/** Balls faced — white like controller-3 BatterCard; nudged slightly below runs. */
export const batterScoreBallsClass = cn('relative font-medium tabular-nums text-white', DISPLAY_FONT);

/** Balls faced / overs — size + weight + nudge from `batterScore` tokens. */
export function batterScoreBallsStyle(sizePx, weight = batterScoreTokens.ballsWeight) {
  const nudge = batterScoreTokens.ballsNudgeEm ?? 0;
  return {
    ...fsFont(sizePx),
    fontWeight: weight,
    ...(nudge ? { top: `${nudge}em` } : undefined),
  };
}

/** Format balls for inline batter score — `(2)` when wrapBallsInParens is on. */
export function formatBatterBalls(balls) {
  const value = balls ?? 0;
  return batterScoreTokens.wrapBallsInParens ? `(${value})` : String(value);
}
