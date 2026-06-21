import { cn } from '@/lib/utils';

import { ltPlayerStatBar } from '../../config';
import { DISPLAY_FONT, UI_FONT } from '../../primitives';
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

export const playerStatLtSecondaryClass = cn('font-medium tabular-nums', TEXT_SECONDARY, DISPLAY_FONT);

export { ltPlayerStatBar };
