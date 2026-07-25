import { cn } from '@/lib/utils';

import { DISPLAY_FONT, fsFont, UI_FONT } from '../../primitives/formatters';
import { textGlowClass } from '../../visualEffects';
import { TEXT_PRIMARY } from './textStyles';

/** Shared drop shadow for section / card titles on dark FS backgrounds. */
export const FS_TITLE_SHADOW = '[text-shadow:0_2px_18px_rgba(0,0,0,0.5)]';

export { fsFont };

export const FS_HEADER_SUB = cn('m-0 font-semibold tracking-[0.06em] uppercase', TEXT_PRIMARY, UI_FONT);

export const FS_HEADER_SUB_CENTERED = cn('mt-2 mb-0 font-semibold tracking-[0.06em] uppercase', TEXT_PRIMARY, UI_FONT);

export const FS_SECTION_TITLE = cn(
  'm-0 font-extrabold leading-[0.96] tracking-[0.01em] text-white uppercase',
  DISPLAY_FONT,
  FS_TITLE_SHADOW,
);

export const FS_CARD_TITLE = cn(
  'text-center font-extrabold tracking-[0.08em] text-white uppercase',
  DISPLAY_FONT,
  FS_TITLE_SHADOW,
);

export const FS_PANEL_TITLE = cn('m-0 font-extrabold leading-[0.98] tracking-[0.01em] text-white uppercase', DISPLAY_FONT);

export const FS_PANEL_SUB = cn('mt-1.5 mb-0 font-semibold tracking-[0.06em] uppercase', TEXT_PRIMARY, UI_FONT);

export const FS_PAGE_TITLE_LG = cn(
  'm-0 font-extrabold leading-[0.96] tracking-[0.01em] text-white uppercase',
  DISPLAY_FONT,
  FS_TITLE_SHADOW,
);

export const FS_PAGE_TITLE_MD = cn(
  'm-0 font-extrabold leading-[0.96] tracking-[0.01em] text-white uppercase',
  DISPLAY_FONT,
  FS_TITLE_SHADOW,
);

export const FS_MATCH_PAGE_TITLE = cn('m-0 font-extrabold leading-[0.95] text-white uppercase', DISPLAY_FONT);

export const FS_PLAYER_FIRST = cn('font-semibold leading-none tracking-[0.02em] uppercase', TEXT_PRIMARY, DISPLAY_FONT);

export const FS_PLAYER_LAST = cn(
  'font-extrabold leading-[0.95] tracking-[0.01em] text-white uppercase',
  DISPLAY_FONT,
  textGlowClass('hero'),
);

export const FS_PLAYER_ROLE = cn('font-bold leading-[1.05] text-white uppercase', DISPLAY_FONT);

export const FS_DISMISSAL = cn('font-semibold tracking-[0.08em] uppercase', TEXT_PRIMARY, UI_FONT);

export const FS_GOLD_BAND = cn('font-extrabold tracking-[0.06em] text-[#0a0e17] uppercase', 'whitespace-nowrap', DISPLAY_FONT);

export const FS_SCORE_STRIP_LABEL = cn('font-semibold tracking-[0.14em] whitespace-nowrap uppercase', TEXT_PRIMARY, UI_FONT);

export const FS_SCORE_STRIP_VALUE = cn('font-extrabold whitespace-nowrap', TEXT_PRIMARY, DISPLAY_FONT);

export const FS_SCORE_STRIP_HERO = cn(
  'font-extrabold leading-none text-white whitespace-nowrap',
  DISPLAY_FONT,
  textGlowClass('heroMd'),
);

export const FS_ROW_NAME = cn('flex-1 font-extrabold leading-none text-white uppercase', DISPLAY_FONT);

export const FS_ROW_BALLS = cn('tabular-nums', TEXT_PRIMARY, DISPLAY_FONT);
