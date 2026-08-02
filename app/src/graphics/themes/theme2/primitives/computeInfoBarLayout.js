import { ltBar, ltInfoBar } from '../config';
import { resolveInsetRenderWidth, ZERO_OVERLAY_INSETS } from './computeScaledBarLayout';

/** @typedef {'center' | 'start'} InfoBarAlign */

/**
 * @param {number} naturalWidth
 * @param {number} minWidth
 * @param {number} maxWidth
 */
export function clampInfoBarWidth(naturalWidth, minWidth, maxWidth) {
  const floor = Math.max(minWidth, 0);
  if (maxWidth <= 0) return Math.max(naturalWidth, floor);
  return Math.min(Math.max(naturalWidth, floor), maxWidth);
}

/**
 * Layout for content-sized info lower-thirds (min width, fixed height, horizontal expansion).
 *
 * @param {{
 *   referenceWidth?: number,
 *   containerWidth?: number,
 *   naturalContentWidth?: number,
 *   minWidth?: number,
 *   maxWidth?: number,
 *   barHeight?: number,
 *   edgeToEdge?: boolean,
 *   insets?: import('./computeScaledBarLayout.js').OverlayInsets,
 *   previewGutter?: number,
 *   mobileBreakpoint?: number,
 *   barRadius?: number,
 *   align?: InfoBarAlign,
 * }} params
 */
export function computeInfoBarLayout({
  referenceWidth = 0,
  containerWidth = 0,
  naturalContentWidth = 0,
  minWidth = ltInfoBar.minWidth,
  maxWidth = ltInfoBar.maxWidth,
  barHeight = ltBar.height,
  edgeToEdge = true,
  insets = ZERO_OVERLAY_INSETS,
  previewGutter = ltBar.previewGutter,
  mobileBreakpoint = ltBar.mobileBreakpoint,
  barRadius = 0,
  align = 'center',
}) {
  const refW = referenceWidth > 0 ? referenceWidth : containerWidth;
  const hasHorizontalInset = insets.left > 0 || insets.right > 0;
  const insetNative = edgeToEdge && hasHorizontalInset && refW > 0;

  const safeWidth = insetNative ? resolveInsetRenderWidth(refW, insets) : Math.max(edgeToEdge ? refW : refW - previewGutter, 0);

  const maxAvailableWidth = maxWidth > 0 ? Math.min(safeWidth, maxWidth) : safeWidth;

  const measured = naturalContentWidth > 0 ? naturalContentWidth : minWidth;
  const barWidth = clampInfoBarWidth(measured, minWidth, maxAvailableWidth);
  const atMaxWidth = maxAvailableWidth > 0 && barWidth >= maxAvailableWidth;

  let scale = 1;
  if (refW > 0 && !insetNative) {
    const hostW = edgeToEdge ? refW : Math.max(containerWidth - previewGutter, 0);
    if (hostW > 0 && barWidth > hostW) {
      scale = hostW / barWidth;
    } else if (!edgeToEdge && refW < mobileBreakpoint && refW > 0 && barWidth > refW) {
      scale = refW / barWidth;
    }
  }

  /** @type {import('react').CSSProperties} */
  const containerStyle = {
    height: barHeight,
  };

  if (insetNative) {
    containerStyle.width = '100%';
    containerStyle.boxSizing = 'border-box';
    containerStyle.paddingLeft = insets.left;
    containerStyle.paddingRight = insets.right;
    containerStyle.display = 'flex';
    containerStyle.justifyContent = align === 'start' ? 'flex-start' : 'center';
  } else {
    containerStyle.display = 'flex';
    containerStyle.justifyContent = align === 'start' ? 'flex-start' : 'center';
    containerStyle.width = '100%';
  }

  if (edgeToEdge && insets.bottom > 0) {
    containerStyle.marginBottom = insets.bottom;
  }

  const slotWidth = insetNative ? barWidth : barWidth * scale;

  return {
    barWidth,
    atMaxWidth,
    maxAvailableWidth,
    scale,
    insetNative,
    surfaceHeight: barHeight,
    slotWidth,
    containerStyle,
    radius: edgeToEdge ? 0 : barRadius,
  };
}
