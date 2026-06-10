import { buildMatchCtx } from './graphicPropsHelpers';

const BREAK_LABELS = {
  DRINKS: 'Drinks',
  TEA_BREAK: 'Tea Break',
  LUNCH_BREAK: 'Lunch Break',
  RAIN: 'Rain Delay',
  RAIN_STOPPED: 'Rain Stopped',
  STRATEGIC_TIMEOUT: 'Strategic Timeout',
};

/**
 * Innings break + scheduled / weather breaks.
 *
 * @param {string|null} commandKey
 * @param {Record<string, unknown>} ctx
 * @param {Record<string, unknown>} p
 * @returns {Record<string, unknown>|undefined}
 */
export function buildBreakGraphicProps(commandKey, ctx, _p) {
  switch (commandKey) {
    case 'INNINGS_BREAK': {
      const mc = buildMatchCtx(ctx);
      return { homeTeam: mc.homeTeam, awayTeam: mc.awayTeam };
    }

    case 'DRINKS':
    case 'TEA_BREAK':
    case 'LUNCH_BREAK':
    case 'RAIN':
    case 'RAIN_STOPPED':
    case 'STRATEGIC_TIMEOUT': {
      const mc = buildMatchCtx(ctx);
      return {
        homeTeam: mc.homeTeam,
        awayTeam: mc.awayTeam,
        label: BREAK_LABELS[commandKey] ?? 'Break',
      };
    }

    default:
      return undefined;
  }
}
