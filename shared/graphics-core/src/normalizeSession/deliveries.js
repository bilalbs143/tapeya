/**
 * @param {unknown} raw
 * @returns {{ displayToken: string, chipType: string, isFreeHit: boolean, runsTotal: number, overNumber: number, ballInOver: number, isLegal: boolean }[]}
 */
export function normalizeDeliveries(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((entry) => {
    const d = /** @type {Record<string, any>} */ (entry);
    return d && typeof d === 'object'
      ? {
          displayToken: d.display_token ?? d.displayToken ?? '',
          chipType: d.chip_type ?? d.chipType ?? 'single',
          isFreeHit: Boolean(d.is_free_hit ?? d.isFreeHit),
          runsTotal: d.runs_total ?? d.runsTotal ?? 0,
          overNumber: d.over_number ?? d.overNumber ?? 0,
          ballInOver: d.ball_in_over ?? d.ballInOver ?? 0,
          isLegal: Boolean(d.is_legal ?? d.isLegal ?? true),
        }
      : {
          displayToken: String(d ?? ''),
          chipType: 'single',
          isFreeHit: false,
          runsTotal: 0,
          overNumber: 0,
          ballInOver: 0,
          isLegal: true,
        };
  });
}

/** @param {unknown} raw */
export function normalizeBallSummary(raw) {
  const source = /** @type {Record<string, any>} */ (raw && typeof raw === 'object' ? raw : {});
  return {
    dots: source.dots ?? 0,
    fours: source.fours ?? 0,
    sixes: source.sixes ?? 0,
    wickets: source.wickets ?? 0,
    runs: source.runs ?? 0,
    deliveries: normalizeDeliveries(source.deliveries),
  };
}
