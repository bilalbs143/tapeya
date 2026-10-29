import { describe, expect, it } from 'vitest';

import { settingInt } from './createReelFlow';

describe('createReelFlow', () => {
  it('reads integer system settings', () => {
    expect(settingInt([{ key: 'reels_max_upload_mb', value: '50' }], 'reels_max_upload_mb')).toBe(50);
    expect(settingInt([], 'missing')).toBe(0);
  });
});
