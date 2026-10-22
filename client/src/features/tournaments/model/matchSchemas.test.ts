import { describe, expect, it } from 'vitest';

import { matchToFixture, parseReactionCounts, parseTournamentMatches } from './matchSchemas';

describe('matchToFixture', () => {
  it('maps wire teams and status into display fields', () => {
    const fx = matchToFixture({
      id: 9,
      match_date: '2026-11-05',
      match_time: '16:00:00',
      venue_name: 'Oval',
      status: 'scheduled',
      status_label: 'Scheduled',
      group_index: 1,
      home_team: { id: 1, name: 'City Blues' },
      away_team: { id: 2, name: 'Karachi Kings' },
    });
    expect(fx.title).toBe('City Blues vs Karachi Kings');
    expect(fx.status).toBe('upcoming');
    expect(fx.groupIndex).toBe(1);
    expect(fx.meta).toContain('Oval');
  });

  it('treats live and completed statuses', () => {
    expect(matchToFixture({ id: 1, status: 'live' }).status).toBe('live');
    expect(matchToFixture({ id: 2, status: 'completed' }).status).toBe('result');
  });
});

describe('parseTournamentMatches', () => {
  it('unwraps a list envelope', () => {
    const list = parseTournamentMatches({
      data: [
        {
          id: 1,
          status: 'scheduled',
          home_team: { id: 1, name: 'A' },
          away_team: { id: 2, name: 'B' },
        },
      ],
    });
    expect(list).toHaveLength(1);
    expect(list[0]?.title).toBe('A vs B');
  });
});

describe('parseReactionCounts', () => {
  it('maps like/dislike/share envelopes', () => {
    expect(
      parseReactionCounts({
        data: {
          likes_count: 4,
          dislikes_count: 1,
          shares_count: 2,
          my_reaction: 'like',
        },
      })
    ).toEqual({
      likesCount: 4,
      dislikesCount: 1,
      sharesCount: 2,
      myReaction: 'like',
    });
  });
});
