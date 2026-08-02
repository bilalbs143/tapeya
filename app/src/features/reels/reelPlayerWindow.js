/**
 * Shared reel player window rule — mount prev/current/next only.
 * Import this in Reels.jsx and tests so the predicate cannot drift.
 */
export function isInPlayerWindow(index, activeIndex) {
  return Math.abs(index - activeIndex) <= 1;
}
