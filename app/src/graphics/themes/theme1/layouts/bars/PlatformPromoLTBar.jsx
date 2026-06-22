/**
 * Follow / Download Tapeya promo lower-third.
 *
 * Standard LT footprint — ltBar.height × content width (min ltInfoBar.minWidth).
 */
import { cn } from '@/lib/utils';

import { assets, geometry, infoBarPanelClass, infoBarPanelStyle, ltPromoBar } from '../../config';
import { InsetLTBarPanel, InsetLTBarSurface, InsetLTLogo, UI_FONT } from '../../primitives';

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

const promoTextRowClass = cn('flex h-full min-h-0 items-center');

const promoHeadlineTextClass = cn(
  'shrink-0 whitespace-nowrap leading-none font-bold tracking-[0.12em] text-[var(--text)] uppercase',
  UI_FONT,
);

const promoHeadlineClampClass = cn(promoHeadlineTextClass, 'min-w-0 overflow-hidden text-ellipsis');

const promoUrlTextClass = cn('shrink-0 whitespace-nowrap leading-none font-extrabold tracking-[0.08em] text-white', UI_FONT);

const promoUrlClampClass = cn(promoUrlTextClass, 'min-w-0 overflow-hidden text-ellipsis');

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
            className="flex h-full shrink-0 items-center justify-center border-r border-white/8"
            style={{ paddingLeft: ltPromoBar.logoPaddingX, paddingRight: ltPromoBar.logoPaddingX }}
          >
            <InsetLTLogo
              measuring={measuring}
              src={resolvedLogoUrl}
              alt="Tapeya"
              height={ltPromoBar.logoHeight}
              className="w-auto max-w-full object-contain"
            />
          </div>

          <div className="flex h-full min-w-0 flex-1 flex-col">
            {resolvedHeadline ? (
              <div
                className={cn(promoTextRowClass, hasBothRows && 'border-b border-white/8')}
                style={{ ...promoHeadlineRowFlexStyle(!hasBothRows), ...promoRowPaddingX }}
              >
                <span
                  className={atMaxWidth ? promoHeadlineClampClass : promoHeadlineTextClass}
                  style={{ fontSize: ltPromoBar.headlineFont }}
                >
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
                <span className={atMaxWidth ? promoUrlClampClass : promoUrlTextClass} style={{ fontSize: ltPromoBar.urlFont }}>
                  {resolvedUrl}
                </span>
              </div>
            ) : null}
          </div>
        </InsetLTBarPanel>
      )}
    </InsetLTBarSurface>
  );
}
