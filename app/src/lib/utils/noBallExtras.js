/** Mandatory no-ball penalty run (Law 21). */
export const NO_BALL_PENALTY_RUNS = 1;

/**
 * Live equation text for the no-ball dialog.
 *
 * @param {number} extraRuns Selected NB+N value (0–6)
 * @returns {{ penalty: number, extra: number, total: number, text: string }}
 */
export function computeNoBallEquation(extraRuns) {
  const extra = Math.max(0, Number(extraRuns) || 0);
  const penalty = NO_BALL_PENALTY_RUNS;
  const total = penalty + extra;

  return {
    penalty,
    extra,
    total,
    text: `${penalty} No-Ball Runs + ${extra} Runs Extra = ${total} Total Run${total === 1 ? '' : 's'}`,
  };
}

/**
 * Map no-ball dialog selection to UI ball fields for {@link uiBallToStoreBallPayload}.
 *
 * @param {object} params
 * @param {number} params.extraRuns 0–6 (NB+N)
 * @param {string} params.noBallType
 * @param {string} params.noBallRunsType from_bat | bye | leg_bye
 */
export function noBallSelectionToUiFields({ extraRuns, noBallType, noBallRunsType }) {
  const base = { type: 'nb', noBallType, noBallRunsType };

  if (noBallRunsType === 'bye') {
    return { ...base, extraRuns, byeOnNoBall: true };
  }
  if (noBallRunsType === 'leg_bye') {
    return { ...base, extraRuns, legByeOnNoBall: true };
  }

  return { ...base, runsOffBat: extraRuns };
}
