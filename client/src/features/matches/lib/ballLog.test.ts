import { describe, expect, it } from 'vitest';

import type { ScorecardInningsWire } from '../model/scorecardSchemas';
import { scorecardToBallLog } from './ballLog';

const innings: ScorecardInningsWire = {
  id: 10,
  innings_number: 1,
  status: 'in_progress',
  batting_team: { id: 1, name: 'City Blues' },
  batting_stats: [{ id: 11, name: 'Ali Khan' }],
  bowling_stats: [{ id: 21, name: 'Sara Ali' }],
  balls: [
    {
      id: 100,
      over: 0,
      ball_in_over: 1,
      striker_id: 11,
      bowler_id: 21,
      runs: 4,
      runs_off_bat: 4,
      is_wide: false,
      is_no_ball: false,
      is_bye: false,
      is_leg_bye: false,
      is_wicket: false,
      penalty_runs: 0,
      additional_runs: 0,
      shot_position: 'cover',
      presentation: { display_token: '4', chip_type: 'boundary_four', label: '4', runs_total: 4 },
    },
    {
      id: 101,
      over: 0,
      ball_in_over: 2,
      striker_id: 11,
      bowler_id: 21,
      runs: 1,
      runs_off_bat: 0,
      is_wide: true,
      is_no_ball: false,
      is_bye: false,
      is_leg_bye: false,
      is_wicket: false,
      penalty_runs: 0,
      additional_runs: 0,
      shot_position: null,
      presentation: { display_token: 'WD', chip_type: 'wide', label: 'WD', runs_total: 1 },
    },
    {
      id: 102,
      over: 0,
      ball_in_over: 3,
      striker_id: 11,
      bowler_id: 21,
      runs: 0,
      runs_off_bat: 0,
      is_wide: false,
      is_no_ball: false,
      is_bye: false,
      is_leg_bye: false,
      is_wicket: true,
      dismissal_type: 'bowled',
      dismissal_type_label: 'Bowled',
      penalty_runs: 0,
      additional_runs: 0,
      presentation: { display_token: 'W', chip_type: 'wicket', label: 'W', runs_total: 0 },
    },
  ],
};

describe('scorecardToBallLog', () => {
  it('groups balls into overs and marks wickets non-editable', () => {
    const [inn] = scorecardToBallLog([innings]);
    expect(inn?.canEdit).toBe(true);
    expect(inn?.overs).toHaveLength(1);
    expect(inn?.overs[0]?.n).toBe(1);
    expect(inn?.overs[0]?.entries).toHaveLength(3);

    const four = inn?.overs[0]?.entries[0];
    expect(four?.editable).toBe(true);
    expect(four?.kind).toBe('runs');
    expect(four?.runs).toBe(4);
    expect(four?.extra).toBeNull();
    expect(four?.zone).toBe('cover');

    const wide = inn?.overs[0]?.entries[1];
    expect(wide?.kind).toBe('wd');
    expect(wide?.extra).toBe('wd');
    expect(wide?.runs).toBe(0);

    const wicket = inn?.overs[0]?.entries[2];
    expect(wicket?.kind).toBe('wicket');
    expect(wicket?.editable).toBe(false);
    expect(wicket?.label).toBe('Bowled');
  });

  it('closes edit when innings is completed', () => {
    const [inn] = scorecardToBallLog([{ ...innings, status: 'completed' }]);
    expect(inn?.canEdit).toBe(false);
  });

  it('closes edit when the match is complete', () => {
    const [inn] = scorecardToBallLog([innings], {}, { matchComplete: true });
    expect(inn?.canEdit).toBe(false);
  });
});
