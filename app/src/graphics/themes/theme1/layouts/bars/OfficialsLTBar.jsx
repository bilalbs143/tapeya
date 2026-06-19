/**
 * Officials lower-third strip — shared by UMPIRES, SCORERS, and COMMENTATORS.
 *
 * Standard LT footprint (1920 × 126) — same as LT_DEFAULT.
 * Layout: [heading block] | [names across remaining width]
 */
import { cn } from '@/lib/utils';

import { geometry, ltBar } from '../../config';
import { DISPLAY_FONT, GlowPanel, UI_FONT, useScaledBarSurface } from '../../primitives';
import { resolveOfficialNames } from './officialsLTBar.helpers';

/* Standard LT footprint — same canvas as LT_DEFAULT (1920 × 126). */
const DESIGN_WIDTH = ltBar.designWidth;
const BAR_RADIUS = geometry.barRadius;
const HEADING_COLUMN_W = 320;
const NAME_SEPARATOR = ' | ';

const headingClass = cn('text-[1.875rem] font-bold leading-none tracking-[0.1em] text-[var(--text)] uppercase', UI_FONT);

const subtitleClass = cn('text-[1.125rem] font-semibold leading-none tracking-[0.14em] text-[var(--faint)] uppercase', UI_FONT);

const nameClass = cn(
  'max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[1.75rem] font-extrabold leading-none tracking-[0.04em] text-white uppercase',
  DISPLAY_FONT,
);

const namesJoinedClass = cn(
  'max-w-full px-6 text-center text-[1.625rem] font-extrabold leading-[1.15] tracking-[0.04em] text-white uppercase',
  DISPLAY_FONT,
);

/**
 * @param {{
 *   data?: object,
 *   edgeToEdge?: boolean,
 *   heading: string,
 *   subtitle?: string,
 * }} props
 */
export function OfficialsLTBar({ data, edgeToEdge = true, heading, subtitle = 'MATCH' }) {
  const { containerRef, innerRef, scale, surfaceHeight, radius } = useScaledBarSurface(DESIGN_WIDTH, edgeToEdge, BAR_RADIUS);

  const names = resolveOfficialNames(data);

  const useJoinedNames = names.length > 4;
  const joinedNames = names.join(NAME_SEPARATOR);

  return (
    <div ref={containerRef} className="w-full max-w-full overflow-hidden" style={{ height: surfaceHeight || undefined }}>
      <div ref={innerRef} className="origin-top-left" style={{ width: DESIGN_WIDTH, transform: `scale(${scale})` }}>
        <GlowPanel
          ambientPulse
          hideRing
          radius={radius}
          className="flex w-full items-stretch overflow-hidden"
          style={{ height: ltBar.height }}
        >
          <div
            className="flex shrink-0 flex-col items-start justify-center gap-1.5 border-r border-white/[0.08] pr-6 pl-8"
            style={{ width: HEADING_COLUMN_W, paddingTop: ltBar.sidePaddingY, paddingBottom: ltBar.sidePaddingY }}
          >
            <span className={subtitleClass}>{subtitle}</span>
            <span className={headingClass}>{heading}</span>
          </div>

          {names.length > 0 ? (
            <div className="flex min-w-0 flex-1 items-center">
              {useJoinedNames ? (
                <div
                  className="flex min-w-0 flex-1 items-center justify-center"
                  style={{ paddingTop: ltBar.sidePaddingY, paddingBottom: ltBar.sidePaddingY }}
                >
                  <span className={namesJoinedClass}>{joinedNames}</span>
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
                    <span className={nameClass}>{name}</span>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div
              className="flex min-w-0 flex-1 items-center justify-center px-6"
              style={{ paddingTop: ltBar.sidePaddingY, paddingBottom: ltBar.sidePaddingY }}
            >
              <span className={cn(subtitleClass, 'text-[var(--muted)]')}>—</span>
            </div>
          )}
        </GlowPanel>
      </div>
    </div>
  );
}
