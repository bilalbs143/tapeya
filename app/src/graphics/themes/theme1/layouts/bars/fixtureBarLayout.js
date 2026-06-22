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
