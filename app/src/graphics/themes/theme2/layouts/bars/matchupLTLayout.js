import { cn } from '@/lib/utils';

import { ltFixtureBar } from '../../config';
import { UI_FONT } from '../../primitives/formatters';

/** Team name span for matchup mid grids. */
export function matchupTeamNameClass(align = 'start') {
  return cn('min-w-0 truncate font-bold uppercase text-white', UI_FONT, align === 'end' ? 'text-right' : 'text-left');
}

export const matchupTeamNameStyle = {
  fontSize: ltFixtureBar.teamNameFontSize,
  letterSpacing: ltFixtureBar.teamNameLetterSpacing,
};

/** Mid grid: team | VS | team */
export const matchupMidIntroClass = 'relative z-[1] grid min-w-0 flex-1 items-center';
export const matchupMidIntroStyle = {
  gridTemplateColumns: `minmax(0, 1fr) ${ltFixtureBar.vsBoxWidth}px minmax(0, 1fr)`,
  columnGap: ltFixtureBar.midColumnGap,
  paddingLeft: ltFixtureBar.midPaddingX,
  paddingRight: ltFixtureBar.midPaddingX,
};

/** Mid grid: team | score | VS | score | team */
export const matchupMidSummaryStyle = {
  gridTemplateColumns: `minmax(0, 1fr) auto ${ltFixtureBar.vsBoxWidth}px auto minmax(0, 1fr)`,
  columnGap: ltFixtureBar.midColumnGap,
  paddingLeft: ltFixtureBar.midPaddingX,
  paddingRight: ltFixtureBar.midPaddingX,
};
