/**
 * Stats Total flow config: isolates Ranking flow vs Scorecard flow.
 * Use path-based flow detection so back navigation and data source are deterministic.
 * API-ready: data layer can be swapped for API calls per flow without changing UI.
 */

export const RANKING_FLOW = 'ranking';
export const SCORECARD_FLOW = 'scorecard';

const RANKING_STATS_TOTAL_PREFIX = '/ranking/stats-total';
const SCORECARD_STATS_TOTAL_PATTERN =
  /^\/scorecard\/([^/]+)\/stats-total\/([^/]+)$/;

/** Valid stat types for both flows */
export const VALID_STAT_TYPES = [
  'fours',
  'sixes',
  'run-scorers',
  'wicket-takers',
];

/**
 * Path builders for linking to Stats Total from each flow.
 * Use these in Ranking.jsx and StatsTab.jsx so routes stay in sync.
 */
export const statsTotalPaths = {
  /** From Ranking: path only (no tournamentId). state.rankingData passed separately. */
  ranking: (statType) => `${RANKING_STATS_TOTAL_PREFIX}/${statType}`,
  /** From Scorecard/Stats tab: tournament-scoped path. */
  scorecard: (tournamentId, statType) =>
    `/scorecard/${tournamentId}/stats-total/${statType}`,
};

/**
 * Detect which flow we're in from the current pathname.
 * @param {string} pathname - location.pathname
 * @returns {{ flow: 'ranking'|'scorecard', tournamentId?: string, statType: string } | null}
 */
export function getFlowFromPath(pathname) {
  if (!pathname || typeof pathname !== 'string') return null;

  if (pathname.startsWith(RANKING_STATS_TOTAL_PREFIX)) {
    const statType = pathname
      .slice(RANKING_STATS_TOTAL_PREFIX.length + 1)
      .split('/')[0];
    return {
      flow: RANKING_FLOW,
      statType: statType || 'fours',
    };
  }

  const match = pathname.match(SCORECARD_STATS_TOTAL_PATTERN);
  if (match) {
    const [, tournamentId, statType] = match;
    return {
      flow: SCORECARD_FLOW,
      tournamentId,
      statType: statType || 'fours',
    };
  }

  return null;
}

/**
 * Back navigation target for each flow. Use this instead of navigate(-1) so flows stay isolated.
 * @param {'ranking'|'scorecard'} flow
 * @param {string} [tournamentId] - required when flow is 'scorecard'
 * @returns {string}
 */
export function getStatsTotalBackPath(flow, tournamentId) {
  if (flow === RANKING_FLOW) return '/ranking';
  if (flow === SCORECARD_FLOW && tournamentId)
    return `/scorecard/${tournamentId}`;
  return '/scorecard';
}
