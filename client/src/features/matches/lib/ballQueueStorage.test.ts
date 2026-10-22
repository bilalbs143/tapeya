import { afterEach, describe, expect, it } from 'vitest';

import { clearQueuedBalls, enqueueBall, listQueuedBalls, removeQueuedBall } from './ballQueueStorage';
import type { StoreBallPayload } from './storeBallPayload';

const payload = {
  striker_id: 1,
  non_striker_id: 2,
  bowler_id: 3,
  runs_off_bat: 1,
  extra_runs: 0,
  is_no_ball: false,
  no_ball_type: null,
  no_ball_runs_type: null,
  overthrow_delivery_type: null,
  is_wide: false,
  is_leg_bye: false,
  is_bye: false,
  penalty_runs: 0,
  is_wicket: false,
  dismissal_type: null,
  out_player_id: null,
  fielder_id: null,
  runout_extra_runs: null,
  runout_run_type: null,
  batter_crossed: null,
  dont_count_ball: null,
  dismissal_delivery_type: null,
  shot_position: null,
} satisfies StoreBallPayload;

afterEach(() => {
  clearQueuedBalls(42);
  clearQueuedBalls(7);
});

describe('ballQueueStorage', () => {
  it('enqueues and lists per match', () => {
    enqueueBall({ matchId: 42, inningsId: 9, payload });
    enqueueBall({ matchId: 42, inningsId: 9, payload: { ...payload, runs_off_bat: 4 } });
    enqueueBall({ matchId: 7, inningsId: 1, payload });

    expect(listQueuedBalls(42)).toHaveLength(2);
    expect(listQueuedBalls(7)).toHaveLength(1);
    expect(listQueuedBalls(42)[1]?.payload.runs_off_bat).toBe(4);
  });

  it('removes one ball and clears a match', () => {
    const a = enqueueBall({ matchId: 42, inningsId: 9, payload });
    enqueueBall({ matchId: 42, inningsId: 9, payload });
    removeQueuedBall(42, a.id);
    expect(listQueuedBalls(42)).toHaveLength(1);
    clearQueuedBalls(42);
    expect(listQueuedBalls(42)).toHaveLength(0);
  });
});
