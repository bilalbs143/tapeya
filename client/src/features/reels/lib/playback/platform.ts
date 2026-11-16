import { getPlatform } from '@/shared/platform/platform';

import type { ReelPlaybackPlatform } from './types';

/** Resolve which reel playback stack owns this runtime. */
export function getReelPlaybackPlatform(): ReelPlaybackPlatform {
  const platform = getPlatform();
  if (platform === 'ios') return 'ios';
  if (platform === 'android') return 'android';
  return 'web';
}
