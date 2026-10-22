import { describe, expect, it } from 'vitest';

import { buildStartMatchPayload, formatMatchTimeForApi, startMatchReady } from './startMatchPayload';

describe('startMatchPayload', () => {
  it('requires both sides, venue, when, and overs', () => {
    expect(
      startMatchReady({
        tournamentId: 1,
        homeTeamId: 10,
        awayTeamId: 11,
        venue: 'Oval',
        matchDate: '2026-10-07',
        matchTime: '17:30',
        overs: 20,
        playersPerSide: 11,
      })
    ).toBe(true);
    expect(startMatchReady({ tournamentId: 1, homeTeamId: 10, awayTeamId: 10 })).toBe(false);
  });

  it('builds the StoreTournamentMatchRequest body', () => {
    expect(
      buildStartMatchPayload({
        tournamentId: 3,
        homeTeamId: 10,
        awayTeamId: 11,
        venue: '  Gulshan  ',
        matchDate: '2026-10-07',
        matchTime: '9:05',
        overs: 20,
        playersPerSide: 11,
        groupIndex: 2,
      })
    ).toEqual({
      home_team_id: 10,
      away_team_id: 11,
      match_date: '2026-10-07',
      match_time: '09:05',
      venue_name: 'Gulshan',
      players_per_side: 11,
      overs: 20,
      group_index: 2,
    });
  });

  it('pads single-digit hours for the API', () => {
    expect(formatMatchTimeForApi('7:30')).toBe('07:30');
  });
});
