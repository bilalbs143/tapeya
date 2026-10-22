import { describe, expect, it } from 'vitest';

import { formatReelHashtagLabel, settingInt } from './createReelFlow';

describe('createReelFlow', () => {
  it('reads integer system settings', () => {
    expect(settingInt([{ key: 'reels_max_upload_mb', value: '50' }], 'reels_max_upload_mb')).toBe(50);
    expect(settingInt([], 'missing')).toBe(0);
  });

  it('formats hashtag chips', () => {
    expect(formatReelHashtagLabel('final tapeball')).toBe('#final #tapeball');
    expect(formatReelHashtagLabel('#already tagged')).toBe('#already #tagged');
    expect(formatReelHashtagLabel('')).toBe('');
  });
});
