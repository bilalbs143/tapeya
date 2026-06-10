/** Tailwind `lg` breakpoint — keep in sync with tailwind config. */
export const LG_MEDIA_QUERY = '(min-width: 1024px)';

/** Viewports below Tailwind `md` — phones only; tablets use the 768px–1023px range. */
export const MOBILE_MEDIA_QUERY = '(max-width: 767px)';

/** Top navbar height. Used for sticky tab offset in ScorecardHome, ScorecardDetails, and Navbar. */
export const NAVBAR_HEIGHT = 56;

/** Top offset for controls overlaid on full-bleed hero banners (below fixed navbar + safe area). */
export const NAVBAR_HERO_CONTROL_OFFSET = `calc(env(safe-area-inset-top) + ${NAVBAR_HEIGHT}px + 8px)`;

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
