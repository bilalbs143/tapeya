/**
 * Custom caption lower-third — title + description, no team crests.
 */
import { cn } from '@/lib/utils';

import { geometry, infoBarPanelClass, infoBarPanelStyle } from '../../config';
import { InsetLTBarPanel, InsetLTBarSurface } from '../../primitives';
import {
  fixtureDetailClassName,
  fixtureDetailRowClass,
  fixtureDetailRowFlexStyle,
  fixtureDetailStyle,
  fixtureRowPaddingXStyle,
  fixtureTitleRowClass,
  fixtureTitleRowFlexStyle,
  fixtureTitleStyle,
  pickFixtureTitleClass,
} from './fixtureBarLayout';

const BAR_RADIUS = geometry.barRadius;

/**
 * @param {{ title?: string, description?: string, edgeToEdge?: boolean }} props
 */
export function CustomCaptionLTBar({ title = '', description = '', edgeToEdge = true }) {
  if (!title && !description) return null;

  const hasBothRows = Boolean(title && description);

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
            {title ? (
              <div
                className={cn(fixtureTitleRowClass, !hasBothRows && 'border-b-0')}
                style={{ ...fixtureTitleRowFlexStyle(!hasBothRows), ...fixtureRowPaddingXStyle }}
              >
                <span className={pickFixtureTitleClass(atMaxWidth)} style={fixtureTitleStyle}>
                  {title}
                </span>
              </div>
            ) : null}

            {description ? (
              <div
                className={cn(
                  fixtureDetailRowClass,
                  fixtureDetailClassName('semibold'),
                  atMaxWidth && 'min-w-0 overflow-hidden text-ellipsis whitespace-nowrap',
                )}
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
        </InsetLTBarPanel>
      )}
    </InsetLTBarSurface>
  );
}
