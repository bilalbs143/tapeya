export const WIDE_PENALTY_RUNS = 1;

export type WideBallEquation = {
  penalty: number;
  extra: number;
  total: number;
  text: string;
};

export function computeWideBallEquation(extraRuns: number): WideBallEquation {
  const extra = Math.max(0, Number(extraRuns) || 0);
  const penalty = WIDE_PENALTY_RUNS;
  const total = penalty + extra;

  return {
    penalty,
    extra,
    total,
    text: `${penalty} Wide Runs + ${extra} Runs Extra = ${total} Total Run${total === 1 ? '' : 's'}`,
  };
}

/** Map wide selection → UiBall fields for `uiBallToStoreBallPayload`. */

export function wideBallSelectionToUiFields(extraRuns: number): {
  type: 'wd';
  extraRuns: number;
} {
  return { type: 'wd', extraRuns: Math.max(0, Number(extraRuns) || 0) };
}
