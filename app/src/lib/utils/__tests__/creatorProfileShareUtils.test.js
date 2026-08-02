import { describe, expect, it } from 'vitest';

import {
  buildCreatorProfileAppSchemeUrl,
  buildCreatorProfilePath,
  buildCreatorProfileShareUrl,
} from '../creatorProfileShareUtils';

describe('creatorProfileShareUtils', () => {
  it('builds creator profile paths and share URLs', () => {
    expect(buildCreatorProfilePath(9)).toBe('/reels/u/9');
    expect(buildCreatorProfileShareUrl(9, 'https://tapeya.com')).toBe('https://tapeya.com/reels/u/9');
    expect(buildCreatorProfileAppSchemeUrl(9)).toBe('tapeya://reels/u/9');
  });
});
