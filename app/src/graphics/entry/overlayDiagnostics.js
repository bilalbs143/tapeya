/**
 * On-screen overlay diagnostics for OBS / vMix (especially when DevTools is unavailable).
 *
 * Enable: append `overlayDebug=1` to the signed overlay URL, or
 *   localStorage.setItem('overlayDebug', '1') then reload.
 */
import { mixColorWithTransparent, resolveCssColorRgb } from '../shared/accentColor';

/** @type {Array<{ at: number, tag: string, message: string }>} */
const logRing = [];

/** @type {Array<{ at: number, source: string, message: string }>} */
const errorRing = [];

/** @type {Set<(payload: { logs: typeof logRing, errors: typeof errorRing }) => void>} */
const listeners = new Set();

const MAX_RING = 40;

function notify() {
  const snapshot = { logs: [...logRing], errors: [...errorRing] };
  listeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch {
      // Ignore listener failures.
    }
  });
}

/**
 * @param {URLSearchParams} [searchParams]
 * @returns {boolean}
 */
export function isOverlayDiagnosticsEnabled(searchParams) {
  try {
    if (searchParams?.get('overlayDebug') === '1') return true;
    if (typeof window !== 'undefined' && window.localStorage?.getItem('overlayDebug') === '1') {
      return true;
    }
  } catch {
    // Ignore storage access errors.
  }
  return false;
}

let captureInstalled = false;

/** Install global error/rejection handlers once. */
export function installOverlayDiagnosticsCapture() {
  if (captureInstalled || typeof window === 'undefined') return;
  captureInstalled = true;

  window.addEventListener('error', (event) => {
    pushOverlayError('window.error', event.error?.message ?? event.message ?? 'Unknown error');
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    pushOverlayError(
      'unhandledrejection',
      reason instanceof Error ? reason.message : String(reason ?? 'Unknown rejection'),
    );
  });

  pushOverlayLog('boot', 'Diagnostics capture installed');
}

/**
 * @param {string} tag
 * @param {unknown} payload
 */
export function pushOverlayLog(tag, payload) {
  const message =
    typeof payload === 'string'
      ? payload
      : (() => {
          try {
            return JSON.stringify(payload);
          } catch {
            return String(payload);
          }
        })();

  logRing.push({ at: Date.now(), tag, message });
  if (logRing.length > MAX_RING) logRing.shift();

  if (typeof console !== 'undefined') {
    console.warn(`[overlay:${tag}]`, payload);
  }

  notify();
}

/**
 * @param {string} source
 * @param {unknown} err
 */
export function pushOverlayError(source, err) {
  const message = err instanceof Error ? err.message : String(err ?? 'Unknown error');
  errorRing.push({ at: Date.now(), source, message });
  if (errorRing.length > MAX_RING) errorRing.shift();

  if (typeof console !== 'undefined') {
    console.error(`[overlay:${source}]`, err);
  }

  notify();
}

/**
 * @param {(payload: { logs: typeof logRing, errors: typeof errorRing }) => void} listener
 * @returns {() => void}
 */
export function subscribeOverlayDiagnostics(listener) {
  listeners.add(listener);
  listener({ logs: [...logRing], errors: [...errorRing] });
  return () => listeners.delete(listener);
}

/**
 * @returns {boolean | 'unknown'}
 */
function supportsColorMix() {
  try {
    if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function') return 'unknown';
    return CSS.supports('color', 'color-mix(in srgb, #5b7cff 33%, transparent)');
  } catch {
    return 'unknown';
  }
}

/** @returns {number|null} */
function parseChromeMajorVersion() {
  if (typeof navigator === 'undefined') return null;
  const match = navigator.userAgent.match(/Chrom(?:e|ium)\/(\d+)/);
  return match ? Number(match[1]) : null;
}

/** @returns {Record<string, unknown>} */
export function collectEnvironmentDiagnostics() {
  const chromeVersion = parseChromeMajorVersion();
  const root = typeof document !== 'undefined' ? document.documentElement : null;

  let computedAccentA = '';
  let resolvedAccentRgb = null;
  if (root && typeof getComputedStyle === 'function') {
    computedAccentA = getComputedStyle(root).getPropertyValue('--accentA').trim();
    try {
      resolvedAccentRgb = resolveCssColorRgb('var(--accentA)');
    } catch (err) {
      pushOverlayError('accent.resolve', err);
    }
  }

  let accentMixHex = 'error';
  let accentMixVar = 'error';
  try {
    accentMixHex = mixColorWithTransparent('#5b7cff', 33);
    accentMixVar = mixColorWithTransparent('var(--accentA)', 33);
  } catch (err) {
    pushOverlayError('accent.mix', err);
  }

  return {
    href: typeof location !== 'undefined' ? location.href : '',
    pathname: typeof location !== 'undefined' ? location.pathname : '',
    overlayRouteAttr: Boolean(root?.hasAttribute('data-overlay-route')),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    chromeMajor: chromeVersion,
    viewport:
      typeof window !== 'undefined' ? `${window.innerWidth}×${window.innerHeight}` : '',
    devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : null,
    esModule: typeof import.meta !== 'undefined',
    colorMixSupported: supportsColorMix(),
    cssSupports: typeof CSS !== 'undefined' && typeof CSS.supports === 'function',
    fontsApi: typeof document !== 'undefined' && Boolean(document.fonts),
    fontsStatus:
      typeof document !== 'undefined' && document.fonts ? document.fonts.status : 'n/a',
    computedAccentA: computedAccentA || '(empty)',
    resolvedAccentRgb,
    accentMixHex,
    accentMixVar,
    reactRootPresent: Boolean(typeof document !== 'undefined' && document.getElementById('root')),
    bootMarkerPresent: Boolean(typeof document !== 'undefined' && document.getElementById('overlay-debug-boot')),
  };
}

/**
 * @param {string} blockReason
 * @returns {string}
 */
export function describeGateBlock(blockReason) {
  switch (blockReason) {
    case 'ready':
      return 'Gate open — graphic should render';
    case 'loading_session':
      return 'Waiting for graphic-session HTTP response';
    case 'session_error':
      return 'Graphic session request failed (auth / signature / network)';
    case 'no_theme_slug':
      return 'Session loaded but theme.slug is missing';
    case 'loading_assets':
      return 'Loading theme CSS / fonts';
    case 'assets_error':
      return 'Theme CSS or fonts failed to load';
    case 'no_render_plan':
      return 'No active command (renderPlan is null)';
    case 'no_match_id':
      return 'Route missing matchId';
    case 'boot':
      return 'React mounting…';
    default:
      return blockReason;
  }
}
