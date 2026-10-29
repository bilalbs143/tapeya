import { describe, expect, it } from 'vitest';

import { formatHashtagLabel, mergeCaptionWithHashtags } from './hashtags';

describe('hashtags', () => {
  it('formats tokens with leading #', () => {
    expect(formatHashtagLabel('final tapeball')).toBe('#final #tapeball');
    expect(formatHashtagLabel('#already tagged')).toBe('#already #tagged');
    expect(formatHashtagLabel('')).toBe('');
  });

  it('merges caption and tags', () => {
    expect(mergeCaptionWithHashtags('Six!', 'final')).toBe('Six! #final');
    expect(mergeCaptionWithHashtags('', 'final')).toBe('#final');
    expect(mergeCaptionWithHashtags('Six!', '')).toBe('Six!');
  });
});
