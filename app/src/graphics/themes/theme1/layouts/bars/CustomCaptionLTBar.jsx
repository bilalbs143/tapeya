/**
 * Custom caption lower-third — title + description, no team crests.
 * Same footprint and typography as MatchFixtureBar / TOURNAMENT_NAME.
 */
import { cn } from '@/lib/utils';

import { geometry, ltBar } from '../../config';
import { GlowPanel, ScaledBarSurface } from '../../primitives';
import {
  fixtureDetailClassName,
  fixtureDetailRowClass,
  fixtureDetailRowFlexStyle,
  fixtureDetailStyle,
  fixtureRowPaddingXStyle,
  fixtureTitleClass,
  fixtureTitleRowClass,
  fixtureTitleRowFlexStyle,
  fixtureTitleStyle,
} from './fixtureBarLayout';

const DESIGN_WIDTH = ltBar.designWidth;
const BAR_RADIUS = geometry.barRadius;

/**
 * @param {{ title?: string, description?: string, edgeToEdge?: boolean }} props
 */
export function CustomCaptionLTBar({ title = '', description = '', edgeToEdge = true }) {
  if (!title && !description) return null;

  const hasBothRows = Boolean(title && description);

  return (
    <ScaledBarSurface designWidth={DESIGN_WIDTH} edgeToEdge={edgeToEdge} barRadius={BAR_RADIUS}>
      {({ radius }) => (
        <GlowPanel
          hideRing
          radius={radius}
          className="flex w-full items-stretch overflow-hidden"
          style={{ height: ltBar.height }}
        >
          <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            {title ? (
              <div
                className={cn(fixtureTitleRowClass, !hasBothRows && 'border-b-0')}
                style={{ ...fixtureTitleRowFlexStyle(!hasBothRows), ...fixtureRowPaddingXStyle }}
              >
                <span className={fixtureTitleClass} style={fixtureTitleStyle}>
                  {title}
                </span>
              </div>
            ) : null}

            {description ? (
              <div
                className={cn(fixtureDetailRowClass, fixtureDetailClassName('semibold'))}
                style={{
                  ...(hasBothRows ? fixtureDetailRowFlexStyle() : fixtureTitleRowFlexStyle(true)),
                  ...fixtureRowPaddingXStyle,
                  ...fixtureDetailStyle('semibold'),
                }}
              >
                {description}
              </div>
            ) : null}
          </div>
        </GlowPanel>
      )}
    </ScaledBarSurface>
  );
}
