/**
 * Parse :tournamentId from URL (or fallback) into a valid positive integer, or null.
 *
 * @param {string | number | null | undefined} paramStr - Raw param (e.g. useParams().tournamentId)
 * @param {number | null | undefined} [fallbackId] - Optional fallback when paramStr is empty
 * @returns {number | null} Valid tournament ID or null
 */
export function parseTournamentId(paramStr, fallbackId) {
  const num = paramStr != null && paramStr !== '' ? Number(paramStr) : fallbackId;
  return Number.isInteger(num) && num > 0 ? num : null;
}

/**
 * Whether the value is a valid tournament ID for API/tabs (non-empty, not a placeholder route).
 *
 * @param {string | number | null | undefined} id - Tournament ID or param
 * @returns {boolean}
 */
export function isValidTournamentId(id) {
  return id != null && String(id).trim() !== '' && !String(id).startsWith('placeholder-');
}

/**
 * Display title for a tournament (tournament_name or name).
 *
 * @param {object | null | undefined} tournament
 * @param {string} [fallback='Tournament']
 * @returns {string}
 */
export function getTournamentTitle(tournament, fallback = 'Tournament') {
  return tournament?.tournament_name ?? tournament?.name ?? fallback;
}

/**
 * Listing-card image — backoffice "Display Image" (800×600), with cover as fallback.
 *
 * @param {object | null | undefined} tournament
 * @param {string} [fallback]
 * @returns {string}
 */
export function getTournamentDisplayImage(tournament, fallback = '') {
  return tournament?.display_image ?? tournament?.cover_image ?? fallback;
}

/**
 * Detail-page banner — backoffice "Cover Image" (1920×600), with display as fallback.
 *
 * @param {object | null | undefined} tournament
 * @param {string} [fallback]
 * @returns {string}
 */
export function getTournamentCoverImage(tournament, fallback = '') {
  return tournament?.cover_image ?? tournament?.display_image ?? fallback;
}

/** @alias getTournamentCoverImage */
export function getTournamentImage(tournament, fallback = '') {
  return getTournamentCoverImage(tournament, fallback);
}

/**
 * Configured team capacity for a tournament (from request / backoffice), or null if unknown.
 *
 * @param {object | null | undefined} tournament
 * @returns {number | null}
 */
export function getTournamentTeamLimit(tournament) {
  const limit = tournament?.number_of_teams;
  return limit != null && limit > 0 ? limit : null;
}

/**
 * Whether the tournament already has the required number of teams attached.
 *
 * @param {object | null | undefined} tournament
 * @param {number} currentCount
 * @returns {boolean}
 */
export function areTournamentTeamsComplete(tournament, currentCount) {
  const limit = getTournamentTeamLimit(tournament);
  if (limit == null) return false;
  return currentCount >= limit;
}

/**
 * Whether another team can still be added to the tournament.
 *
 * @param {object | null | undefined} tournament
 * @param {number} currentCount
 * @returns {boolean}
 */
export function canAddTournamentTeams(tournament, currentCount) {
  const limit = getTournamentTeamLimit(tournament);
  if (limit == null) return true;
  return currentCount < limit;
}
