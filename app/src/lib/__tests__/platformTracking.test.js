import { describe, expect, it } from 'vitest';

import {
  getLastSyncTime,
  isDue,
  POLL_INTERVAL_MS,
  setLastSyncTime,
  shouldSyncPlatform,
  STORAGE_KEY,
} from '../platformTracking.js';

function mockStorage(initial = {}) {
  const store = { ...initial };
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value);
    },
  };
}

describe('platformTracking', () => {
  it('isDue when never synced', () => {
    const storage = mockStorage();
    expect(isDue(1_000_000, getLastSyncTime(storage))).toBe(true);
  });

  it('is not due within 24 hours of last sync', () => {
    const storage = mockStorage();
    const now = 10_000_000;
    setLastSyncTime(now - POLL_INTERVAL_MS + 1, storage);
    expect(isDue(now, getLastSyncTime(storage))).toBe(false);
  });

  it('is due exactly 24 hours after last sync', () => {
    const storage = mockStorage();
    const now = 10_000_000;
    setLastSyncTime(now - POLL_INTERVAL_MS, storage);
    expect(isDue(now, getLastSyncTime(storage))).toBe(true);
  });

  it('should sync on login even when last sync was recent', () => {
    const now = 10_000_000;
    expect(shouldSyncPlatform({ justLoggedIn: true, now, lastSyncAt: now - 1000 })).toBe(true);
  });

  it('should not sync on persisted session when polled recently', () => {
    const now = 10_000_000;
    expect(shouldSyncPlatform({ justLoggedIn: false, now, lastSyncAt: now - 1000 })).toBe(false);
  });

  it('should sync on persisted session when poll interval elapsed', () => {
    const now = 10_000_000;
    expect(shouldSyncPlatform({ justLoggedIn: false, now, lastSyncAt: now - POLL_INTERVAL_MS })).toBe(true);
  });

  it('persists last sync timestamp in storage', () => {
    const storage = mockStorage();
    setLastSyncTime(12345, storage);
    expect(storage.getItem(STORAGE_KEY)).toBe('12345');
    expect(getLastSyncTime(storage)).toBe(12345);
  });
});
