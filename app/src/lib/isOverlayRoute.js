/**
 * @param {string} [pathname]
 * @returns {boolean}
 */
export function isOverlayRoute(pathname) {
  if (pathname) return pathname.startsWith('/overlay/');
  if (typeof window === 'undefined') return false;
  return window.location.pathname.startsWith('/overlay/');
}
