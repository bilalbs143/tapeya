import { describe, expect, it } from 'vitest';

import { type SuggestedUserWire, toSuggestedUser } from '../model/schemas';

describe('toSuggestedUser', () => {
  it('maps wire fields into domain suggestions', () => {
    const wire: SuggestedUserWire = {
      id: 3,
      name: 'Omar',
      nickname: 'omar',
      avatar_url: null,
      is_official: false,
      followers_count: 42,
      playing_role: 'Bowler',
      is_following: false,
      subtitle: 'Bowler',
    };

    expect(toSuggestedUser(wire)).toEqual({
      id: 3,
      name: 'Omar',
      handle: 'omar',
      nickname: 'omar',
      avatarUrl: null,
      isOfficial: false,
      followersCount: 42,
      role: 'Bowler',
      following: false,
      subtitle: 'Bowler',
    });
  });

  it('keeps nickname null when the API omits one', () => {
    expect(
      toSuggestedUser({
        id: 9,
        name: 'No Handle',
        nickname: null,
        avatar_url: null,
      })
    ).toMatchObject({ nickname: null, handle: 'user9' });
  });
});
