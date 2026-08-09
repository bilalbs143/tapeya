/**
 * Shared reel player window — mount nearby slides only.
 * ±2 so the next two clips can decode before snap (all platforms).
 */

export function getReelPlayerWindowRadius() {
  return 2;
}

/**
 * @param {number} index
 * @param {number} activeIndex
 * @param {number} [radius]
 */
export function isInPlayerWindow(index, activeIndex, radius = getReelPlayerWindowRadius()) {
  return Math.abs(index - activeIndex) <= radius;
}
