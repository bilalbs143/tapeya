export const APP_PATHS = {
  login: '/login',
  register: '/register',
  /** Phone for OTP lives in location.state, not the URL. */
  otp: '/otp',
  home: '/',
  discover: '/discover',
  create: '/create',
  createReel: '/create/reel',
  tournaments: '/tournaments',
  tournamentCreate: '/tournaments/create',
  shop: '/shop',
  shopProduct: '/shop/products',
  shopFilter: '/shop/filter',
  shopBrand: '/shop/brands',
  /** Reserved first segments: filter, products, cart, checkout, orders, brands, vendors. */
  shopSlug: '/shop',
  shopOrders: '/shop/orders',
  shopCart: '/shop/cart',
  shopCheckout: '/shop/checkout',
  shopOrderSuccess: '/shop/order-success',
  reels: '/reels',
  live: '/live',
  goLive: '/live/go-live',
  liveBroadcast: '/live/broadcast',
  liveStreaming: '/live/streaming',
  entertainment: '/entertainment',
  matches: '/matches',
  startMatch: '/organizer/scoring/start-match',
  quickMatch: '/quick-match',
  scorecard: '/scorecard',
  matchCard: '/match',
  stats: '/stats',
  ranking: '/ranking',
  rankingStats: '/ranking/stats',
  highlights: '/highlights',
  upcomingTournaments: '/upcoming-tournaments',
  interest: '/interest',
  seller: '/seller',
  sellerApply: '/seller/apply',
  sellerStore: '/seller/store',
  sellerBrands: '/seller/brands',
  sellerCategories: '/seller/categories',
  sellerProducts: '/seller/products',
  sellerProductNew: '/seller/products/new',
  sellerProductEdit: '/seller/products',
  sellerOrders: '/seller/orders',
  sellerOrder: '/seller/orders',
  support: '/support',
  you: '/you',
  /** Own account edit — not the public profile. */
  profile: '/profile',
  /** Public profile; API is id-based (`/users/:handle` may be id or nickname). */
  user: '/users',
  notifications: '/notifications',
  pages: '/pages',
  /** Aliases to CMS slugs. */
  legal: '/legal',
  legalTerms: '/legal/terms',
  legalPrivacy: '/legal/privacy',
} as const;

/** Match-day operator routes — hide BottomNav (bare shell for score/toss). */
export function isOperatorScoringPath(pathname: string): boolean {
  return /^\/matches\/[^/]+\/(score|toss|settings|graphics)$/.test(pathname);
}

/** Live watch + on-air go-live hide BottomNav; hub and pre-broadcast keep it. */
export function isLiveImmersivePath(pathname: string): boolean {
  return /^\/live\/broadcast\/[^/]+$/.test(pathname) || /^\/live\/go-live\/[^/]+$/.test(pathname);
}

/** Immersive reels player (`/reels`, `/reels/:id`) — not create (`/create/reel`). */
export function isReelsImmersivePath(pathname: string): boolean {
  return pathname === APP_PATHS.reels || pathname.startsWith(`${APP_PATHS.reels}/`);
}

/** Fixed player; chat column gets keyboard inset only. */
export function isLiveWatchPath(pathname: string): boolean {
  return /^\/live\/broadcast\/[^/]+$/.test(pathname);
}

/** Fixed player + scrollable related list. */
export function isHighlightDetailPath(pathname: string): boolean {
  return /^\/highlights\/\d+$/.test(pathname);
}

/** Fixed player + scrollable comments. */
export function isEntertainmentEpisodePath(pathname: string): boolean {
  return /^\/entertainment\/[^/]+\/e\/[^/]+$/.test(pathname);
}

/** Fixed post + scrollable comments. */
export function isPostDetailPath(pathname: string): boolean {
  return /^\/feed\/\d+$/.test(pathname);
}

/** Legacy fixed-frame path registry. Media detail (Post/Watch/Highlight/Episode) now uses
 *  `PageDock` (`body="fill"`) which registers fixed-frame via `retainPageDock`. Keep empty
 *  unless a bare shell still needs path-based fixed height without PageDock. */
export const FIXED_HEIGHT_SHELL_PATHS: readonly ((pathname: string) => boolean)[] = [];

export function isFixedHeightShellPath(pathname: string): boolean {
  return FIXED_HEIGHT_SHELL_PATHS.some((match) => match(pathname));
}
