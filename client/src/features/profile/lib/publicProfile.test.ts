import { describe, expect, it } from 'vitest';

import { PUBLIC_PROFILE_TABS, publicProfileShareTitle } from './publicProfile';

describe('PUBLIC_PROFILE_TABS', () => {
  it('lists reels, posts, stats', () => {
    expect(PUBLIC_PROFILE_TABS.map((t) => t.value)).toEqual(['reels', 'posts', 'stats']);
  });
});

describe('publicProfileShareTitle', () => {
  it('prefers display name then falls back to handle', () => {
    expect(publicProfileShareTitle('Ali', 'ali')).toBe('Ali (@ali) on Tapeya');
    expect(publicProfileShareTitle(null, 'ali')).toBe('ali (@ali) on Tapeya');
  });
});
