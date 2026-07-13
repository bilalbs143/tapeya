import { cn } from '@/lib/utils';

import { ltFixtureBar } from '../../config';

const UI = '[font-family:var(--font-ui)]';

/** Horizontal inset for both fixture rows — vertical space comes from the 60/40 split. */
export const fixtureRowPaddingXStyle = {
  paddingLeft: ltFixtureBar.contentPaddingX,
  paddingRight: ltFixtureBar.contentPaddingX,
};

/** @param {boolean} [singleRow] — when no detail row, title fills the column */
export function fixtureTitleRowFlexStyle(singleRow = false) {
  if (singleRow) return { flex: '1 1 0%', minHeight: 0 };
  return { flex: `${ltFixtureBar.titleRowFlex} ${ltFixtureBar.titleRowFlex} 0%`, minHeight: 0 };
}

export function fixtureDetailRowFlexStyle() {
  return { flex: `${ltFixtureBar.detailRowFlex} ${ltFixtureBar.detailRowFlex} 0%`, minHeight: 0 };
}

export const fixtureTitleRowClass = cn('flex items-center justify-center gap-7 border-b border-white/8');

/**
 * Grid row for "team name VS team name" (with an optional per-side score cluster) —
 * a plain flex row with `justify-center` centers the *whole group* as one block, so
 * VS only lands on the container's true midpoint when both sides are equal width.
 * The 1fr/auto/1fr grid guarantees the middle (VS) column is always structurally
 * centered, regardless of how long either side's content is.
 *
 * @param {string} [extraClass]
 */
export function fixtureVsRowGridClass(extraClass) {
  return cn('grid grid-cols-[1fr_auto_1fr] items-center border-b border-white/8', extraClass);
}

/**
 * One side of {@link fixtureVsRowGridClass} — content hugs the VS column when there's
 * slack space, and truncates (ellipsis) instead of pushing VS off-center when it doesn't.
 *
 * @param {'start' | 'end'} side — 'start' = left of VS (home team), 'end' = right of VS (away team)
 * @param {string} [gapClass] — gap between multiple children on this side (e.g. name + score cluster)
 */
export function fixtureVsRowSideClass(side, gapClass = 'gap-2') {
  return cn('flex min-w-0 items-center overflow-hidden', gapClass, side === 'start' ? 'justify-end' : 'justify-start');
}

/** Team-name span for {@link fixtureVsRowSideClass} — shrinks + ellipsis rather than forcing VS out of center. */
export const fixtureVsRowNameClass = cn(
  'min-w-0 overflow-hidden text-ellipsis whitespace-nowrap',
  UI,
  'font-extrabold tracking-[0.08em] text-[var(--text)]',
);

export const fixtureDetailRowClass = cn('flex items-center justify-center');

export const fixtureCrestColumnClass = cn(
  'flex shrink-0 items-center justify-center border-r border-white/8 last:border-r-0 last:border-l last:border-white/8',
);

export const fixtureCrestColumnStyle = {
  paddingLeft: ltFixtureBar.crestPaddingX,
  paddingRight: ltFixtureBar.crestPaddingX,
};

export const fixtureTitleClass = cn('shrink-0 whitespace-nowrap', UI, 'font-extrabold tracking-[0.08em] text-[var(--text)]');

/** Apply when bar has reached max safe-area width — ellipsis safety valve. */
export const fixtureTitleClampClass = cn(fixtureTitleClass, 'min-w-0 overflow-hidden text-ellipsis');

/** @param {boolean} atMaxWidth */
export function pickFixtureTitleClass(atMaxWidth) {
  return atMaxWidth ? fixtureTitleClampClass : fixtureTitleClass;
}

export const fixtureTitleStyle = { fontSize: ltFixtureBar.titleFont };

export const fixtureVsClass = cn('shrink-0', UI, 'font-extrabold tracking-[0.16em] text-[var(--text-secondary)]');

export const fixtureVsStyle = { fontSize: ltFixtureBar.vsLabelFont };

export const fixtureDetailBaseClass = cn('text-center text-white', UI);

/** @param {'semibold' | 'toss'} variant */
export function fixtureDetailClassName(variant = 'semibold') {
  return cn(fixtureDetailBaseClass, variant === 'toss' ? 'font-extrabold tracking-[0.1em]' : 'font-bold tracking-[0.12em]');
}

/** @param {'semibold' | 'toss'} variant */
export function fixtureDetailStyle(variant = 'semibold') {
  return { fontSize: variant === 'toss' ? ltFixtureBar.detailTossFont : ltFixtureBar.detailFont };
}

/** Intro / tournament / result footer row */
export const MATCH_FIXTURE_DETAIL_SEMIBOLD = fixtureDetailClassName('semibold');

/** Toss footer row */
export const MATCH_FIXTURE_DETAIL_TOSS = fixtureDetailClassName('toss');
