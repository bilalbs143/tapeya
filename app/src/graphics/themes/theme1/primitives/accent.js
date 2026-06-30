/**
 * Theme1 accent helpers — thin wrapper around shared color utilities.
 *
 * Use `accentMix()` for translucent accents in JSX/inline styles (never color-mix()).
 * Future themes: import from `graphics/shared/accentColor.js` with their own defaults.
 */
import { mixColorWithTransparent, normalizeColor } from '../../../shared/accentColor';
import { colors } from '../config';

/** @param {unknown} value @param {string} [fallback] */
export function normalizeAccentColor(value, fallback = colors.accentA) {
  return normalizeColor(value, fallback);
}

export { isSixDigitHex } from '../../../shared/accentColor';

/**
 * @param {unknown} accent
 * @param {number} percent opacity mixed with transparent (0–100)
 */
export function accentMix(accent, percent) {
  return mixColorWithTransparent(accent, percent, { fallback: colors.accentA });
}

/** @param {unknown} [accent] */
export function accentPanelHeadGradient(accent = 'var(--accentA)') {
  return `linear-gradient(100deg, ${accentMix(accent, 33)}, transparent 60%)`;
}
