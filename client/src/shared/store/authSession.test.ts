import { afterEach, describe, expect, it } from 'vitest';

import { readLegacyAuthSession } from './authSession';

describe('readLegacyAuthSession', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('returns null when persist:root is missing', () => {
    expect(readLegacyAuthSession()).toBeNull();
  });

  it('reads accessToken + user.id from redux-persist shape', () => {
    window.localStorage.setItem(
      'persist:root',
      JSON.stringify({
        auth: JSON.stringify({
          user: { id: 42, name: 'Waqar' },
          accessToken: 'tok_abc',
          isAuthenticated: true,
        }),
        _persist: JSON.stringify({ version: 1, rehydrated: true }),
      })
    );

    expect(readLegacyAuthSession()).toEqual({ accessToken: 'tok_abc', userId: 42 });
  });

  it('returns null when token or user id is missing', () => {
    window.localStorage.setItem(
      'persist:root',
      JSON.stringify({
        auth: JSON.stringify({ user: { id: 1 }, accessToken: null, isAuthenticated: false }),
      })
    );
    expect(readLegacyAuthSession()).toBeNull();
  });
});
