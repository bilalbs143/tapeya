/** Player window — 1 behind, 4 ahead (forward-biased for snap). */

/** Slides before the active index that keep a live player. */
export function getReelPlayerBehind(): number {
  return 1;
}

/** Slides after the active index that keep a live player. */
export function getReelPlayerAhead(): number {
  return 4;
}

/** Max of ahead/behind — tests and symmetric call sites. */
export function getReelPlayerWindowRadius(): number {
  return Math.max(getReelPlayerBehind(), getReelPlayerAhead());
}

export function isInPlayerWindow(
  index: number,
  activeIndex: number,
  ahead = getReelPlayerAhead(),
  behind = getReelPlayerBehind()
): boolean {
  return index >= activeIndex - behind && index <= activeIndex + ahead;
}

/** Immediate next slide — larger warm buffer + aggressive silent prime. */
export function isNextPlayerSlide(index: number, activeIndex: number): boolean {
  return index === activeIndex + 1;
}
