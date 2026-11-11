import { describe, expect, it } from 'vitest';

import { parseHeartEventPayload } from './heartEvent';

describe('parseHeartEventPayload', () => {
  it('maps LiveStreamHeartReceived broadcastWith fields', () => {
    expect(
      parseHeartEventPayload({
        user_id: 42,
        avatar_url: 'https://cdn.example/a.jpg',
        initials: 'AB',
      })
    ).toEqual({
      userId: 42,
      avatarUrl: 'https://cdn.example/a.jpg',
      initials: 'AB',
    });
  });

  it('coerces string user ids and trims initials', () => {
    expect(
      parseHeartEventPayload({
        user_id: '7',
        avatar_url: '',
        initials: '  z ',
      })
    ).toEqual({
      userId: 7,
      avatarUrl: null,
      initials: 'z',
    });
  });

  it('falls back for empty payloads', () => {
    expect(parseHeartEventPayload(null)).toEqual({
      userId: null,
      avatarUrl: null,
      initials: '?',
    });
  });
});
