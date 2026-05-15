/**
 * Shared visual tokens for theme1 player / broadcast graphics.
 * Keeps controller-frame panel, typography, and shell classes aligned across overlays.
 */

import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';

export const PLAYER_PAGE_BG_CLASS = 'bg-[#1D1E22]';

export const controllerFrameImageUrl = `${CLOUDFRONT_APP_BASE}/images/background/controller-frame.png`;

export const defaultPlayerAvatarUrl = `${CLOUDFRONT_APP_BASE}/images/standard/avatar-controlls.png`;

export const defaultTeamLogoUrl = `${CLOUDFRONT_APP_BASE}/images/standard/team-logo.png`;

/** Lower-third strip: controller art as panel fill. */
export function controllerPanelSurfaceStyle() {
  return {
    backgroundImage: `url(${controllerFrameImageUrl})`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  };
}

/** Horizontal hairline used under player name / figures row. */
export const playerGraphicHorizontalRuleStyle = {
  background:
    'linear-gradient(90deg, #080807 0%, #FFFFFF 50%, #080807 100%)',
};

/** Scoreboard lower-third vertical dividers (e.g. `StatsDefault`). */
export const statsDefaultVerticalSeparatorStyle = {
  background: 'linear-gradient(180deg, #080807 0%, #FFFFFF 50%, #080807 100%)',
};

export const statsDefaultBatterSeparatorStyle = {
  background:
    'linear-gradient(90deg, rgba(8,8,7,1) 0%, rgba(255,255,255,0.95) 50%, rgba(8,8,7,1) 100%)',
};

export const playerNameAccentClass =
  'text-[15px] leading-none font-extrabold tracking-wide text-[#DA9811] uppercase sm:text-[28px]';

export const showcaseSectionClass =
  'relative w-full max-w-[677px] overflow-hidden bg-black px-4 py-6 text-white sm:px-7 sm:py-8';

export const showcaseTitleClass =
  'text-[16px] leading-none font-bold text-[#DA9811] uppercase sm:text-[21px]';

export const showcasePageWrapClass =
  'flex min-h-screen items-center justify-center p-3 sm:p-5';

/** Avatar stage (silhouette panel) — shared by intro / career / tournament player cards. */
export const avatarStageShellClass =
  'relative h-[290px] overflow-hidden rounded-tl-[140px] rounded-tr-[20px] bg-black sm:h-[300px] sm:rounded-tr-[24px]';

export const avatarStageImageClass =
  'absolute right-1/2 bottom-0 w-[55%] translate-x-1/2 object-contain sm:w-[60%]';
