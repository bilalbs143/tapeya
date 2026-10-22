export const NO_BALL_PENALTY_RUNS = 1;

export type NoBallEquation = {
  penalty: number;
  extra: number;
  total: number;
  text: string;
};

export type NoBallSelection = {
  extraRuns: number;
  noBallType: string;
  noBallRunsType: string;
};

export function computeNoBallEquation(extraRuns: number): NoBallEquation {
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

/** Map no-ball dialog selection to UI ball fields for `uiBallToStoreBallPayload`. `noBallRunsType`: from_bat | bye | leg_bye */

export function noBallSelectionToUiFields(selection: NoBallSelection): {
  type: 'nb';
  noBallType: string;
  noBallRunsType: string;
  runsOffBat?: number;
  extraRuns?: number;
  byeOnNoBall?: boolean;
  legByeOnNoBall?: boolean;
} {
  const { extraRuns, noBallType, noBallRunsType } = selection;
  const base = { type: 'nb' as const, noBallType, noBallRunsType };

  if (noBallRunsType === 'bye') {
    return { ...base, extraRuns, byeOnNoBall: true };
  }
  if (noBallRunsType === 'leg_bye') {
    return { ...base, extraRuns, legByeOnNoBall: true };
  }

  return { ...base, runsOffBat: extraRuns };
}
