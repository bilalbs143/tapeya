/** Top navbar height (h-16 = 4rem). Used for sticky tab offset in ScorecardHome, ScorecardDetails, and Navbar. */
export const NAVBAR_HEIGHT = 64;

/** Scroll offset (px) after which the Navbar switches from transparent to solid. */
export const NAVBAR_SCROLL_THRESHOLD = 20;

/** Bottom navigation bar height. Used by FloatingCartButton bottom offset. */
export const BOTTOM_NAV_HEIGHT = 80;

/** Z-index for Select/dropdown content so it renders above Dialog overlay (e.g. UserEdit). Use Tailwind class z-[100]. */
export const DROPDOWN_ABOVE_DIALOG_Z = 100;

/** Z-index layering: Navbar (50), BottomNav (40), FloatingCartButton (30). */
export const NAVBAR_Z = 50;
export const BOTTOM_NAV_Z = 40;
export const FLOATING_CART_Z = 30;
