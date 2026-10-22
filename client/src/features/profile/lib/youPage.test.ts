import { describe, expect, it } from 'vitest';

import { YOU_PROFILE_TABS } from './youPage';

describe('YOU_PROFILE_TABS', () => {
  it('lists reels, posts, saved', () => {
    expect(YOU_PROFILE_TABS.map((t) => t.value)).toEqual(['reels', 'posts', 'saved']);
  });
});
