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
 * Z-order + interaction. Portrait keeps the measured frame; landscape fills the host.
 *
 * Default `interactive: false` (live + highlight landscape): native under Capacitor so React
 * chrome stays tappable. Highlights portrait VOD passes `interactive: true` so YouTube
 * play/pause/seek work — keep React controls outside that frame.
 */
export function buildNativeStackLayout(isLandscape, { interactive = false } = {}) {
  return {
    underlay: !interactive,
    immersiveFullscreen: Boolean(isLandscape),
    userInteractionEnabled: Boolean(interactive),
  };
}

/**
 * @param {Element} placeholder
 * @param {{ isLandscape: boolean, interactive?: boolean }} options
 */
export function buildNativeOverlayLayout(placeholder, { isLandscape, interactive = false }) {
  if (isLandscape) {
    return buildNativeStackLayout(true, { interactive });
  }

  return {
    ...readElementLayoutRect(placeholder),
    ...buildNativeStackLayout(false, { interactive }),
  };
}
