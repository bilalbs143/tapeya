/**
 * Overlay / graphics processor debug logging.
 *
 * Enable in the OBS browser source (or any overlay tab) console:
 *   localStorage.setItem('graphicDebug', '1')
 * On-screen panel (vMix-friendly):
 *   append &overlayDebug=1 to the overlay URL
 * Then reload the overlay. Disable:
 *   localStorage.removeItem('graphicDebug')
 *   localStorage.removeItem('overlayDebug')
 */
import { isOverlayDiagnosticsEnabled, pushOverlayLog } from './overlayDiagnostics';
export function graphicLogger(level, tag, payload) {
  if (!isGraphicDebugEnabled()) return;

  const message = `[graphic:${tag}]`;
  if (level === 'log') {
    console.log(message, payload);
    return;
  }
  if (level === 'error') {
    console.error(message, payload);
    return;
  }
  console.warn(message, payload);
}

/**
 * @returns {boolean}
 */
export function isGraphicDebugEnabled() {
  try {
    if (typeof process !== 'undefined' && process.env?.GRAPHIC_RENDER_PLAN_CLI === '1') {
      return false;
    }
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (isOverlayDiagnosticsEnabled(params)) return true;
    }
    return (
      (typeof import.meta !== 'undefined' && import.meta.env?.DEV) ||
      (typeof window !== 'undefined' && window.localStorage?.getItem('graphicDebug') === '1')
    );
  } catch {
    return Boolean(typeof import.meta !== 'undefined' && import.meta.env?.DEV);
  }
}

/**
 * @param {string} tag
 * @param {Record<string, unknown>} payload
 */
export function graphicDebugLog(tag, payload) {
  graphicLogger('warn', tag, payload);
  try {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (isOverlayDiagnosticsEnabled(params) || window.localStorage?.getItem('overlayDebug') === '1') {
        pushOverlayLog(tag, payload);
      }
    }
  } catch {
    // Ignore diagnostics mirror failures.
  }
}
