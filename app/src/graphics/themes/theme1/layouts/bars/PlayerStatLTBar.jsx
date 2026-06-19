/**
 * Shared lower-third player stat bar layout.
 * Header content and stat fields are supplied by callers (batsman, bowler, last wicket).
 */
import { cn } from '@/lib/utils';

import { geometry, ltBar } from '../../config';
import { DISPLAY_FONT, GlowPanel, ScaledBarSurface, UI_FONT } from '../../primitives';

const DESIGN_WIDTH = ltBar.designWidth;
const BAR_RADIUS = geometry.barRadius;

const headRowClass = cn(
  'flex items-center py-3 px-[22px]',
  'bg-[linear-gradient(100deg,color-mix(in_srgb,var(--panel-ring-a,var(--accentA))_33%,transparent),transparent_60%)]',
);

const statsRowClass = 'flex justify-center gap-x-20 border-t border-white/12 px-[22px] py-2';

const statCellClass = 'shrink-0 text-center';

const statLabelClass = cn('text-xs font-semibold tracking-[0.08em] text-white', UI_FONT);

const statValueClass = cn('mt-0.5 text-[26px] font-bold leading-none text-[var(--text)]', DISPLAY_FONT);

/**
 * @param {{
 *   accent?: string,
 *   edgeToEdge?: boolean,
 *   statFields: Array<{ key: string, label: string }>,
 *   statValues: Record<string, string | number>,
 *   header: import('react').ReactNode,
 * }} props
 */
export function PlayerStatLTBar({ accent, edgeToEdge = true, statFields, statValues, header }) {
  return (
    <ScaledBarSurface designWidth={DESIGN_WIDTH} edgeToEdge={edgeToEdge} barRadius={BAR_RADIUS}>
      {({ radius }) => (
        <GlowPanel ambientPulse hideRing radius={radius} accent={accent} className="w-full overflow-hidden">
          <div className={headRowClass}>{header}</div>

          <div className={statsRowClass}>
            {statFields.map((field) => (
              <div key={field.key} className={statCellClass}>
                <div className={statLabelClass}>{field.label}</div>
                <div className={statValueClass}>{statValues[field.key]}</div>
              </div>
            ))}
          </div>
        </GlowPanel>
      )}
    </ScaledBarSurface>
  );
}
