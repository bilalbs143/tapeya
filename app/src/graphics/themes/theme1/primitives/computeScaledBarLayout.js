/** @typedef {{ left: number, right: number, bottom: number }} OverlayInsets */

export const ZERO_OVERLAY_INSETS = { left: 0, right: 0, bottom: 0 };

/**
 * Safe-area width between L/R overlay insets.
 * @param {number} referenceWidth
 * @param {OverlayInsets} insets
 */
export function resolveInsetRenderWidth(referenceWidth, insets) {
  if (referenceWidth <= 0) return 0;
  return Math.max(referenceWidth - insets.left - insets.right, 0);
}

/**
 * Layout for fixed-design-width LT bars.
 *
 * **Full-bleed (no horizontal insets):** transform scale from overlay reference width.
 *
 * **Inset overlay (horizontal insets):** native layout — margins position the bar,
 * inner canvas width = safe-area width, scale stays 1 so height and typography are
 * unchanged. Content uses flex inside the narrower canvas (no clipping, no shrink).
 */
export function computeScaledBarLayout({
  referenceWidth = 0,
  containerWidth = 0,
  designWidth,
  edgeToEdge = true,
  naturalHeight = 0,
  insets = ZERO_OVERLAY_INSETS,
  previewGutter = 0,
  mobileBreakpoint = 640,
  barRadius = 0,
}) {
  const refW = referenceWidth > 0 ? referenceWidth : containerWidth;
  const isNarrow = refW > 0 && refW < mobileBreakpoint;
  const hasHorizontalInset = insets.left > 0 || insets.right > 0;
  const insetNative = edgeToEdge && hasHorizontalInset && refW > 0;

  // Safe-area canvas width. In insetNative mode ScaledBarSurface uses w-full on the inner
  // div (reflows to the margin box) — renderWidth is metadata for tests / consumers, not
  // applied as a fixed inner width.
  const renderWidth = insetNative ? resolveInsetRenderWidth(refW, insets) : designWidth;

  let scale = 0;
  if (refW > 0) {
    if (insetNative) {
      scale = 1;
    } else if (edgeToEdge || isNarrow) {
      scale = refW / designWidth;
    } else {
      const w = containerWidth > 0 ? containerWidth : refW;
      scale = Math.min((w - previewGutter) / designWidth, 1);
    }
  }

  const surfaceHeight = insetNative ? naturalHeight : naturalHeight * scale;

  /** @type {import('react').CSSProperties} */
  const containerStyle = {};
  /** @type {import('react').CSSProperties} */
  const innerStyle = {};

  if (insetNative) {
    containerStyle.marginLeft = insets.left;
    containerStyle.marginRight = insets.right;
  }

  if (edgeToEdge && insets.bottom > 0) {
    containerStyle.marginBottom = insets.bottom;
  }

  return {
    scale,
    renderWidth,
    insetNative,
    surfaceHeight,
    containerStyle,
    innerStyle,
    radius: edgeToEdge ? 0 : barRadius,
  };
}
