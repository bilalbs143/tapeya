/**
 * Officials lower-third strip — shared by UMPIRES, SCORERS, and COMMENTATORS.
 *
 * Standard LT footprint — ltBar.height × content width (min ltInfoBar.minWidth).
 */
import { cn } from '@/lib/utils';

import { geometry, infoBarPanelClass, infoBarPanelStyle, ltOfficialsBar } from '../../config';
import { DISPLAY_FONT, InsetLTBarPanel, InsetLTBarSurface, UI_FONT } from '../../primitives';
import { resolveOfficialNames } from './officialsLTBar.helpers';

const BAR_RADIUS = geometry.barRadius;
const NAME_SEPARATOR = ' | ';

const OFFICIALS_DIVIDER_CLASS =
  'w-px shrink-0 self-stretch bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.22),transparent)]';

const headingClass = cn(
  'shrink-0 whitespace-nowrap font-bold leading-none tracking-[0.1em] text-[var(--text)] uppercase',
  UI_FONT,
);

const headingClampClass = cn(headingClass, 'min-w-0 overflow-hidden text-ellipsis');

const subtitleClass = cn(
  'shrink-0 whitespace-nowrap font-semibold leading-none tracking-[0.14em] text-[var(--text)] uppercase',
  UI_FONT,
);

const nameClass = cn(
  'shrink-0 whitespace-nowrap font-extrabold leading-none tracking-[0.04em] text-[var(--text)] uppercase',
  DISPLAY_FONT,
);

const nameClampClass = cn(nameClass, 'min-w-0 overflow-hidden text-ellipsis');

const namesJoinedClass = cn(
  'shrink-0 px-6 text-center font-extrabold leading-[1.15] tracking-[0.04em] text-[var(--text)] uppercase',
  DISPLAY_FONT,
);

const namesJoinedClampClass = cn(namesJoinedClass, 'min-w-0 overflow-hidden text-ellipsis whitespace-nowrap');

const headingStyle = { fontSize: ltOfficialsBar.headingSize };
const subtitleStyle = { fontSize: ltOfficialsBar.subtitleSize };
const nameStyle = { fontSize: ltOfficialsBar.nameSize };
const namesJoinedStyle = { fontSize: ltOfficialsBar.nameJoinedSize };

/**
 * @param {{
 *   data?: object,
 *   edgeToEdge?: boolean,
 *   heading: string,
 *   subtitle?: string,
 * }} props
 */
export function OfficialsLTBar({ data, edgeToEdge = true, heading, subtitle = 'MATCH' }) {
  const names = resolveOfficialNames(data);

  const useJoinedNames = names.length > 4;
  const joinedNames = names.join(NAME_SEPARATOR);

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
          <div
            className="flex h-full shrink-0 flex-col items-start justify-center gap-1.5 overflow-hidden pr-4 pl-8"
            style={{ width: ltOfficialsBar.headingColumnWidth }}
          >
            <span className={subtitleClass} style={subtitleStyle}>
              {subtitle}
            </span>
            <span className={headingClampClass} style={headingStyle}>
              {heading}
            </span>
          </div>

          <div aria-hidden className={OFFICIALS_DIVIDER_CLASS} />

          {names.length > 0 ? (
            <div className="flex h-full min-w-0 flex-1 items-center">
              {useJoinedNames ? (
                <div className="flex h-full min-w-0 flex-1 items-center justify-center px-2">
                  <span className={atMaxWidth ? namesJoinedClampClass : namesJoinedClass} style={namesJoinedStyle}>
                    {joinedNames}
                  </span>
                </div>
              ) : (
                names.map((name, index) => (
                  <div
                    key={`${name}-${index}`}
                    className={cn('flex h-full min-w-0 items-center justify-center px-4', index > 0 && 'border-l border-white/8')}
                  >
                    <span className={atMaxWidth ? nameClampClass : nameClass} style={nameStyle}>
                      {name}
                    </span>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="flex h-full min-w-0 flex-1 items-center justify-center px-6">
              <span className={cn(subtitleClass, 'text-[var(--text)]')}>—</span>
            </div>
          )}
        </InsetLTBarPanel>
      )}
    </InsetLTBarSurface>
  );
}
