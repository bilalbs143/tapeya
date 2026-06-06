import { BOTTOM_NAV_CLEARANCE, NAVBAR_HEIGHT } from '@/lib/constants/layout';

/** Fixed shell between global navbar and bottom navigation. */
export const LIVE_BROADCAST_SHELL_STYLE = {
  top: `calc(env(safe-area-inset-top) + ${NAVBAR_HEIGHT}px)`,
  bottom: `calc(env(safe-area-inset-bottom) + ${BOTTOM_NAV_CLEARANCE}px)`,
};

/** Desktop: no bottom nav; toolbar uses lg top offset only. */
export const LIVE_BROADCAST_SHELL_CLASS =
  'fixed right-0 left-0 z-30 overflow-hidden bg-black lg:left-[280px] lg:bottom-0';
