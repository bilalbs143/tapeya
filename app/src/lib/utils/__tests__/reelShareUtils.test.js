import { describe, expect, it } from 'vitest';

import { buildReelAppSchemeUrl, buildReelSharePath, buildReelShareUrl } from '../reelShareUtils';

describe('reelShareUtils', () => {
  it('wraps the generic deep-link builders for reels', () => {
    expect(buildReelSharePath(42)).toBe('/reels/42');
    expect(buildReelShareUrl(42, 'https://tapeya.com')).toBe('https://tapeya.com/reels/42');
    expect(buildReelAppSchemeUrl(42)).toBe('tapeya://reels/42');
  });
});
