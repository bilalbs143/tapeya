/**
 * Shared lower-third player stat bar layout.
 * Header content and stat fields are supplied by callers (batsman, bowler, last wicket).
 */
import { cn } from '@/lib/utils';

import { geometry, ltBar, ltPlayerStatBar } from '../../config';
import { DISPLAY_FONT, GlowPanel, ScaledBarSurface, UI_FONT } from '../../primitives';
import { TEXT_PRIMARY, TEXT_SECONDARY } from '../shared/textStyles';

const DESIGN_WIDTH = ltBar.designWidth;
const BAR_RADIUS = geometry.barRadius;

const HEAD_GRADIENT_CLASS =
  'bg-[linear-gradient(100deg,color-mix(in_srgb,var(--panel-ring-a,var(--accentA))_33%,transparent),transparent_60%)]';

const contentBandStyle = {
  width: '100%',
  maxWidth: ltPlayerStatBar.contentMaxWidth,
};

const headBandStyle = {
  ...contentBandStyle,
  paddingTop: ltPlayerStatBar.headPaddingY,
  paddingBottom: ltPlayerStatBar.headPaddingY,
  paddingLeft: ltPlayerStatBar.headPaddingX,
  paddingRight: ltPlayerStatBar.headPaddingX,
};

const statsBandStyle = {
  ...contentBandStyle,
  gap: `${ltPlayerStatBar.statRowGap * 4}px`,
  paddingTop: ltPlayerStatBar.statsPaddingY,
  paddingBottom: ltPlayerStatBar.statsPaddingY,
  paddingLeft: ltPlayerStatBar.statsPaddingX,
  paddingRight: ltPlayerStatBar.statsPaddingX,
};

const statCellClass = 'shrink-0 text-center';

const statLabelClass = cn('font-semibold uppercase tracking-[0.08em]', TEXT_SECONDARY, UI_FONT);

const statValueClass = cn('font-extrabold leading-none', TEXT_PRIMARY, DISPLAY_FONT);

/**
 * @param {{
 *   accent?: string,
 *   edgeToEdge?: boolean,
 *   statFields: Array<{ key: string, label: string }>,
 *   statValues: Record<string, string | number>,
 *   header: import('react').ReactNode,
 *   statRowClass?: string,
 *   statRowStyle?: import('react').CSSProperties,
 * }} props
 */
export function PlayerStatLTBar({
  accent,
  edgeToEdge = true,
  statFields,
  statValues,
  header,
  statRowClass,
  statRowStyle: callerRowStyle,
}) {
  return (
    <ScaledBarSurface designWidth={DESIGN_WIDTH} edgeToEdge={edgeToEdge} barRadius={BAR_RADIUS}>
      {({ radius }) => (
        <GlowPanel hideRing radius={radius} accent={accent} className="w-full overflow-hidden">
          <div className="flex w-full justify-center">
            <div className={cn('flex items-center', HEAD_GRADIENT_CLASS)} style={headBandStyle}>
              {header}
            </div>
          </div>

          <div className="flex w-full justify-center border-t border-white/12">
            <div className={cn('flex justify-center', statRowClass)} style={{ ...statsBandStyle, ...callerRowStyle }}>
              {statFields.map((field) => (
                <div key={field.key} className={statCellClass}>
                  <div className={statLabelClass} style={{ fontSize: ltPlayerStatBar.statLabelSize }}>
                    {field.label}
                  </div>
                  <div
                    className={statValueClass}
                    style={{
                      fontSize: ltPlayerStatBar.statValueSize,
                      marginTop: ltPlayerStatBar.statLabelValueGap,
                    }}
                  >
                    {statValues[field.key]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlowPanel>
      )}
    </ScaledBarSurface>
  );
}
