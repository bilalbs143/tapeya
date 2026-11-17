export const STORAGE_KEY = 'tapeya_platform_sync_at';
export const POLL_INTERVAL_MS = 24 * 60 * 60 * 1000;

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

export function getLastSyncTime(storage: StorageLike = localStorage): number {
  try {
    const value = storage.getItem(STORAGE_KEY);
    return value ? Number(value) : 0;
  } catch {
    return 0;
  }
}

export function setLastSyncTime(now: number = Date.now(), storage: StorageLike = localStorage): void {
  try {
    storage.setItem(STORAGE_KEY, String(now));
  } catch {
    // private mode / quota
  }
}

export function isDue(now: number = Date.now(), lastSyncAt: number = getLastSyncTime()): boolean {
  if (lastSyncAt === 0) return true;
  return now - lastSyncAt >= POLL_INTERVAL_MS;
}

/** Always sync on login/registration; otherwise at most every 24h. */
export function shouldSyncPlatform({
  justLoggedIn,
  now = Date.now(),
  lastSyncAt = getLastSyncTime(),
}: {
  justLoggedIn: boolean;
  now?: number | undefined;
  lastSyncAt?: number | undefined;
}): boolean {
  return justLoggedIn || isDue(now, lastSyncAt);
}
