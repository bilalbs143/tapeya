/**
 * Follow / Download Tapeya promo lower-third.
 *
 * Standard LT footprint (1920 × 138) — same as LT_DEFAULT.
 * Layout: [logo] | headline row (40%) + URL row (60%)
 */
import { cn } from '@/lib/utils';

import { assets, geometry, ltBar, ltPromoBar } from '../../config';
import { GlowPanel, ScaledBarSurface, UI_FONT } from '../../primitives';

const DESIGN_WIDTH = ltBar.designWidth;
const BAR_RADIUS = geometry.barRadius;

const promoRowPaddingX = {
  paddingLeft: ltPromoBar.contentPaddingX,
  paddingRight: ltPromoBar.contentPaddingX,
};

/** @param {boolean} [singleRow] */
function promoHeadlineRowFlexStyle(singleRow = false) {
  if (singleRow) return { flex: '1 1 0%', minHeight: 0 };
  return { flex: `${ltPromoBar.headlineRowFlex} ${ltPromoBar.headlineRowFlex} 0%`, minHeight: 0 };
}

function promoUrlRowFlexStyle() {
  return { flex: `${ltPromoBar.urlRowFlex} ${ltPromoBar.urlRowFlex} 0%`, minHeight: 0 };
}

const promoTextRowClass = cn('flex w-full min-h-0 items-center');

const promoHeadlineTextClass = cn(
  'min-w-0 overflow-hidden text-ellipsis whitespace-nowrap leading-none font-bold tracking-[0.12em] text-[var(--text)] uppercase',
  UI_FONT,
);

const promoUrlTextClass = cn(
  'min-w-0 overflow-hidden text-ellipsis whitespace-nowrap leading-none font-extrabold tracking-[0.08em] text-white',
  UI_FONT,
);

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
  const resolvedHeadline = headline ?? defaultHeadline;
  const resolvedUrl = url ?? defaultUrl;
  const resolvedLogoUrl = logoUrl ?? assets.brandLogoWhite;

  if (!resolvedHeadline && !resolvedUrl) return null;

  const hasBothRows = Boolean(resolvedHeadline && resolvedUrl);

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
            className="flex shrink-0 items-center justify-center border-r border-white/8"
            style={{ paddingLeft: ltPromoBar.logoPaddingX, paddingRight: ltPromoBar.logoPaddingX }}
          >
            <img
              src={resolvedLogoUrl}
              alt="Tapeya"
              className="w-auto max-w-full object-contain"
              style={{ height: ltPromoBar.logoHeight }}
            />
          </div>

          <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            {resolvedHeadline ? (
              <div
                className={cn(promoTextRowClass, hasBothRows && 'border-b border-white/8')}
                style={{ ...promoHeadlineRowFlexStyle(!hasBothRows), ...promoRowPaddingX }}
              >
                <span className={promoHeadlineTextClass} style={{ fontSize: ltPromoBar.headlineFont }}>
                  {resolvedHeadline}
                </span>
              </div>
            ) : null}

            {resolvedUrl ? (
              <div
                className={promoTextRowClass}
                style={{
                  ...(hasBothRows ? promoUrlRowFlexStyle() : promoHeadlineRowFlexStyle(true)),
                  ...promoRowPaddingX,
                }}
              >
                <span className={promoUrlTextClass} style={{ fontSize: ltPromoBar.urlFont }}>
                  {resolvedUrl}
                </span>
              </div>
            ) : null}
          </div>
        </GlowPanel>
      )}
    </ScaledBarSurface>
  );
}
