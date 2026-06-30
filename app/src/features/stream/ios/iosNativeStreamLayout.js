/**
 * Layout payloads for YoutubeStreamOverlayPlugin (Capacitor bridge).
 *
 * Portrait: native WKWebView above Capacitor, sized to the aspect-video placeholder.
 * Landscape: native WKWebView below transparent Capacitor, full-screen; embed page rotates video.
 */

/**
 * @param {Element} element
 * @returns {{ x: number, y: number, width: number, height: number }}
 */
export function readElementLayoutRect(element) {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

/** Z-order + interaction mode — always safe to apply before geometry is measured. */
export function buildNativeStackLayout(isLandscape) {
  if (isLandscape) {
    return {
      underlay: true,
      immersiveFullscreen: true,
      userInteractionEnabled: false,
    };
  }

  return {
    underlay: false,
    immersiveFullscreen: false,
    userInteractionEnabled: true,
  };
}

/** Landscape immersive — Swift fills the host view; rotation is handled by the embed proxy. */
export function buildLandscapeNativeLayout() {
  return buildNativeStackLayout(true);
}

/** Portrait — native player above Capacitor, matched to the web aspect-video box. */
export function buildPortraitNativeLayout(placeholder) {
  return {
    ...readElementLayoutRect(placeholder),
    ...buildNativeStackLayout(false),
  };
}

/**
 * @param {Element} placeholder
 * @param {{ isLandscape: boolean }} options
 */
export function buildNativeOverlayLayout(placeholder, { isLandscape, allowInteraction = true }) {
  const stack = buildNativeStackLayout(isLandscape);
  const layout = isLandscape ? buildLandscapeNativeLayout() : buildPortraitNativeLayout(placeholder);

  return {
    ...layout,
    userInteractionEnabled: allowInteraction && stack.userInteractionEnabled,
  };
}
