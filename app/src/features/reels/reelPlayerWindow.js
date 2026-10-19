/**
 * Shared reel player window — mount nearby slides only.
 * Bias ahead of the active index (users mostly scroll forward) so the next
 * clips can attach + decode before snap. Keep one behind for scroll-back.
 */

/** Slides before the active index that keep a live player. */
export function getReelPlayerBehind() {
  return 1;
}

/** Slides after the active index that keep a live player. */
export function getReelPlayerAhead() {
  return 3;
}

/**
 * Legacy symmetric helper (max of ahead/behind) for older call sites/tests.
 */
export function getReelPlayerWindowRadius() {
  return Math.max(getReelPlayerBehind(), getReelPlayerAhead());
}

/**
 * @param {number} index
 * @param {number} activeIndex
 * @param {number} [ahead]
 * @param {number} [behind]
 */
export function isInPlayerWindow(index, activeIndex, ahead = getReelPlayerAhead(), behind = getReelPlayerBehind()) {
  return index >= activeIndex - behind && index <= activeIndex + ahead;
}

/**
 * Immediate next slide — gets a larger warm buffer + silent prime.
 * @param {number} index
 * @param {number} activeIndex
 */
export function isNextPlayerSlide(index, activeIndex) {
  return index === activeIndex + 1;
}
