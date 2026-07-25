/**
 * Theme2 wrapper around shared vMix-safe accent helpers.
 * Defaults to wine `--accentA` (#c40038), not theme1 blue.
 */
import {
  accentMix as sharedAccentMix,
  isSixDigitHex,
  mixColorWithTransparent as sharedMixColorWithTransparent,
  normalizeAccentColor as sharedNormalizeAccentColor,
  resolveCssColorRgb as sharedResolveCssColorRgb,
} from '../../../shared/accentColor.js';
import { colors } from '../config';
import { isDecorativeBoxGlowEnabled } from '../visualEffects';

/** Theme2 accent RGB — matches `--accentA` / colors.accentA (#c40038). */
export const DEFAULT_ACCENT_RGB = { r: 196, g: 0, b: 56, a: 1 };

const DEFAULT_ACCENT = colors.accentA;

export { isSixDigitHex };

/** @param {unknown} value @param {string} [fallback] */
export function normalizeAccentColor(value, fallback = DEFAULT_ACCENT) {
  return sharedNormalizeAccentColor(value, fallback);
}

/**
 * @param {string} color
 * @param {{ fallbackRgb?: { r: number, g: number, b: number, a: number } }} [options]
 */
export function resolveCssColorRgb(color, { fallbackRgb = DEFAULT_ACCENT_RGB } = {}) {
  return sharedResolveCssColorRgb(color, { fallbackRgb });
}

/**
 * @param {unknown} rawColor
 * @param {number} percent
 * @param {{ fallback?: string, fallbackRgb?: { r: number, g: number, b: number, a: number } }} [options]
 */
export function mixColorWithTransparent(rawColor, percent, { fallback = DEFAULT_ACCENT, fallbackRgb = DEFAULT_ACCENT_RGB } = {}) {
  return sharedMixColorWithTransparent(rawColor, percent, { fallback, fallbackRgb });
}

/** @param {unknown} rawColor @param {number} percent @param {object} [options] */
export function accentMix(rawColor, percent, options) {
  return mixColorWithTransparent(rawColor, percent, options);
}

/** @param {unknown} [accent] */
export function accentPanelHeadGradient(accent = 'var(--accentA)') {
  return `linear-gradient(100deg, ${accentMix(accent, 33)}, transparent 60%)`;
}

/**
 * @param {unknown} accent
 * @param {number} [percent=13]
 * @param {string} [size='16px']
 */
export function accentGlowShadow(accent, percent = 13, size = '16px') {
  if (!isDecorativeBoxGlowEnabled()) return 'none';
  return `0 0 calc(${size} * var(--glow)) ${sharedAccentMix(accent, percent, {
    fallback: DEFAULT_ACCENT,
    fallbackRgb: DEFAULT_ACCENT_RGB,
  })}`;
}
