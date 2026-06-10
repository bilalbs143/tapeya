/** @typedef {'runs'|'bye'|'lb'|'wd'|'nb'|'penalty'|'additional_runs'} EditableBallType */

/** @type {Set<string>} */
const RUNS_EDITABLE_TYPES = new Set(['runs', 'bye', 'lb', 'wd', 'nb', 'penalty', 'additional_runs']);

/**
 * @param {object|null|undefined} ball UI ball from scorecard history
 */
export function isBallRunsEditable(ball) {
  return Boolean(ball?.id) && RUNS_EDITABLE_TYPES.has(ball.type);
}

/**
 * @param {object|null|undefined} ball
 */
export function isBallDeletable(ball) {
  return ball?.id != null;
}

/**
 * Primary runs value shown in the edit picker (extra runs or off-bat as appropriate).
 *
 * @param {object} ball
 */
export function getBallEditableRunsValue(ball) {
  if (!ball) return 0;
  switch (ball.type) {
    case 'runs':
      return ball.runs ?? 0;
    case 'bye':
    case 'lb':
      return ball.runs ?? 0;
    case 'wd':
      return Math.max(0, (ball.runs ?? 1) - 1);
    case 'nb':
      if (ball.noBallRunsType === 'bye' || ball.noBallRunsType === 'leg_bye') {
        return Math.max(0, (ball.runs ?? 1) - 1);
      }
      return ball.runsOffBat ?? Math.max(0, (ball.runs ?? 1) - 1);
    case 'penalty':
      return ball.penaltyRuns ?? 0;
    case 'additional_runs':
      return ball.additionalRuns ?? 0;
    default:
      return 0;
  }
}

/**
 * @param {object} ball
 */
export function editBallDialogTitle(ball) {
  if (!ball) return 'Edit Ball';
  switch (ball.type) {
    case 'runs':
      return 'Edit Runs';
    case 'wd':
      return 'Edit Wide';
    case 'nb':
      return 'Edit No Ball';
    case 'bye':
      return 'Edit Bye';
    case 'lb':
      return 'Edit Leg-Bye';
    case 'penalty':
      return 'Edit Penalty Runs';
    case 'additional_runs':
      return 'Edit Additional Runs';
    default:
      return 'Edit Ball';
  }
}

/**
 * Build PATCH body for correcting a delivery's primary runs value.
 *
 * This function is intentionally type-locked: it only edits the run count within
 * the ball's existing delivery type. Toggling `is_wide`/`is_no_ball` is NOT
 * supported — changing a delivery type would require deleting and re-scoring the ball.
 * Each case always re-asserts the original type flag (e.g. `is_wide: true`) to ensure
 * the backend normalizer receives a consistent payload.
 *
 * @param {object} ball UI ball from scorecard history
 * @param {number} newValue User-selected value from the 0–6 picker
 * @returns {object|null}
 */
export function buildBallRunsUpdatePayload(ball, newValue) {
  if (!ball) return null;
  const v = Math.max(0, Math.min(255, Number(newValue) || 0));

  switch (ball.type) {
    case 'runs':
      return { runs_off_bat: v };
    case 'bye':
      return { is_bye: true, extra_runs: v };
    case 'lb':
      return { is_leg_bye: true, extra_runs: v };
    case 'wd':
      return { is_wide: true, extra_runs: v };
    case 'nb':
      if (ball.noBallRunsType === 'bye') {
        return { is_no_ball: true, no_ball_runs_type: 'bye', extra_runs: v, runs_off_bat: 0 };
      }
      if (ball.noBallRunsType === 'leg_bye') {
        return { is_no_ball: true, no_ball_runs_type: 'leg_bye', extra_runs: v, runs_off_bat: 0 };
      }
      return {
        is_no_ball: true,
        runs_off_bat: v,
        extra_runs: 0,
        ...(ball.noBallType ? { no_ball_type: ball.noBallType } : {}),
        ...(ball.noBallRunsType ? { no_ball_runs_type: ball.noBallRunsType } : {}),
      };
    case 'penalty':
      return { penalty_runs: v };
    case 'additional_runs':
      return { additional_runs: v };
    default:
      return null;
  }
}
