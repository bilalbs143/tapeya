/** Tailwind `lg` breakpoint — keep in sync with tailwind config. */
export const LG_MEDIA_QUERY = '(min-width: 1024px)';

/** Viewports below Tailwind `md` — phones only; tablets use the 768px–1023px range. */
export const MOBILE_MEDIA_QUERY = '(max-width: 767px)';

/**
 * Content height of the fixed top navbar (logo/actions row), excluding safe-area.
 * Navbar element height = NAVBAR_HEIGHT + safe-area-inset-top.
 */
export const NAVBAR_HEIGHT = 56;

/** DOM selector for the fixed app navbar (`Navbar.jsx`). */
export const NAVBAR_SELECTOR = '[data-app-navbar]';

/**
 * CSS top offset that sits flush under the fixed navbar (incl. notch/safe area).
 * Use for `position: sticky|fixed` chrome (feed tabs, shop filters, etc.).
 */
export const NAVBAR_OFFSET_CSS = `calc(${NAVBAR_HEIGHT}px + env(safe-area-inset-top, 0px))`;

/** Top offset for controls overlaid on full-bleed hero banners (below fixed navbar + safe area). */
export const NAVBAR_HERO_CONTROL_OFFSET = `calc(env(safe-area-inset-top, 0px) + ${NAVBAR_HEIGHT}px + 8px)`;

/** Scroll offset (px) after which the Navbar switches from transparent to solid. */
export const NAVBAR_SCROLL_THRESHOLD = 20;

/** Bottom navigation bar height. Used for main content bottom padding in MainLayout. */
export const BOTTOM_NAV_HEIGHT = 70;

/** Bottom inset for full-bleed pages above BottomNav (bar + safe area + raised center tab). */
export const BOTTOM_NAV_CLEARANCE = 90;

/** Z-index for fixed/sticky tab bars — below navbar (50) and dialogs (50). */
export const STICKY_TABS_Z = 40;

/** Z-index for Select/dropdown content so it renders above Dialog overlay (e.g. UserEdit). Use Tailwind class z-[100]. */
export const DROPDOWN_ABOVE_DIALOG_Z = 100;

/** Z-index layering: Navbar (50), BottomNav (40). */
export const NAVBAR_Z = 50;
export const BOTTOM_NAV_Z = 40;

/**
 * Measured navbar offset in CSS pixels (includes safe-area when the nav is mounted).
 * Prefer this for IntersectionObserver `rootMargin` — observers cannot use `env()`.
 * Falls back to {@link NAVBAR_HEIGHT} when the navbar is not in the DOM (SSR / tests).
 */
export function getNavbarOffsetPx() {
  if (typeof document === 'undefined') return NAVBAR_HEIGHT;
  const nav = document.querySelector(NAVBAR_SELECTOR);
  const height = nav?.getBoundingClientRect()?.height ?? 0;
  return height > 0 ? Math.round(height) : NAVBAR_HEIGHT;
}
