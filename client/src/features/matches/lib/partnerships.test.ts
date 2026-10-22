import { describe, expect, it } from 'vitest';

import type { ScorecardInningsWire } from '../model/scorecardSchemas';
import { toPartnershipInnings, toPartnershipStands } from './partnerships';

describe('toPartnershipStands', () => {
  it('marks null wicket_number as the open stand', () => {
    const stands = toPartnershipStands(
      [
        {
          player_1_id: 1,
          player_2_id: 2,
          player_1_runs: 10,
          player_1_balls: 8,
          player_2_runs: 5,
          player_2_balls: 6,
          runs: 15,
          balls: 14,
          wicket_number: 1,
        },
        {
          player_1_id: 2,
          player_2_id: 3,
          player_1_runs: 4,
          player_1_balls: 3,
          player_2_runs: 2,
          player_2_balls: 2,
          runs: 6,
          balls: 5,
          wicket_number: null,
        },
      ],
      [
        { id: 1, name: 'Ali' },
        { id: 2, name: 'Bilal' },
        { id: 3, name: 'Cam' },
      ],
      {},
      2
    );

    expect(stands).toHaveLength(2);
    expect(stands[0]?.complete).toBe(true);
    expect(stands[0]?.wicketNo).toBe(1);
    expect(stands[1]?.complete).toBe(false);
    expect(stands[1]?.batters[0]?.onStrike).toBe(true);
  });
});

describe('toPartnershipInnings', () => {
  it('builds innings chips from scorecard', () => {
    const innings: ScorecardInningsWire[] = [
      {
        id: 1,
        innings_number: 1,
        status: 'in_progress',
        batting_team_id: 10,
        batting_team: { id: 10, name: 'City Blues' },
        partnerships: [
          {
            player_1_id: 11,
            player_2_id: 12,
            runs: 20,
            balls: 15,
            player_1_runs: 12,
            player_1_balls: 8,
            player_2_runs: 8,
            player_2_balls: 7,
            wicket_number: null,
          },
        ],
        batting_stats: [
          { id: 11, name: 'Ali Khan' },
          { id: 12, name: 'Sara Ali' },
        ],
      },
    ];

    const [inn] = toPartnershipInnings(innings, {
      homeTeamId: 10,
      homeShort: 'CB',
    });
    expect(inn?.sideShort).toBe('CB');
    expect(inn?.ordinal).toBe('1st');
    expect(inn?.stands[0]?.complete).toBe(false);
    expect(inn?.stands[0]?.batters[0]?.name).toBe('Ali Khan');
  });
});
