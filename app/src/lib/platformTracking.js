export const STORAGE_KEY = 'tapeya_platform_sync_at';
export const POLL_INTERVAL_MS = 24 * 60 * 60 * 1000;

/**
 * @param {Storage} [storage]
 */
export function getLastSyncTime(storage = localStorage) {
  try {
    const value = storage.getItem(STORAGE_KEY);
    return value ? Number(value) : 0;
  } catch {
    return 0;
  }
}

/**
 * @param {number} [now]
 * @param {Storage} [storage]
 */
export function setLastSyncTime(now = Date.now(), storage = localStorage) {
  try {
    storage.setItem(STORAGE_KEY, String(now));
  } catch {
    // private mode / quota
  }
}

/**
 * @param {number} [now]
 * @param {number} [lastSyncAt]
 */
export function isDue(now = Date.now(), lastSyncAt = getLastSyncTime()) {
  if (lastSyncAt === 0) return true;
  return now - lastSyncAt >= POLL_INTERVAL_MS;
}

/**
 * Whether to sync platform now: always on login/registration, otherwise every 24h.
 *
 * @param {{ justLoggedIn: boolean, now?: number, lastSyncAt?: number }} options
 */
export function shouldSyncPlatform({ justLoggedIn, now = Date.now(), lastSyncAt = getLastSyncTime() }) {
  return justLoggedIn || isDue(now, lastSyncAt);
}
