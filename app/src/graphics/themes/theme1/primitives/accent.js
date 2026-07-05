/**
 * Theme1 wrapper around shared vMix-safe accent helpers.
 */
import { accentMix as sharedAccentMix } from '../../../shared/accentColor.js';
import { isDecorativeBoxGlowEnabled } from '../visualEffects';

export {
  accentMix,
  accentPanelHeadGradient,
  isSixDigitHex,
  mixColorWithTransparent,
  normalizeAccentColor,
  resolveCssColorRgb,
} from '../../../shared/accentColor.js';

/**
 * @param {unknown} accent
 * @param {number} [percent=13]
 * @param {string} [size='16px']
 */
export function accentGlowShadow(accent, percent = 13, size = '16px') {
  if (!isDecorativeBoxGlowEnabled()) return 'none';
  return `0 0 calc(${size} * var(--glow)) ${sharedAccentMix(accent, percent)}`;
}
