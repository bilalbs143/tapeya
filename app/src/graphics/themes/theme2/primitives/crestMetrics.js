/**
 * Pure sizing helpers for Crest / TeamLogoSlot — kept separate from atoms.jsx for Fast Refresh.
 */

/**
 * Scale team short-code type to crest size.
 * Tuned to the LT baseline (28px label in an 86px crest); longer codes shrink slightly.
 */
export function crestCodeFontSize(size, label = '') {
  const len = Math.max(1, String(label).trim().length);
  const base = size * 0.326;
  const lengthFactor = Math.min(1, 3 / len);

  return Math.round(Math.max(16, Math.min(base * lengthFactor, size * 0.4)));
}

/** Soft corner radius — rounded enough to avoid sharp squares, not a heavy theme1 plate. */
export function crestCornerRadius(size) {
  return Math.max(8, Math.round(size * 0.14));
}

/** Logo inset — light breathing room inside the crest square (controller-3 LT + polish). */
export function crestLogoPadding(size) {
  return Math.max(2, Math.round(size * 0.06));
}
