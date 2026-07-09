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
 * Go-live camera (`/live/go-live/:streamId`) hides the global navbar so the
 * broadcast page owns the full top safe-area with its own back + status row.
 */
export function useMainLayoutChrome(pathname) {
  const isDesktop = useMediaQuery(LG_MEDIA_QUERY);
  const isGoLiveCamera = isGoLiveBroadcastPath(pathname);
  const isImmersiveLive = isLiveStreamImmersivePath(pathname);

  return {
    isDesktop,
    /** Active broadcaster session — full-bleed camera, no app navbar. */
    isGoLiveCamera,
    /** Watch-live or go-live — no bottom tab bar. */
    isImmersiveLive,
    showNavbar: !isGoLiveCamera,
    showBottomNav: !isImmersiveLive,
    mainPaddingTop: isNavbarOverlayPath(pathname, isDesktop) ? 0 : 'calc(env(safe-area-inset-top) + 56px)',
    mainPaddingBottom: isDesktop || isImmersiveLive ? 0 : 'calc(env(safe-area-inset-bottom) + 70px)',
    rootClassName: isGoLiveCamera ? 'bg-transparent' : 'bg-black',
  };
}
