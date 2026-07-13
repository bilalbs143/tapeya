/**
 * Cross-theme CSS color helpers (vMix 24 safe — never emits color-mix()).
 *
 * Theme folders import these directly (theme2+) or via a thin wrapper
 * (theme1 → `primitives/accent.js` with theme token defaults).
 */

/** Default accent RGB — matches theme1 `--accentA` (#5b7cff). */
export const DEFAULT_ACCENT_RGB = { r: 91, g: 124, b: 255, a: 1 };

/** @param {unknown} value @param {string} [fallback='#5b7cff'] */
export function normalizeColor(value, fallback = '#5b7cff') {
  const raw = String(value ?? '').trim();
  return raw || fallback;
}

/** @param {unknown} value @param {string} [fallback='#5b7cff'] */
export function normalizeAccentColor(value, fallback = '#5b7cff') {
  return normalizeColor(value, fallback);
}

/** @param {string} color */
export function isSixDigitHex(color) {
  return /^#[0-9a-f]{6}$/i.test(color);
}

/** @param {string} hex */
function parseHexRgb(hex) {
  const raw = hex.replace('#', '').trim();
  if (/^[0-9a-f]{6}$/i.test(raw)) {
    return {
      r: Number.parseInt(raw.slice(0, 2), 16),
      g: Number.parseInt(raw.slice(2, 4), 16),
      b: Number.parseInt(raw.slice(4, 6), 16),
      a: 1,
    };
  }
  if (/^[0-9a-f]{8}$/i.test(raw)) {
    return {
      r: Number.parseInt(raw.slice(0, 2), 16),
      g: Number.parseInt(raw.slice(2, 4), 16),
      b: Number.parseInt(raw.slice(4, 6), 16),
      a: Number.parseInt(raw.slice(6, 8), 16) / 255,
    };
  }
  return null;
}

/** @param {string} css */
function parseRgbCss(css) {
  const match = css.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
  if (!match) return null;
  return {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
    a: match[4] !== undefined ? Number(match[4]) : 1,
  };
}

/**
 * Resolve a CSS color string to RGB(A). Supports #rgb, #rrggbb, #rrggbbaa, rgb()/rgba(), and var().
 *
 * @param {string} color normalized color string
 * @param {{ fallbackRgb?: { r: number, g: number, b: number, a: number } }} [options]
 */
export function resolveCssColorRgb(color, { fallbackRgb = DEFAULT_ACCENT_RGB } = {}) {
  if (color.startsWith('#')) {
    const parsed = parseHexRgb(color);
    if (parsed) return parsed;
  }

  const rgb = parseRgbCss(color);
  if (rgb) return rgb;

  if (typeof document !== 'undefined') {
    try {
      const probe = document.createElement('span');
      probe.style.setProperty('color', color);
      probe.style.setProperty('position', 'absolute');
      probe.style.setProperty('visibility', 'hidden');
      document.documentElement.appendChild(probe);
      const computed = getComputedStyle(probe).color;
      probe.remove();
      const parsed = parseRgbCss(computed);
      if (parsed) return parsed;
    } catch {
      // Fall through to fallback RGB.
    }
  }

  return fallbackRgb;
}

/**
 * Mix a color with transparent at `percent` opacity (0–100).
 * Returns 8-digit hex for #rrggbb inputs, otherwise rgba().
 *
 * @param {unknown} rawColor
 * @param {number} percent
 * @param {{ fallback?: string, fallbackRgb?: { r: number, g: number, b: number, a: number } }} [options]
 */
export function mixColorWithTransparent(rawColor, percent, { fallback = '#5b7cff', fallbackRgb = DEFAULT_ACCENT_RGB } = {}) {
  const color = normalizeColor(rawColor, fallback);
  const { r, g, b } = resolveCssColorRgb(color, { fallbackRgb });
  const alpha = percent / 100;

  if (isSixDigitHex(color)) {
    const alphaHex = Math.round(alpha * 255)
      .toString(16)
      .padStart(2, '0');
    return `${color}${alphaHex}`;
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Alias for theme code — mix accent at `percent` opacity (0–100). */
export function accentMix(rawColor, percent, options) {
  return mixColorWithTransparent(rawColor, percent, options);
}

/** @param {unknown} [accent] */
export function accentPanelHeadGradient(accent = 'var(--accentA)') {
  return `linear-gradient(100deg, ${accentMix(accent, 33)}, transparent 60%)`;
}
