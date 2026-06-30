import { BOTTOM_NAV_HEIGHT, NAVBAR_HEIGHT, NAVBAR_Z } from '@/lib/constants/layout';

/** Landscape immersive shell covers global chrome. */
export const LIVE_BROADCAST_LANDSCAPE_SHELL_Z = NAVBAR_Z + 1;

/** Page header row overlaid on the video (above hearts at 15). */
export const LIVE_BROADCAST_HEADER_OVERLAY_Z = 20;

/** Comment / toggle controls overlaid on the video — above header so toggles stay tappable. */
export const LIVE_BROADCAST_CONTROLS_OVERLAY_Z = 25;

/** Fixed landscape toggle — portaled above all app chrome. */
export const LIVE_BROADCAST_IMMERSIVE_TOGGLE_Z = 100;

/** Portrait shell height — fills main below navbar + bottom nav padding. */
export const LIVE_BROADCAST_SHELL_HEIGHT = `calc(100vh - env(safe-area-inset-top) - ${NAVBAR_HEIGHT}px - env(safe-area-inset-bottom) - ${BOTTOM_NAV_HEIGHT}px)`;

/** Desktop shell height — extends through main bottom padding (no bottom nav). */
export const LIVE_BROADCAST_SHELL_HEIGHT_DESKTOP = `calc(100vh - env(safe-area-inset-top) - ${NAVBAR_HEIGHT}px - env(safe-area-inset-bottom))`;

/** Cancels MainLayout bottom padding on desktop so the player reaches the viewport edge. */
export const LIVE_BROADCAST_SHELL_DESKTOP_CLASS = 'lg:-mb-[calc(env(safe-area-inset-bottom)+70px)]';

/** In-flow player shell below the solid global navbar. */
export const LIVE_BROADCAST_SHELL_CLASS = 'relative overflow-hidden bg-black';

/** Portrait vs immersive landscape shell classes. */
/**
 * @param {boolean} isLandscape
 * @param {'bg-black' | 'bg-transparent'} [surfaceBg='bg-black']
 */
export function getLiveBroadcastShellClass(isLandscape, surfaceBg = 'bg-black') {
  if (isLandscape) {
    return `fixed right-0 left-0 overflow-hidden ${surfaceBg} lg:left-[280px]`;
  }

  return `relative overflow-hidden ${surfaceBg} ${LIVE_BROADCAST_SHELL_DESKTOP_CLASS}`;
}

export const LIVE_BROADCAST_LANDSCAPE_SHELL_STYLE = {
  top: 0,
  bottom: 0,
};

/** Top scrim behind the floating page header row (portrait / desktop overlay). */
export const LIVE_BROADCAST_HEADER_SCRIM =
  'pointer-events-none absolute top-0 right-0 left-0 bg-gradient-to-b from-black/75 via-black/35 to-transparent px-4 pb-6';

/** Landscape badge row — no gradient (rotates to a visible top-edge shadow). */
export const LIVE_BROADCAST_LANDSCAPE_HEADER_ROW = 'pointer-events-none absolute top-0 right-0 left-0 px-4 pt-2';
