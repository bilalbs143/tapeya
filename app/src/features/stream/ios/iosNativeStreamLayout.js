/**
 * Layout payloads for YoutubeStreamOverlayPlugin (Capacitor bridge).
 *
 * Native YouTube always sits under Capacitor so React chrome (badges, hearts, comments)
 * composites on top. Landscape fills the host; portrait matches the web placeholder.
 */

/** Shell / stage background while the native player underlays Capacitor. */
export function nativeUnderlaySurfaceClass(active) {
  return active ? 'bg-transparent' : 'bg-black';
}

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

/**
 * @param {boolean} isLandscape
 * @param {{ interactive?: boolean, touchEnabled?: boolean }} [options]
 *   - `interactive` — false = underlay (below Capacitor). true = above Capacitor (YouTube VOD controls).
 *   - `touchEnabled` — native WKWebView receives taps (defaults to `interactive`).
 */
export function buildNativeStackLayout(isLandscape, { interactive = false, touchEnabled } = {}) {
  const nativeTouches = touchEnabled ?? interactive;
  return {
    underlay: !interactive,
    immersiveFullscreen: Boolean(isLandscape),
    userInteractionEnabled: Boolean(nativeTouches),
  };
}

/**
 * @param {Element} placeholder
 * @param {{ isLandscape: boolean, interactive?: boolean, touchEnabled?: boolean }} options
 */
export function buildNativeOverlayLayout(placeholder, { isLandscape, interactive = false, touchEnabled } = {}) {
  if (isLandscape) {
    return buildNativeStackLayout(true, { interactive, touchEnabled });
  }

  return {
    ...readElementLayoutRect(placeholder),
    ...buildNativeStackLayout(false, { interactive, touchEnabled }),
  };
}
