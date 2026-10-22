import { describe, expect, it } from 'vitest';

import { dismissalNeedsFielder, uiBallToStoreBallPayload } from './storeBallPayload';

const crease = { strikerId: 11, nonStrikerId: 12, bowlerId: 21 };

describe('uiBallToStoreBallPayload', () => {
  it('maps a legal delivery to runs off the bat', () => {
    expect(
      uiBallToStoreBallPayload({
        ball: { type: 'runs', runs: 4, strikerId: crease.strikerId, bowlerId: crease.bowlerId },
        nonStrikerId: crease.nonStrikerId,
      })
    ).toMatchObject({
      striker_id: 11,
      non_striker_id: 12,
      bowler_id: 21,
      runs_off_bat: 4,
      extra_runs: 0,
      is_wide: false,
      is_no_ball: false,
      is_bye: false,
      is_wicket: false,
    });
  });

  it('sends a plain wide as zero extra runs on top of the penalty', () => {
    expect(
      uiBallToStoreBallPayload({
        ball: { type: 'wd', extraRuns: 0, strikerId: 11, bowlerId: 21 },
        nonStrikerId: 12,
      })
    ).toMatchObject({ is_wide: true, extra_runs: 0, runs_off_bat: 0, is_wicket: false });
  });

  it('sends bye runs as extras, not off the bat', () => {
    expect(
      uiBallToStoreBallPayload({
        ball: { type: 'bye', runs: 2, strikerId: 11, bowlerId: 21 },
        nonStrikerId: 12,
      })
    ).toMatchObject({ is_bye: true, extra_runs: 2, runs_off_bat: 0 });
  });

  it('sends a no-ball with bat runs separate from the penalty', () => {
    expect(
      uiBallToStoreBallPayload({
        ball: { type: 'nb', runsOffBat: 2, strikerId: 11, bowlerId: 21 },
        nonStrikerId: 12,
      })
    ).toMatchObject({ is_no_ball: true, runs_off_bat: 2, extra_runs: 0 });
  });

  it('marks bowled as a wicket of the striker with no fielder', () => {
    expect(
      uiBallToStoreBallPayload({
        ball: {
          type: 'out',
          dismissalType: 'bowled',
          strikerId: 11,
          bowlerId: 21,
          outPlayerId: 11,
        },
        nonStrikerId: 12,
      })
    ).toMatchObject({
      is_wicket: true,
      dismissal_type: 'bowled',
      out_player_id: 11,
      fielder_id: null,
      runs_off_bat: 0,
    });
  });

  it('requires a fielder id for a catch', () => {
    expect(
      uiBallToStoreBallPayload({
        ball: {
          type: 'out',
          dismissalType: 'caught',
          strikerId: 11,
          bowlerId: 21,
          outPlayerId: 11,
        },
        nonStrikerId: 12,
        fielderId: 22,
      })
    ).toMatchObject({ dismissal_type: 'caught', fielder_id: 22, out_player_id: 11 });
  });

  it('refuses a wicket when the dismissed batter is unknown', () => {
    expect(() =>
      uiBallToStoreBallPayload({
        ball: { type: 'out', dismissalType: 'bowled', bowlerId: 21 },
        nonStrikerId: 12,
      })
    ).toThrow(/dismissed batter/);
  });

  it('maps shotDirection to shot_position', () => {
    expect(
      uiBallToStoreBallPayload({
        ball: { type: 'runs', runs: 4, shotDirection: 'deep_cover', strikerId: 11, bowlerId: 21 },
        nonStrikerId: 12,
      })
    ).toMatchObject({ runs_off_bat: 4, shot_position: 'deep_cover' });
  });
});

describe('dismissalNeedsFielder', () => {
  it('matches the API fielder rule', () => {
    expect(dismissalNeedsFielder('caught')).toBe(true);
    expect(dismissalNeedsFielder('run_out')).toBe(true);
    expect(dismissalNeedsFielder('bowled')).toBe(false);
    expect(dismissalNeedsFielder('lbw')).toBe(false);
  });
});
