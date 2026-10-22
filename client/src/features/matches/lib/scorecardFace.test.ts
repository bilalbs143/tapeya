import { describe, expect, it } from 'vitest';

import type { ScorecardInningsWire } from '../model/scorecardSchemas';
import { formatBatterHow, toScorecardFace } from './scorecardFace';

describe('formatBatterHow', () => {
  it('returns not out for crease batters', () => {
    expect(formatBatterHow({ is_on_crease: true, dismissal_type: null })).toBe('not out');
  });

  it('formats caught with fielder and bowler', () => {
    expect(
      formatBatterHow({
        is_on_crease: false,
        dismissal_type: 'caught',
        dismissal_label: 'Caught',
        fielder_name: 'Sara Ali',
        bowler_name: 'Omar Khan',
      })
    ).toBe('c S. Ali b O. Khan');
  });

  it('formats bowled', () => {
    expect(
      formatBatterHow({
        is_on_crease: false,
        dismissal_type: 'bowled',
        dismissal_label: 'Bowled',
        bowler_name: 'Sara Ali',
      })
    ).toBe('b S. Ali');
  });
});

describe('toScorecardFace', () => {
  const innings: ScorecardInningsWire = {
    id: 1,
    innings_number: 1,
    status: 'in_progress',
    batting_team_id: 10,
    batting_team: { id: 10, name: 'City Blues' },
    total_runs: 48,
    total_wickets: 1,
    total_extras: 4,
    overs_display: '6.3',
    run_rate: 7.38,
    current_striker_id: 11,
    extras_breakdown: { wides: 2, no_balls: 1, byes: 0, leg_byes: 1, penalty_runs: 0 },
    batting_stats: [
      {
        id: 11,
        name: 'Ali Khan',
        runs: 24,
        balls: 18,
        fours: 2,
        sixes: 1,
        strike_rate: 133.3,
        is_on_crease: true,
      },
      {
        id: 12,
        name: 'Bilal Ahmed',
        runs: 12,
        balls: 10,
        fours: 1,
        sixes: 0,
        strike_rate: 120,
        dismissal_type: 'bowled',
        dismissal_label: 'Bowled',
        bowler_name: 'Sara Ali',
        is_on_crease: false,
      },
    ],
    bowling_stats: [
      {
        id: 21,
        name: 'Sara Ali',
        overs: '3.3',
        maidens: 0,
        runs: 28,
        wickets: 1,
        economy: 8,
      },
    ],
    fall_of_wickets: [{ wicket_number: 1, batsman_name: 'Bilal Ahmed', score: 18, overs: '2.4' }],
  };

  it('maps summary, not-out highlight flags, and FoW', () => {
    const face = toScorecardFace(innings, {
      homeTeamId: 10,
      homeShort: 'CB',
      activeBowlerId: 21,
    });

    expect(face.live).toBe(true);
    expect(face.runs).toBe(48);
    expect(face.wickets).toBe(1);
    expect(face.sideShort).toBe('CB');
    expect(face.extras).toBe(4);
    expect(face.extrasDetail).toBe('w 2, nb 1, lb 1');
    expect(face.crr).toBe('7.38');
    expect(face.fallOfWickets).toContain('1-18');
    expect(face.bat[0]?.onStrike).toBe(true);
    expect(face.bat[0]?.out).toBe(false);
    expect(face.bat[1]?.how).toBe('b S. Ali');
    expect(face.bowl[0]?.live).toBe(true);
    expect(face.bowl[0]?.econ).toBe('8.00');
  });

  it('marks completed innings as not live', () => {
    const face = toScorecardFace({ ...innings, status: 'completed' }, { activeBowlerId: 21 });
    expect(face.live).toBe(false);
    expect(face.bowl[0]?.live).toBe(false);
  });
});
