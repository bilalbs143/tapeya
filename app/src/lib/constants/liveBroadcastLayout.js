import { BOTTOM_NAV_CLEARANCE, NAVBAR_Z } from '@/lib/constants/layout';

/** Fixed shell sits below the global navbar (50) so nav stays interactive. */
export const LIVE_BROADCAST_SHELL_Z = 30;

/** Landscape immersive shell covers global chrome. */
export const LIVE_BROADCAST_LANDSCAPE_SHELL_Z = NAVBAR_Z + 1;

/** Page header row overlaid on the video (above hearts at 15). */
export const LIVE_BROADCAST_HEADER_OVERLAY_Z = 20;

/** Comment / toggle controls overlaid on the video. */
export const LIVE_BROADCAST_CONTROLS_OVERLAY_Z = 10;

/** Full-bleed shell — video sits under the transparent global navbar. */
export const LIVE_BROADCAST_SHELL_STYLE = {
  top: 0,
  bottom: `calc(env(safe-area-inset-bottom) + ${BOTTOM_NAV_CLEARANCE}px)`,
};

/** Landscape immersive — edge-to-edge over navbar and bottom nav. */
export const LIVE_BROADCAST_LANDSCAPE_SHELL_STYLE = {
  top: 0,
  bottom: 0,
};

/** Desktop: no bottom nav; shell fills to viewport bottom via lg:bottom-0. */
export const LIVE_BROADCAST_SHELL_CLASS =
  'fixed right-0 left-0 overflow-hidden bg-black lg:left-[280px] lg:bottom-0';

/** Top scrim behind the hero header row (matches highlights hero controls). */
export const LIVE_BROADCAST_HEADER_SCRIM =
  'pointer-events-none absolute top-0 right-0 left-0 bg-gradient-to-b from-black/75 via-black/35 to-transparent px-4 pb-6';
