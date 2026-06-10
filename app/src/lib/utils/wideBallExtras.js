/** Mandatory wide penalty run. */
export const WIDE_PENALTY_RUNS = 1;

/**
 * Live equation text for the wide-ball dialog.
 *
 * @param {number} extraRuns Selected WB+N value (0–6)
 * @returns {{ penalty: number, extra: number, total: number, text: string }}
 */
export function computeWideBallEquation(extraRuns) {
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

/**
 * @param {number} extraRuns 0–6 (WB+N)
 * @returns {{ type: 'wd', extraRuns: number }}
 */
export function wideBallSelectionToUiFields(extraRuns) {
  return { type: 'wd', extraRuns };
}
