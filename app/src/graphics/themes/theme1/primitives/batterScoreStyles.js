import { cn } from '@/lib/utils';

import { batterScore as batterScoreTokens } from '../config';
import { TEXT_SECONDARY } from '../layouts/shared/textStyles';
import { DISPLAY_FONT, fsFont } from './formatters';

/** Gap between runs and balls (px) — keep in sync with `batterScore.gap` in config.js. */
export const BATTER_SCORE_GAP_PX = 6;

export const BATTER_SCORE_CLUSTER_CLASS = 'flex shrink-0 items-baseline';

export function batterScoreRunsClass({ onStrike = true } = {}) {
  return cn(DISPLAY_FONT, 'leading-none font-extrabold tabular-nums', onStrike ? 'text-white' : TEXT_SECONDARY);
}

export const batterScoreBallsClass = cn('tabular-nums', TEXT_SECONDARY, DISPLAY_FONT);

/** Balls faced / overs — size + weight from `batterScore` tokens (override weight when needed). */
export function batterScoreBallsStyle(sizePx, weight = batterScoreTokens.ballsWeight) {
  return {
    ...fsFont(sizePx),
    fontWeight: weight,
  };
}
