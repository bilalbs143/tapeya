import { BOTTOM_NAV_HEIGHT, NAVBAR_HEIGHT, NAVBAR_Z } from '@/lib/constants/layout';

/** Landscape immersive shell covers global chrome. */
export const LIVE_BROADCAST_LANDSCAPE_SHELL_Z = NAVBAR_Z + 1;

/** Page header row overlaid on the video (above hearts at 15). */
export const LIVE_BROADCAST_HEADER_OVERLAY_Z = 20;

/** Comment / toggle controls overlaid on the video — above header so toggles stay tappable. */
export const LIVE_BROADCAST_CONTROLS_OVERLAY_Z = 25;

/** Portrait floating rotate / comment toggles — shared by live + highlights. */
export const LIVE_BROADCAST_TOGGLE_BTN =
  'flex h-9 w-9 shrink-0 touch-manipulation items-center justify-center rounded-full bg-white/[0.13] backdrop-blur-[9.7px] transition-opacity active:opacity-80';

/** Dock for portrait floating toggles (right-aligned above bottom chrome). */
export const LIVE_BROADCAST_BOTTOM_OVERLAY = 'pointer-events-none absolute right-0 bottom-[12px] left-0 px-4 pb-2';

/** Fixed landscape toggle — portaled above all app chrome. */
export const LIVE_BROADCAST_IMMERSIVE_TOGGLE_Z = 100;

/** Full-bleed immersive shell — video under transparent navbar, no bottom nav. */
export const LIVE_BROADCAST_IMMERSIVE_HEIGHT = '100dvh';

/** Portrait shell height — fills main below navbar + bottom nav padding. */
export const LIVE_BROADCAST_SHELL_HEIGHT = `calc(100dvh - env(safe-area-inset-top) - ${NAVBAR_HEIGHT}px - env(safe-area-inset-bottom) - ${BOTTOM_NAV_HEIGHT}px)`;

/** Desktop shell height — extends through main bottom padding (no bottom nav). */
export const LIVE_BROADCAST_SHELL_HEIGHT_DESKTOP = `calc(100dvh - env(safe-area-inset-top) - ${NAVBAR_HEIGHT}px - env(safe-area-inset-bottom))`;

/** Hero shell height — viewport top to bottom nav; navbar floats transparently on top. */
export const LIVE_BROADCAST_HERO_HEIGHT = `calc(100dvh - env(safe-area-inset-bottom) - ${BOTTOM_NAV_HEIGHT}px)`;

/** One-time height transition when a self-serve stream flips in/out of hero mode. */
export const LIVE_BROADCAST_HERO_TRANSITION_CLASS = 'transition-[height] duration-300 ease-out';

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
  'pointer-events-none absolute top-0 right-0 left-0 bg-gradient-to-b from-black/70 via-black/25 to-transparent px-4 pb-10';

/** Navbar clearance for floating controls on hero / immersive live pages. */
export const LIVE_BROADCAST_HEADER_TOP_PADDING = `calc(env(safe-area-inset-top) + ${NAVBAR_HEIGHT}px)`;

/** Go-live camera — navbar hidden; controls sit below the status bar only. */
export const LIVE_BROADCAST_CAMERA_HEADER_TOP = 'calc(env(safe-area-inset-top) + 10px)';

/**
 * Secondary banners under the go-live camera header (e.g. rotate tip).
 * Keeps the previous 88px web offset; adds safe-area on native.
 */
export const LIVE_BROADCAST_CAMERA_BANNER_TOP = 'calc(env(safe-area-inset-top, 0px) + 88px)';

/** Top header row on the go-live camera screen. */
export const LIVE_BROADCAST_CAMERA_HEADER_CLASS =
  'pointer-events-none absolute top-0 right-0 left-0 bg-linear-to-b from-black/75 via-black/30 to-transparent px-4 pb-12';

/** Bottom vignette for comment dock + shutter — never full-screen (camera shows through center). */
export const LIVE_BROADCAST_BOTTOM_SCRIM =
  'pointer-events-none absolute inset-x-0 bottom-0 h-[min(360px,48dvh)] bg-linear-to-t from-black/90 via-black/45 to-transparent';

/** Landscape badge row — no gradient (rotates to a visible top-edge shadow). */
export const LIVE_BROADCAST_LANDSCAPE_HEADER_ROW = 'pointer-events-none absolute top-0 right-0 left-0 px-4 pt-2';
