/**
 * Custom caption lower-third — title + description, no team crests.
 * Same 1920 × 126 footprint and typography as MatchFixtureBar / TOURNAMENT_NAME.
 */
import { cn } from '@/lib/utils';

import { geometry, ltBar } from '../../config';
import { GlowPanel, useScaledBarSurface } from '../../primitives';
import { MATCH_FIXTURE_DETAIL_SEMIBOLD } from './MatchFixtureBar';

const DESIGN_WIDTH = ltBar.designWidth;
const BAR_RADIUS = geometry.barRadius;
const UI = '[font-family:var(--font-ui)]';

const titleClass = cn(
  'overflow-hidden text-ellipsis whitespace-nowrap',
  UI,
  'text-[1.35rem] font-extrabold tracking-[0.08em] text-[var(--text)]',
);

const detailBaseClass = cn('text-center text-white', UI);

/**
 * @param {{ title?: string, description?: string, edgeToEdge?: boolean }} props
 */
export function CustomCaptionLTBar({ title = '', description = '', edgeToEdge = true }) {
  const { containerRef, innerRef, scale, surfaceHeight, radius } = useScaledBarSurface(DESIGN_WIDTH, edgeToEdge, BAR_RADIUS);

  if (!title && !description) return null;

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
          <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center overflow-hidden">
            {title ? (
              <div
                className={cn(
                  'flex flex-1 items-center justify-center px-6 pt-[0.85rem] pb-[0.35rem]',
                  description ? 'border-b border-white/[0.08]' : 'pb-[0.85rem]',
                )}
              >
                <span className={titleClass}>{title}</span>
              </div>
            ) : null}

            {description ? (
              <div
                className={cn(
                  'flex items-center justify-center px-6 pt-[0.35rem] pb-[0.7rem]',
                  detailBaseClass,
                  MATCH_FIXTURE_DETAIL_SEMIBOLD,
                  !title && 'flex-1 pt-[0.85rem] pb-[0.85rem]',
                )}
              >
                {description}
              </div>
            ) : null}
          </div>
        </GlowPanel>
      </div>
    </div>
  );
}
