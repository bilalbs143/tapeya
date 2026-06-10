import { buildMatchCtx, coalesceTrim } from './graphicPropsHelpers';

/** @type {Record<string, { contextKey: string, title: string, metric: 'batting'|'bowling' }>} */
const LEADERBOARD_COMMANDS = {
  HIGHEST_RUNS: {
    contextKey: 'graphic_leaderboard_runs',
    title: 'Highest Runs',
    metric: 'batting',
  },
  TOP_BATTER: {
    contextKey: 'graphic_leaderboard_runs',
    title: 'Top Batter',
    metric: 'batting',
  },
  HIGHEST_FOURS: {
    contextKey: 'graphic_leaderboard_fours',
    title: 'Highest Fours',
    metric: 'batting',
  },
  HIGHEST_SIXES: {
    contextKey: 'graphic_leaderboard_sixes',
    title: 'Highest Sixes',
    metric: 'batting',
  },
  HIGHEST_WICKETS: {
    contextKey: 'graphic_leaderboard_wickets',
    title: 'Highest Wickets',
    metric: 'bowling',
  },
  TOP_BOWLER: {
    contextKey: 'graphic_leaderboard_wickets',
    title: 'Top Bowler',
    metric: 'bowling',
  },
};

function leaderboardRowsFromContext(commandKey, ctx, payloadRows) {
  if (Array.isArray(payloadRows) && payloadRows.length > 0) {
    return payloadRows;
  }
  const meta = LEADERBOARD_COMMANDS[commandKey];
  if (!meta) return [];
  const raw = ctx[meta.contextKey];
  return Array.isArray(raw) ? raw : [];
}

function featuredFromLeaderboardRow(metric, row, explicitFeatured) {
  if (explicitFeatured != null && typeof explicitFeatured === 'object') {
    return explicitFeatured;
  }
  if (!row || typeof row !== 'object') return null;
  const name = row.name;
  if (name == null || String(name).trim() === '') return null;
  const v = metric === 'bowling' ? (row.wickets ?? row.value) : (row.runs ?? row.value);
  return {
    name: String(name),
    value: String(v ?? ''),
    image_url: row.image_url ?? null,
  };
}

function buildLeaderboardPayload(commandKey, ctx, p) {
  const meta = LEADERBOARD_COMMANDS[commandKey];
  if (!meta) return {};
  const mc = buildMatchCtx(ctx);
  const rows = leaderboardRowsFromContext(commandKey, ctx, p.rows);
  return {
    title: p.title ?? meta.title,
    subtitle: coalesceTrim(p.subtitle, mc.tournamentName) || 'Tournament',
    rows,
    featured: featuredFromLeaderboardRow(meta.metric, rows[0], p.featured),
    tournamentLogoUrl: p.tournament_logo_url ?? mc.tournamentLogoUrl,
  };
}

/**
 * @param {string|null} commandKey
 * @param {Record<string, unknown>} ctx
 * @param {Record<string, unknown>} p
 * @returns {Record<string, unknown>|undefined}
 */
export function buildLeaderboardProps(commandKey, ctx, p) {
  switch (commandKey) {
    case 'HIGHEST_RUNS':
    case 'HIGHEST_SIXES':
    case 'HIGHEST_FOURS':
    case 'TOP_BATTER':
    case 'HIGHEST_WICKETS':
    case 'TOP_BOWLER':
      return buildLeaderboardPayload(commandKey, ctx, p);

    default:
      return undefined;
  }
}
