/**
 * Live `<video>` window for reels.
 *
 * iOS native HLS stalls when more than ~2 masters are attached (readyState 1 +
 * NETWORK_IDLE). Keep only the active slide and the immediate next; farther
 * slides use HTTP prefetch only.
 */

/** Slides after active that keep a live player (always the next snap). */
export const REEL_PLAYER_AHEAD = 1;

export function isInPlayerWindow(index: number, activeIndex: number): boolean {
  return index === activeIndex || index === activeIndex + REEL_PLAYER_AHEAD;
}

export function isNextPlayerSlide(index: number, activeIndex: number): boolean {
  return index === activeIndex + REEL_PLAYER_AHEAD;
}
