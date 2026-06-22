import { cn } from '@/lib/utils';

import { ltPlayerStatBar } from '../../config';
import { DISPLAY_FONT, UI_FONT } from '../../primitives';
import { BATTER_SCORE_CLUSTER_CLASS, batterScoreBallsClass, batterScoreRunsClass } from '../../primitives/batterScore';
import { textGlowClass } from '../../visualEffects';
import { TEXT_PRIMARY, TEXT_SECONDARY } from '../shared/textStyles';

/** Shared typography class strings for player stat bar headers. */
export const playerStatLtNameClass = cn(
  'min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap',
  'font-bold leading-none uppercase',
  TEXT_PRIMARY,
  UI_FONT,
);

export const playerStatLtHeroClass = cn('font-extrabold leading-none', TEXT_PRIMARY, DISPLAY_FONT, textGlowClass('score'));

/** @deprecated Prefer batterScoreBallsClass — kept for existing imports. */
export const playerStatLtSecondaryClass = batterScoreBallsClass;

export const playerStatLtTournamentClass = cn(
  'ml-2 min-w-0 max-w-[48%] shrink overflow-hidden text-ellipsis whitespace-nowrap',
  'font-semibold leading-none tracking-[0.04em] uppercase',
  TEXT_SECONDARY,
  UI_FONT,
);

export { BATTER_SCORE_CLUSTER_CLASS, batterScoreBallsClass, batterScoreRunsClass, ltPlayerStatBar };
