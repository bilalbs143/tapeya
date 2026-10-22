import { describe, expect, it } from 'vitest';

import type { ScorecardInningsWire } from '../model/scorecardSchemas';
import { oversFromBalls, phasesFromBalls, toStatsInnings } from './statsFromScorecard';

describe('oversFromBalls', () => {
  it('groups runs by over', () => {
    const overs = oversFromBalls([
      { id: 1, over: 0, runs: 4 },
      { id: 2, over: 0, runs: 1 },
      { id: 3, over: 1, runs: 6 },
    ]);
    expect(overs).toEqual([
      { n: 1, runs: 5 },
      { n: 2, runs: 6 },
    ]);
  });
});

describe('phasesFromBalls', () => {
  it('splits overs into pp / mid / death', () => {
    const phases = phasesFromBalls(
      [
        { id: 1, over: 0, runs: 10, runs_off_bat: 10 },
        { id: 2, over: 8, runs: 12, runs_off_bat: 12 },
        { id: 3, over: 18, runs: 8, runs_off_bat: 8 },
        { id: 4, over: 1, runs: 1, is_wide: true, runs_off_bat: 0 },
      ],
      20,
      3
    );
    expect(phases.pp).toBe(10);
    expect(phases.mid).toBe(12);
    expect(phases.death).toBe(8);
    expect(phases.extras).toBe(3);
  });
});

describe('toStatsInnings', () => {
  it('builds wagon batters when shot_position is present', () => {
    const innings: ScorecardInningsWire[] = [
      {
        id: 1,
        innings_number: 1,
        status: 'in_progress',
        batting_team: { id: 10, name: 'City Blues' },
        total_extras: 2,
        batting_stats: [{ id: 11, name: 'Ali', runs: 10, balls: 8, fours: 1, sixes: 0 }],
        balls: [
          {
            id: 1,
            over: 0,
            striker_id: 11,
            runs: 4,
            runs_off_bat: 4,
            shot_position: 'deep_cover',
          },
          {
            id: 2,
            over: 0,
            striker_id: 11,
            runs: 1,
            runs_off_bat: 1,
            shot_position: 'mid_wicket',
          },
        ],
      },
    ];
    const [inn] = toStatsInnings(innings, { oversPerSide: 20, homeTeamId: 10, homeShort: 'CB' });
    expect(inn?.wagonWheel[0]?.hasShotData).toBe(true);
    expect(inn?.wagonWheel[0]?.offRuns).toBe(4);
    expect(inn?.wagonWheel[0]?.legRuns).toBe(1);
    expect(inn?.overList[0]?.runs).toBe(5);
  });
});
