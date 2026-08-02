import { cn } from '@/lib/utils';

import { DISPLAY_FONT, fsFont, UI_FONT } from '../../primitives';
import { FS_HEADER_SUB } from '../shared/fsTypographyStyles';
import { TEXT_PRIMARY } from '../shared/textStyles';

export { fsFont };

export const CHART_TITLE = cn('m-0 font-extrabold leading-[0.95] text-white uppercase whitespace-nowrap', DISPLAY_FONT);

export const CHART_SUB = FS_HEADER_SUB;

export const CHART_AXIS_TICK = cn('font-bold', TEXT_PRIMARY, DISPLAY_FONT);

export const CHART_AXIS_LABEL = cn('font-semibold tracking-[0.12em] uppercase', TEXT_PRIMARY, UI_FONT);

export const CHART_X_LABEL = cn('font-bold', TEXT_PRIMARY, DISPLAY_FONT);

export const WAGON_SECTION_LABEL = cn('font-bold tracking-[0.2em] uppercase', TEXT_PRIMARY, UI_FONT);

export const WAGON_PLAYER_NAME = cn('mt-1.5 leading-none font-extrabold text-white', DISPLAY_FONT);

export const WAGON_PLAYER_META = cn('mt-1', TEXT_PRIMARY, UI_FONT);

export const WAGON_STAT_LABEL = cn('font-semibold tracking-[0.14em] uppercase', TEXT_PRIMARY, UI_FONT);

export const WAGON_STAT_VALUE = cn('mt-1 leading-none font-extrabold', DISPLAY_FONT);

export const WAGON_LEGEND_LABEL = cn('font-semibold tracking-[0.04em] uppercase', TEXT_PRIMARY, UI_FONT);

export const WAGON_ZONE_LABEL = cn('min-w-0 font-semibold tracking-[0.07em] uppercase', TEXT_PRIMARY, UI_FONT);

export const WAGON_ZONE_VALUE = cn('shrink-0 font-bold tabular-nums', TEXT_PRIMARY, DISPLAY_FONT);
