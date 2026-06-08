/**
 * Helpers for Replace Batting Stats action menu flow.
 */

/**
 * Innings row where the team batted (prefers in-progress, else latest).
 *
 * @param {object[]} allInnings
 * @param {string|number} teamId
 * @returns {object|null}
 */
export function battingInningsForTeam(allInnings, teamId) {
  if (teamId == null || !Array.isArray(allInnings)) return null;
  const tid = Number(teamId);
  const matches = allInnings.filter((inn) => Number(inn.batting_team_id) === tid);
  if (matches.length === 0) return null;
  return matches.find((inn) => inn.status === 'in_progress') ?? matches[matches.length - 1];
}

/**
 * @param {object|null} innings
 * @param {object|null} activeInningsState match_state.active_innings
 * @returns {Set<string>}
 */
export function activeCreaseIdsForInnings(innings, activeInningsState) {
  const ids = new Set();
  if (!innings || !activeInningsState) return ids;
  if (Number(activeInningsState.innings_id) !== Number(innings.id)) return ids;
  if (activeInningsState.striker?.id != null) ids.add(String(activeInningsState.striker.id));
  if (activeInningsState.non_striker?.id != null) ids.add(String(activeInningsState.non_striker.id));
  return ids;
}

/**
 * Parse overs input (e.g. "2.0", "3.4") to legal balls for API.
 *
 * @param {string} oversDisplay
 * @returns {number|null}
 */
export function parseOversInputToLegalBalls(oversDisplay) {
  const trimmed = String(oversDisplay ?? '').trim();
  if (!trimmed) return null;
  const parts = trimmed.split('.');
  const whole = Number.parseInt(parts[0], 10);
  const partial = parts.length > 1 ? Number.parseInt(parts[1], 10) : 0;
  if (!Number.isFinite(whole) || whole < 0) return null;
  if (!Number.isFinite(partial) || partial < 0 || partial > 5) return null;
  return whole * 6 + partial;
}

/**
 * @param {object|null} innings scorecard innings row
 * @returns {string}
 */
export function bowlingTeamLabel(innings) {
  return innings?.bowling_team?.name ?? innings?.bowlingTeam?.name ?? 'Bowling team';
}
