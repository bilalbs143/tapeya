import { describe, expect, it } from 'vitest';

import { composeDestination } from '@/lib/feed/composeDestination';

describe('composeDestination', () => {
  it('sends guests to login with from state', () => {
    expect(composeDestination('image', false)).toEqual({
      pathname: '/login',
      state: { from: '/feed/compose?type=image' },
    });
  });

  it('sends authed users to compose with type', () => {
    expect(composeDestination('video', true)).toEqual({
      pathname: '/feed/compose',
      search: '?type=video',
      state: { type: 'video' },
    });
  });
});
