import { afterEach, describe, expect, it } from 'vitest';

import { bumpContentRefreshKey, getContentRefreshKey } from './contentRefreshStore';

describe('contentRefreshStore', () => {
  afterEach(() => {
    // Bump leaves a higher key — fine across tests; assert relative growth.
  });

  it('bumps a monotonic content key for Outlet remount', () => {
    const before = getContentRefreshKey();
    const next = bumpContentRefreshKey();
    expect(next).toBe(before + 1);
    expect(getContentRefreshKey()).toBe(next);
  });
});
