import { useReelsFocusMode } from '@/features/reels/reelsFocusModeStore';
import { useLiveViewerHeroMode } from '@/features/stream/liveViewerChromeStore';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { LG_MEDIA_QUERY, NAVBAR_OFFSET_CSS } from '@/lib/constants/layout';
import {
  isGoLiveBroadcastPath,
  isLiveStreamImmersivePath,
  isNavbarOverlayPath,
  isReelsFeedPath,
  isReelsImmersivePath,
} from '@/lib/utils/routeUtils';

/**
 * Layout chrome flags for {@link MainLayout}.
 *
 * - Go-live camera (`/live/go-live/:streamId`): always immersive (no navbar / bottom nav).
 * - Reels feed (`/reels`): navbar overlay + transparent hero (same system as tournament details);
 *   fixed shell, so main bottom padding is also cleared. Focus mode hides bottom nav only.
 * - Reel upload (`/reels/upload`): normal solid navbar + bottom nav (same chrome as Support).
 * - Watch live (self-serve or match-linked): navbar + bottom nav always render. Self-serve
 *   hero mode (status === 'live') only removes the top padding reserved for the navbar so the
 *   hero video can reach the viewport top — the navbar itself stays rendered, just transparent
 *   (see Navbar's own `isHeroNavbarPath` check).
 */
export function useMainLayoutChrome(pathname) {
  const isDesktop = useMediaQuery(LG_MEDIA_QUERY);
  const isGoLiveCamera = isGoLiveBroadcastPath(pathname);
  const isReelsImmersive = isReelsImmersivePath(pathname);
  const isReelsFeed = isReelsFeedPath(pathname);
  const reelsFocusMode = useReelsFocusMode();
  const isWatchLivePath = isLiveStreamImmersivePath(pathname) && !isGoLiveCamera;
  const heroMode = useLiveViewerHeroMode();

  // Top padding cleared only via the shared overlay registry (incl. /reels feed),
  // go-live, or watch-live hero — not a one-off reels exception.
  const noTopPadding = isNavbarOverlayPath(pathname, isDesktop) || isGoLiveCamera || (isWatchLivePath && heroMode && !isDesktop);

  return {
    isDesktop,
    /** Active broadcaster session — transparent root for native camera underlay. */
    isGoLiveCamera,
    showNavbar: !isGoLiveCamera,
    showBottomNav: !isGoLiveCamera && !(isReelsFeed && reelsFocusMode),
    mainPaddingTop: noTopPadding ? 0 : NAVBAR_OFFSET_CSS,
    mainPaddingBottom: isDesktop || isGoLiveCamera || isReelsImmersive ? 0 : 'calc(env(safe-area-inset-bottom) + 70px)',
    rootClassName: isGoLiveCamera ? 'bg-transparent' : 'bg-black',
  };
}
