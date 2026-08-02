import { describe, expect, it } from 'vitest';

import {
  applyMatchStateToLiveScoreRow,
  formatAnnotatedScore,
  normaliseLiveScoreRow,
  normaliseLiveScores,
} from '@/lib/utils/liveScoreUtils';

const sampleRow = {
  id: 12,
  tournament_id: 3,
  status: 'in_progress',
  match_label: 'WPL',
  overs_limit: 50,
  home_team: { id: 1, name: 'Karachi Kids', logo: null },
  away_team: { id: 2, name: 'Rawalpindi Royals', logo: null },
  tournament: { id: 3, name: 'Women Premier League', short_name: 'WPL' },
  innings: [
    {
      innings_number: 1,
      innings_status: 'completed',
      batting_team_id: 1,
      total_runs: 234,
      total_wickets: 7,
      legal_balls: 300,
      overs_display: '50.0',
    },
    {
      innings_number: 2,
      innings_status: 'in_progress',
      batting_team_id: 2,
      total_runs: 27,
      total_wickets: 1,
      legal_balls: 28,
      overs_display: '4.4',
      target: 235,
      runs_to_win: 208,
      balls_remaining: 272,
    },
  ],
  active_innings: {
    innings_number: 2,
    innings_status: 'in_progress',
    batting_team_id: 2,
    total_runs: 27,
    total_wickets: 1,
    legal_balls: 28,
    overs_display: '4.4',
    current_run_rate: '5.79',
    target: 235,
    runs_to_win: 208,
    balls_remaining: 272,
  },
  commentary: 'Rawalpindi Royals need 208 runs from 272 balls.',
};

describe('liveScoreUtils', () => {
  it('formats annotated batting scores with overs and target', () => {
    expect(
      formatAnnotatedScore({
        total_runs: 27,
        total_wickets: 1,
        overs_display: '4.4',
        target: 235,
        annotate: true,
        overs_limit: 50,
      }),
    ).toBe('27/1 (4.4/50 OV, T:235)');
  });

  it('maps API rows into MatchCard shape with chase commentary', () => {
    const match = normaliseLiveScoreRow(sampleRow);
    expect(match.status).toBe('live');
    expect(match.matchId).toBe('WPL');
    expect(match.score1).toBe('234/7');
    expect(match.score2).toBe('27/1 (4.4/50 OV, T:235)');
    expect(match.meta.commentary).toBe('Rawalpindi Royals need 208 runs from 272 balls.');
    expect(match.team1.name).toBe('Karachi Kids');
    expect(normaliseLiveScores([sampleRow])).toHaveLength(1);
  });

  it('annotates first-innings home batting score', () => {
    const firstInnings = {
      ...sampleRow,
      innings: [
        {
          innings_number: 1,
          innings_status: 'in_progress',
          batting_team_id: 1,
          total_runs: 40,
          total_wickets: 0,
          legal_balls: 24,
          overs_display: '4.0',
          current_run_rate: '10.00',
        },
      ],
      active_innings: {
        innings_number: 1,
        innings_status: 'in_progress',
        batting_team_id: 1,
        total_runs: 40,
        total_wickets: 0,
        legal_balls: 24,
        overs_display: '4.0',
        current_run_rate: '10.00',
      },
      commentary: null,
    };

    const match = normaliseLiveScoreRow(firstInnings);
    expect(match.score1).toBe('40/0 (4.0/50 OV)');
    expect(match.score2).toBeNull();
    expect(match.meta.commentary).toBe('Current run rate: 10.00.');
  });

  it('patches live totals from match.state.updated payloads', () => {
    const updated = applyMatchStateToLiveScoreRow(sampleRow, {
      match_status: 'in_progress',
      match_complete: false,
      active_innings: {
        innings_number: 2,
        innings_status: 'in_progress',
        batting_team_id: 2,
        total_runs: 35,
        total_wickets: 1,
        legal_balls: 30,
        overs_display: '5.0',
        target: 235,
        runs_to_win: 200,
        balls_remaining: 270,
      },
    });

    expect(updated.active_innings.total_runs).toBe(35);
    expect(updated.active_innings.overs_display).toBe('5.0');
    expect(updated.commentary).toBe('Rawalpindi Royals need 200 runs from 45 overs.');
  });

  it('removes completed matches from the feed', () => {
    expect(
      applyMatchStateToLiveScoreRow(sampleRow, {
        match_status: 'completed',
        match_complete: true,
        active_innings: sampleRow.active_innings,
      }),
    ).toBeNull();
  });
});
