import { useLiveViewerImmersiveSelfServe } from '@/features/stream/liveViewerChromeStore';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { LG_MEDIA_QUERY } from '@/lib/constants/layout';
import {
  isGoLiveBroadcastPath,
  isLiveStreamImmersivePath,
  isNavbarOverlayPath,
} from '@/lib/utils/routeUtils';

/**
 * Layout chrome flags for {@link MainLayout}.
 *
 * - Go-live camera (`/live/go-live/:streamId`): always immersive (no navbar / bottom nav).
 * - Watch self-serve mobile: immersive full-bleed (no navbar / bottom nav).
 * - Watch match-linked: classic chrome (navbar + bottom nav) + 16:9 player.
 */
export function useMainLayoutChrome(pathname) {
  const isDesktop = useMediaQuery(LG_MEDIA_QUERY);
  const isGoLiveCamera = isGoLiveBroadcastPath(pathname);
  const isWatchLivePath = isLiveStreamImmersivePath(pathname) && !isGoLiveCamera;
  const immersiveSelfServe = useLiveViewerImmersiveSelfServe();

  const hideMobileChrome =
    isGoLiveCamera || (isWatchLivePath && immersiveSelfServe && !isDesktop);

  const noBottomNav = isGoLiveCamera || (isWatchLivePath && immersiveSelfServe);
  const noTopPadding =
    isNavbarOverlayPath(pathname, isDesktop) || hideMobileChrome;

  return {
    isDesktop,
    /** Active broadcaster session — transparent root for native camera underlay. */
    isGoLiveCamera,
    showNavbar: !hideMobileChrome,
    showBottomNav: !noBottomNav,
    mainPaddingTop: noTopPadding ? 0 : 'calc(env(safe-area-inset-top) + 56px)',
    mainPaddingBottom: isDesktop || noBottomNav ? 0 : 'calc(env(safe-area-inset-bottom) + 70px)',
    rootClassName: isGoLiveCamera ? 'bg-transparent' : 'bg-black',
  };
}
