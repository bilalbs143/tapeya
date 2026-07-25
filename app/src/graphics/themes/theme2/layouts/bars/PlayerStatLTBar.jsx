/**
 * Shared lower-third player stat bar layout.
 * Header content and stat fields are supplied by callers (batsman, bowler, last wicket).
 *
 * Uses the same InsetLTBarSurface shell as fixture / name inset LTs.
 */
import { cn } from '@/lib/utils';

import { geometry, infoBarPanelClass, infoBarPanelStyle, ltPlayerStatBar } from '../../config';
import { accentPanelHeadGradient, DISPLAY_FONT, InsetLTBarPanel, InsetLTBarSurface, UI_FONT } from '../../primitives';
import { TEXT_PRIMARY } from '../shared/textStyles';

const BAR_RADIUS = geometry.barRadius;

const headRowFlexStyle = {
  flex: `${ltPlayerStatBar.headRowFlex} ${ltPlayerStatBar.headRowFlex} 0%`,
  minHeight: 0,
};

const statsRowFlexStyle = {
  flex: `${ltPlayerStatBar.statsRowFlex} ${ltPlayerStatBar.statsRowFlex} 0%`,
  minHeight: 0,
};

const headBandStyle = {
  paddingTop: ltPlayerStatBar.headPaddingY,
  paddingBottom: ltPlayerStatBar.headPaddingY,
  paddingLeft: ltPlayerStatBar.headPaddingX,
  paddingRight: ltPlayerStatBar.headPaddingX,
};

const statsBandStyle = {
  gap: `${ltPlayerStatBar.statRowGap * 4}px`,
  paddingTop: ltPlayerStatBar.statsPaddingY,
  paddingBottom: ltPlayerStatBar.statsPaddingY,
  paddingLeft: ltPlayerStatBar.statsPaddingX,
  paddingRight: ltPlayerStatBar.statsPaddingX,
};

const statCellClass = 'shrink-0 text-center';

const statLabelClass = cn('uppercase tracking-[0.08em]', TEXT_PRIMARY, UI_FONT);

const statValueClass = cn('font-extrabold leading-none', TEXT_PRIMARY, DISPLAY_FONT);

/**
 * @param {{
 *   edgeToEdge?: boolean,
 *   statFields: Array<{ key: string, label: string }>,
 *   statValues: Record<string, string | number>,
 *   header: import('react').ReactNode | ((ctx: { measuring?: boolean }) => import('react').ReactNode),
 *   statRowClass?: string,
 *   statRowStyle?: import('react').CSSProperties,
 * }} props
 */
export function PlayerStatLTBar({
  edgeToEdge = true,
  statFields,
  statValues,
  header,
  statRowClass,
  statRowStyle: callerRowStyle,
}) {
  const renderHeader = (measuring) => (typeof header === 'function' ? header({ measuring }) : header);

  return (
    <InsetLTBarSurface edgeToEdge={edgeToEdge} barRadius={BAR_RADIUS}>
      {({ radius, atMaxWidth, measuring }) => (
        <InsetLTBarPanel
          measuring={measuring}
          hideRing
          radius={radius}
          className={infoBarPanelClass(measuring)}
          style={infoBarPanelStyle(measuring)}
        >
          <div className="flex h-full w-full flex-col">
            <div
              className="flex min-h-0 w-full items-center justify-center overflow-hidden"
              style={{ ...headRowFlexStyle, ...headBandStyle, background: accentPanelHeadGradient() }}
            >
              {renderHeader(measuring)}
            </div>

            <div className="flex min-h-0 w-full items-center justify-center border-t border-white/12" style={statsRowFlexStyle}>
              <div
                className={cn('flex w-full justify-center', statRowClass, atMaxWidth && 'min-w-0 overflow-hidden')}
                style={{ ...statsBandStyle, ...callerRowStyle }}
              >
                {statFields.map((field) => (
                  <div key={field.key} className={statCellClass}>
                    <div
                      className={statLabelClass}
                      style={{ fontSize: ltPlayerStatBar.statLabelSize, fontWeight: ltPlayerStatBar.statLabelWeight }}
                    >
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
          </div>
        </InsetLTBarPanel>
      )}
    </InsetLTBarSurface>
  );
}
