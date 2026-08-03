/**
 * Shared reel player window — mount nearby slides only.
 * Native iOS uses a wider warm window so the next clip can decode before snap.
 */

import { isIOS } from '@/platform/platform';

/** @returns {number} */
export function getReelPlayerWindowRadius() {
  return isIOS() ? 2 : 1;
}

/**
 * @param {number} index
 * @param {number} activeIndex
 * @param {number} [radius]
 */
export function isInPlayerWindow(index, activeIndex, radius = getReelPlayerWindowRadius()) {
  return Math.abs(index - activeIndex) <= radius;
}
