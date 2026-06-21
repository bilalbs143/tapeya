/**
 * Officials lower-third strip — shared by UMPIRES, SCORERS, and COMMENTATORS.
 *
 * Standard LT footprint (1920 × 126) — same as LT_DEFAULT.
 * Layout: [heading block] | [names across remaining width]
 */
import { cn } from '@/lib/utils';

import { geometry, ltBar, ltOfficialsBar } from '../../config';
import { DISPLAY_FONT, GlowPanel, ScaledBarSurface, UI_FONT } from '../../primitives';
import { resolveOfficialNames } from './officialsLTBar.helpers';

/* Standard LT footprint — same canvas as LT_DEFAULT (1920 × 138). */
const DESIGN_WIDTH = ltBar.designWidth;
const BAR_RADIUS = geometry.barRadius;
const NAME_SEPARATOR = ' | ';

const OFFICIALS_DIVIDER_CLASS =
  'w-px shrink-0 self-stretch bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.22),transparent)]';

const headingClass = cn(
  'max-w-full overflow-hidden font-bold leading-none tracking-[0.1em] text-ellipsis whitespace-nowrap text-[var(--text)] uppercase',
  UI_FONT,
);

const subtitleClass = cn(
  'max-w-full overflow-hidden font-semibold leading-none tracking-[0.14em] text-ellipsis whitespace-nowrap text-[var(--text-secondary)] uppercase',
  UI_FONT,
);

const nameClass = cn(
  'max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-extrabold leading-none tracking-[0.04em] text-white uppercase',
  DISPLAY_FONT,
);

const namesJoinedClass = cn(
  'max-w-full px-6 text-center font-extrabold leading-[1.15] tracking-[0.04em] text-white uppercase',
  DISPLAY_FONT,
);

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
    <ScaledBarSurface designWidth={DESIGN_WIDTH} edgeToEdge={edgeToEdge} barRadius={BAR_RADIUS}>
      {({ radius }) => (
        <GlowPanel
          hideRing
          radius={radius}
          className="flex w-full items-stretch overflow-hidden"
          style={{ height: ltBar.height }}
        >
          <div
            className="flex shrink-0 flex-col items-start justify-center gap-1.5 overflow-hidden pr-4 pl-8"
            style={{
              width: ltOfficialsBar.headingColumnWidth,
              paddingTop: ltBar.sidePaddingY,
              paddingBottom: ltBar.sidePaddingY,
            }}
          >
            <span className={subtitleClass} style={subtitleStyle}>
              {subtitle}
            </span>
            <span className={headingClass} style={headingStyle}>
              {heading}
            </span>
          </div>

          <div aria-hidden className={cn(OFFICIALS_DIVIDER_CLASS, 'my-4 shrink-0')} />

          {names.length > 0 ? (
            <div className="flex min-w-0 flex-1 items-center">
              {useJoinedNames ? (
                <div
                  className="flex min-w-0 flex-1 items-center justify-center"
                  style={{ paddingTop: ltBar.sidePaddingY, paddingBottom: ltBar.sidePaddingY }}
                >
                  <span className={namesJoinedClass} style={namesJoinedStyle}>
                    {joinedNames}
                  </span>
                </div>
              ) : (
                names.map((name, index) => (
                  <div
                    key={`${name}-${index}`}
                    className={cn(
                      'flex min-w-0 flex-1 items-center justify-center px-4',
                      index > 0 && 'border-l border-white/[0.08]',
                    )}
                    style={{ paddingTop: ltBar.sidePaddingY, paddingBottom: ltBar.sidePaddingY }}
                  >
                    <span className={nameClass} style={nameStyle}>
                      {name}
                    </span>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div
              className="flex min-w-0 flex-1 items-center justify-center px-6"
              style={{ paddingTop: ltBar.sidePaddingY, paddingBottom: ltBar.sidePaddingY }}
            >
              <span className={cn(subtitleClass, 'text-[var(--text-secondary)]')}>—</span>
            </div>
          )}
        </GlowPanel>
      )}
    </ScaledBarSurface>
  );
}
