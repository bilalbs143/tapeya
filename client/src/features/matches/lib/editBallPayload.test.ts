import { describe, expect, it } from 'vitest';

import {
  buildUpdateBallPayload,
  type EditableBallSnapshot,
  getBallEditableExtra,
  getBallEditableRunsValue,
} from './editBallPayload';

describe('getBallEditableRunsValue', () => {
  it('returns off-bat runs for legal deliveries', () => {
    const ball: EditableBallSnapshot = {
      kind: 'runs',
      runsOffBat: 4,
      runs: 4,
      penaltyRuns: 0,
      additionalRuns: 0,
    };
    expect(getBallEditableRunsValue(ball)).toBe(4);
  });

  it('strips the wide penalty from the editable value', () => {
    const ball: EditableBallSnapshot = {
      kind: 'wd',
      runsOffBat: 0,
      runs: 3,
      penaltyRuns: 0,
      additionalRuns: 0,
    };
    expect(getBallEditableRunsValue(ball)).toBe(2);
  });
});

describe('buildUpdateBallPayload', () => {
  const runsBall: EditableBallSnapshot = {
    kind: 'runs',
    runsOffBat: 1,
    runs: 1,
    penaltyRuns: 0,
    additionalRuns: 0,
  };

  it('maps NONE to runs_off_bat and clears extras', () => {
    expect(buildUpdateBallPayload(runsBall, { runs: 4, extra: null, zone: 'cover' })).toEqual({
      is_wide: false,
      is_no_ball: false,
      is_bye: false,
      is_leg_bye: false,
      shot_position: 'cover',
      runs_off_bat: 4,
      extra_runs: 0,
    });
  });

  it('maps wide extras as is_wide + extra_runs', () => {
    expect(buildUpdateBallPayload(runsBall, { runs: 2, extra: 'wd', zone: null })).toEqual({
      is_wide: true,
      is_no_ball: false,
      is_bye: false,
      is_leg_bye: false,
      shot_position: null,
      runs_off_bat: 0,
      extra_runs: 2,
    });
  });

  it('maps no-ball as is_no_ball + runs_off_bat', () => {
    expect(buildUpdateBallPayload(runsBall, { runs: 1, extra: 'nb', zone: null })).toEqual({
      is_wide: false,
      is_no_ball: true,
      is_bye: false,
      is_leg_bye: false,
      shot_position: null,
      runs_off_bat: 1,
      extra_runs: 0,
    });
  });

  it('keeps penalty type-locked', () => {
    const penalty: EditableBallSnapshot = {
      kind: 'penalty',
      runsOffBat: 0,
      runs: 0,
      penaltyRuns: 5,
      additionalRuns: 0,
    };
    expect(buildUpdateBallPayload(penalty, { runs: 7, extra: null, zone: null })).toEqual({
      penalty_runs: 7,
      shot_position: null,
    });
  });

  it('refuses wicket edits', () => {
    const wicket: EditableBallSnapshot = {
      kind: 'wicket',
      runsOffBat: 0,
      runs: 0,
      penaltyRuns: 0,
      additionalRuns: 0,
    };
    expect(buildUpdateBallPayload(wicket, { runs: 0, extra: null, zone: null })).toBeNull();
  });

  it('maps bye / lb extras', () => {
    expect(getBallEditableExtra('bye')).toBe('b');
    expect(getBallEditableExtra('lb')).toBe('lb');
    expect(buildUpdateBallPayload(runsBall, { runs: 2, extra: 'b', zone: null })?.is_bye).toBe(true);
    expect(buildUpdateBallPayload(runsBall, { runs: 1, extra: 'lb', zone: null })?.is_leg_bye).toBe(true);
  });
});
