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

/** Corner radius scales with crest size so large FS crests keep the same proportions as LT. */
export function crestCornerRadius(size) {
  return Math.max(12, Math.round(size * 0.22));
}

/** Logo inset — preserves legacy 12px (Tailwind p-3) at 86px LT crests. */
export function crestLogoPadding(size) {
  return Math.max(12, Math.round(size * 0.035));
}
