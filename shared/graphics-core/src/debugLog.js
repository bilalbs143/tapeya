/**
 * Overlay / graphics processor debug logging.
 *
 * Enable in the OBS browser source (or any overlay tab) console:
 *   localStorage.setItem('graphicDebug', '1')
 * Then reload the overlay. Disable:
 *   localStorage.removeItem('graphicDebug')
 *
 * Also runs when import.meta.env.DEV is true (Vite dev server).
 *
 * @param {'log'|'info'|'warn'|'debug'|'error'} level
 * @param {string} tag
 * @param {Record<string, unknown>} payload
 */
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
}
