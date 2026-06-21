/**
 * Team accent color helpers for inline gradients, borders, and glows.
 *
 * Use accentMix(accent, percent) for translucent accents. Works with #rrggbb
 * (8-digit hex output) and CSS variables (color-mix).
 */
import { isDecorativeBoxGlowEnabled } from '../visualEffects';

/** @param {unknown} value @param {string} [fallback] */
export function normalizeAccentColor(value, fallback = '#5b7cff') {
  const raw = String(value ?? '').trim();
  return raw || fallback;
}

/** @param {string} color */
export function isSixDigitHex(color) {
  return /^#[0-9a-f]{6}$/i.test(color);
}

/**
 * @param {unknown} accent
 * @param {number} percent opacity mixed with transparent (0–100)
 */
export function accentMix(accent, percent) {
  const color = normalizeAccentColor(accent);
  if (isSixDigitHex(color)) {
    const alpha = Math.round((percent / 100) * 255)
      .toString(16)
      .padStart(2, '0');
    return `${color}${alpha}`;
  }
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}

/**
 * @param {unknown} accent
 * @param {number} [percent=13]
 * @param {string} [size='16px']
 */
export function accentGlowShadow(accent, percent = 13, size = '16px') {
  if (!isDecorativeBoxGlowEnabled()) return 'none';
  return `0 0 calc(${size} * var(--glow)) ${accentMix(accent, percent)}`;
}
