import { useLiveViewerHeroMode } from '@/features/stream/liveViewerChromeStore';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { LG_MEDIA_QUERY } from '@/lib/constants/layout';
import { isGoLiveBroadcastPath, isLiveStreamImmersivePath, isNavbarOverlayPath } from '@/lib/utils/routeUtils';

/**
 * Layout chrome flags for {@link MainLayout}.
 *
 * - Go-live camera (`/live/go-live/:streamId`): always immersive (no navbar / bottom nav).
 * - Watch live (self-serve or match-linked): navbar + bottom nav always render. Self-serve
 *   hero mode (status === 'live') only removes the top padding reserved for the navbar so the
 *   hero video can reach the viewport top — the navbar itself stays rendered, just transparent
 *   (see Navbar's own `isHeroNavbarPath` check).
 */
export function useMainLayoutChrome(pathname) {
  const isDesktop = useMediaQuery(LG_MEDIA_QUERY);
  const isGoLiveCamera = isGoLiveBroadcastPath(pathname);
  const isWatchLivePath = isLiveStreamImmersivePath(pathname) && !isGoLiveCamera;
  const heroMode = useLiveViewerHeroMode();

  const noTopPadding = isNavbarOverlayPath(pathname, isDesktop) || isGoLiveCamera || (isWatchLivePath && heroMode && !isDesktop);

  return {
    isDesktop,
    /** Active broadcaster session — transparent root for native camera underlay. */
    isGoLiveCamera,
    showNavbar: !isGoLiveCamera,
    showBottomNav: !isGoLiveCamera,
    mainPaddingTop: noTopPadding ? 0 : 'calc(env(safe-area-inset-top) + 56px)',
    mainPaddingBottom: isDesktop || isGoLiveCamera ? 0 : 'calc(env(safe-area-inset-bottom) + 70px)',
    rootClassName: isGoLiveCamera ? 'bg-transparent' : 'bg-black',
  };
}
