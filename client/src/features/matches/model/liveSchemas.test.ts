import { describe, expect, it } from 'vitest';

import { toLiveSnapshot, toResultDetail } from './liveSchemas';

describe('liveSchemas', () => {
  it('maps first-innings match-state onto the batting side', () => {
    const snap = toLiveSnapshot(
      {
        active_innings: {
          innings_number: 1,
          batting_team_id: 10,
          total_runs: 42,
          total_wickets: 1,
          overs_display: '5.2',
        },
      },
      { homeId: 10, awayId: 11 }
    );
    expect(snap?.batting).toBe('home');
    expect(snap?.homeScore).toBe('42/1');
    expect(snap?.awayScore).toBeNull();
    expect(snap?.chase).toBeNull();
  });

  it('maps chase need on second innings', () => {
    const snap = toLiveSnapshot(
      {
        active_innings: {
          innings_number: 2,
          batting_team_id: 11,
          total_runs: 20,
          total_wickets: 0,
          overs_display: '3.0',
          target: 101,
          runs_to_win: 81,
          balls_remaining: 42,
        },
      },
      { homeId: 10, awayId: 11 }
    );
    expect(snap?.batting).toBe('away');
    expect(snap?.awayScore).toBe('20/0');
    expect(snap?.homeScore).toBe('100');
    expect(snap?.chase).toEqual({ need: 81, ballsLeft: 42 });
  });

  it('maps result summary and MOTM', () => {
    expect(
      toResultDetail({
        id: 4,
        result_summary: 'City Blues won by 12 runs',
        player_of_match: { id: 9, name: 'Aisha Khan' },
      })
    ).toEqual({
      resultSummary: 'City Blues won by 12 runs',
      motmName: 'Aisha Khan',
    });
  });
});
