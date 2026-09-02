import { describe, expect, it } from 'vitest';

import { battingTeamsFromScorecard, buildFanMatchDetails, oversDetailsFromScorecard } from '@/lib/utils/scorecardUtils';

const apiMatch = {
  home_team_id: 1,
  away_team_id: 2,
  home_team: { name: 'Karachi Kings' },
  away_team: { name: 'Lahore Qalandars' },
  result_summary: 'Karachi Kings won by 5 runs',
  winning_team: { name: 'Karachi Kings' },
};

const scorecard = {
  innings: [
    {
      batting_team_id: 1,
      batting_stats: [{ name: 'Babar Azam', runs: 58, balls: 3, fours: 1, sixes: 1, strike_rate: 1933.3, is_on_crease: true }],
      balls_count: 6,
      total_runs: 17,
      total_wickets: 1,
      overs_display: '1.0',
      run_rate: '17.00',
      extras_breakdown: { wides: 1 },
      total_extras: 1,
      balls: [{ over: 0, runs: 4, is_wicket: false }],
    },
    {
      batting_team_id: 2,
      batting_stats: [{ name: 'Fakhar Zaman', runs: 12, balls: 1, fours: 0, sixes: 0, strike_rate: 1200, is_on_crease: true }],
      balls_count: 1,
      total_runs: 12,
      total_wickets: 0,
      overs_display: '0.1',
      run_rate: '72.00',
      extras_breakdown: {},
      total_extras: 0,
      balls: [{ over: 0, runs: 12, is_wicket: false }],
    },
  ],
};

describe('scorecardUtils fan mapping', () => {
  it('maps scorecard innings to teams for the Scorecard tab', () => {
    const teams = battingTeamsFromScorecard(scorecard, apiMatch);
    expect(teams).toHaveLength(2);
    expect(teams[0].name).toBe('Karachi Kings');
    expect(teams[0].batting[0].name).toBe('Babar Azam');
    expect(teams[1].name).toBe('Lahore Qalandars');
  });

  it('builds overs rows by home/away batting innings', () => {
    const overs = oversDetailsFromScorecard(scorecard, 1, 2);
    expect(overs).toHaveLength(1);
    expect(overs[0].over).toBe(0);
    expect(overs[0].team1.runs).toBe(4);
    expect(overs[0].team2.runs).toBe(12);
  });

  it('builds fan match details from match + scorecard APIs', () => {
    const details = buildFanMatchDetails(apiMatch, scorecard, null);
    expect(details?.teams).toHaveLength(2);
    expect(details?.overs).toHaveLength(1);
    expect(details?.resultText).toContain('Karachi Kings');
  });
});
