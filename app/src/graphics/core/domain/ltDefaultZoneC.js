/** Panel keys for Default LT Zone C — must match {@link DefaultZoneCPanel} switch cases. */
export const LT_DEFAULT_ZONE_C_PANELS = /** @type {const} */ (['crr', 'rrr', 'projectedScore', 'partnership', 'needTarget']);

/** @typedef {(typeof LT_DEFAULT_ZONE_C_PANELS)[number]} LtDefaultZoneCPanel */

/** @typedef {{ firstInnings: LtDefaultZoneCPanel[], secondInnings: LtDefaultZoneCPanel[] }} LtDefaultZoneCConfig */

/**
 * @param {LtDefaultZoneCPanel} panel
 * @param {{
 *   inningsNumber?: number,
 *   currentRR?: string,
 *   requiredRR?: string|null,
 *   projectedScore?: number|null,
 *   partnershipRuns?: number|null,
 *   runsToWin?: number|null,
 * }} ctx
 */
export function isLtDefaultZoneCPanelEligible(panel, ctx) {
  switch (panel) {
    case 'crr':
      return Boolean(String(ctx.currentRR ?? '').trim());
    case 'rrr':
      return Boolean(String(ctx.requiredRR ?? '').trim());
    case 'projectedScore':
      return ctx.inningsNumber === 1 && ctx.projectedScore != null;
    case 'partnership':
      return Number(ctx.partnershipRuns ?? 0) > 0;
    case 'needTarget':
      return ctx.inningsNumber === 2 && Number(ctx.runsToWin ?? 0) > 0;
    default:
      return false;
  }
}

/**
 * @param {number} inningsNumber
 * @param {Parameters<typeof isLtDefaultZoneCPanelEligible>[1]} ctx
 * @param {LtDefaultZoneCConfig} config
 * @returns {LtDefaultZoneCPanel[]}
 */
export function getEligibleLtDefaultZoneCPanels(inningsNumber, ctx, config) {
  const order = inningsNumber === 2 ? config.secondInnings : config.firstInnings;
  return order.filter((panel) => isLtDefaultZoneCPanelEligible(panel, ctx));
}
