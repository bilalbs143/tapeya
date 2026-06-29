import { Capacitor } from '@capacitor/core';

const STORAGE_KEY = 'liveStreamDebug';
const MAX_LOGS = 80;

/** @type {Array<{ id: number, ts: string, tag: string, payload: Record<string, unknown> }>} */
let logs = [];
/** @type {number} */
let nextId = 1;
/** @type {Set<() => void>} */
const listeners = new Set();

function readStorageFlag() {
  try {
    return typeof window !== 'undefined' ? window.localStorage?.getItem(STORAGE_KEY) : null;
  } catch {
    return null;
  }
}

/**
 * Enable in Safari Web Inspector or app WebView console:
 *   localStorage.setItem('liveStreamDebug', '1')
 * Reload the live broadcast page. Disable:
 *   localStorage.setItem('liveStreamDebug', '0')
 *
 * Also enabled when:
 * - `import.meta.env.DEV` (vite dev server)
 * - `VITE_LIVE_STREAM_DEBUG=1` (native builds via cap:ios)
 *
 * @returns {boolean}
 */
export function isLiveStreamDebugEnabled() {
  const storageFlag = readStorageFlag();
  if (storageFlag === '0') {
    return false;
  }
  if (storageFlag === '1') {
    return true;
  }

  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    return true;
  }

  if (import.meta.env.VITE_LIVE_STREAM_DEBUG === '1') {
    return true;
  }

  return false;
}

export function setLiveStreamDebugEnabled(enabled) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
  notify();
}

/**
 * @returns {typeof logs}
 */
export function getLiveStreamDebugLogs() {
  return logs;
}

/**
 * @param {() => void} listener
 * @returns {() => void}
 */
export function subscribeLiveStreamDebug(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((fn) => fn());
}

/**
 * @param {string} tag
 * @param {Record<string, unknown>} [payload]
 */
export function liveStreamDebugLog(tag, payload = {}) {
  const entry = {
    id: nextId++,
    ts: new Date().toISOString().slice(11, 23),
    tag,
    payload,
  };

  // Always buffer so the on-device panel can show history after toggling debug on.
  logs = [...logs.slice(-(MAX_LOGS - 1)), entry];
  notify();

  if (isLiveStreamDebugEnabled()) {
    console.warn(`[live-stream:${tag}]`, payload);
  }
}

/**
 * Snapshot of runtime env useful for iOS YouTube embed issues.
 *
 * @returns {Record<string, unknown>}
 */
export function getLiveStreamDebugEnvironment() {
  let capacitorPlatform = 'unknown';
  let isNative = false;
  try {
    capacitorPlatform = Capacitor.getPlatform();
    isNative = Capacitor.isNativePlatform();
  } catch {
    /* ignore */
  }

  return {
    capacitorPlatform,
    isNative,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    href: typeof window !== 'undefined' ? window.location.href : '',
    liveStreamDebug: isLiveStreamDebugEnabled(),
    viteLiveStreamDebug: import.meta.env.VITE_LIVE_STREAM_DEBUG ?? null,
    viteDev: Boolean(import.meta.env?.DEV),
  };
}

export function clearLiveStreamDebugLogs() {
  logs = [];
  notify();
}
