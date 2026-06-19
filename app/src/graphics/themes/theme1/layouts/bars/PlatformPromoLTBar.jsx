/**
 * Follow / Download Tapeya promo lower-third.
 *
 * Standard LT footprint (1920 × 126) — same as LT_DEFAULT.
 * Layout: [logo] | [headline · divider · url]
 */
import { cn } from '@/lib/utils';

import { assets, geometry, ltBar } from '../../config';
import { GlowPanel, UI_FONT, useScaledBarSurface } from '../../primitives';

/* Standard LT footprint — same canvas as LT_DEFAULT (1920 × 126). */
const DESIGN_WIDTH = ltBar.designWidth;
const BAR_RADIUS = geometry.barRadius;
const LOGO_HEIGHT = 72;
const PROMO_SIDE_PADDING_Y = ltBar.sidePaddingY;

/**
 * @param {{
 *   headline?: string,
 *   url?: string,
 *   logoUrl?: string | null,
 *   defaultHeadline?: string,
 *   defaultUrl?: string,
 *   edgeToEdge?: boolean,
 * }} props
 */
export function PlatformPromoLTBar({ headline, url, logoUrl, defaultHeadline = '', defaultUrl = '', edgeToEdge = true }) {
  const { containerRef, innerRef, scale, surfaceHeight, radius } = useScaledBarSurface(DESIGN_WIDTH, edgeToEdge, BAR_RADIUS);

  const resolvedHeadline = headline ?? defaultHeadline;
  const resolvedUrl = url ?? defaultUrl;
  const resolvedLogoUrl = logoUrl ?? assets.brandLogoWhite;

  if (!resolvedHeadline && !resolvedUrl) return null;

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
            className="flex shrink-0 items-center justify-center border-r border-white/[0.08] px-5"
            style={{ paddingTop: PROMO_SIDE_PADDING_Y, paddingBottom: PROMO_SIDE_PADDING_Y }}
          >
            <img
              src={resolvedLogoUrl}
              alt="Tapeya"
              className="w-auto max-w-full object-contain"
              style={{ height: LOGO_HEIGHT }}
            />
          </div>

          <div
            className="flex min-w-0 flex-1 flex-col justify-center gap-[0.65rem] pr-6 pl-7"
            style={{ paddingTop: PROMO_SIDE_PADDING_Y, paddingBottom: PROMO_SIDE_PADDING_Y }}
          >
            {resolvedHeadline ? (
              <span className={cn('text-[1.125rem] leading-[1.15] font-extrabold tracking-[0.12em] text-[var(--text)]', UI_FONT)}>
                {resolvedHeadline}
              </span>
            ) : null}
            {resolvedHeadline && resolvedUrl ? (
              <div className="h-px w-full max-w-[42rem] bg-white/[0.08]" aria-hidden="true" />
            ) : null}
            {resolvedUrl ? (
              <span className={cn('text-[1.625rem] leading-[1.1] font-semibold tracking-[0.08em] text-white', UI_FONT)}>
                {resolvedUrl}
              </span>
            ) : null}
          </div>
        </GlowPanel>
      </div>
    </div>
  );
}
