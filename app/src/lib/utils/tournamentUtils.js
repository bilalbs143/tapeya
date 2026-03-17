/**
 * Parse :tournamentId from URL (or fallback) into a valid positive integer, or null.
 *
 * @param {string | number | null | undefined} paramStr - Raw param (e.g. useParams().tournamentId)
 * @param {number | null | undefined} [fallbackId] - Optional fallback when paramStr is empty
 * @returns {number | null} Valid tournament ID or null
 */
export function parseTournamentId(paramStr, fallbackId) {
  const num =
    paramStr != null && paramStr !== '' ? Number(paramStr) : fallbackId;
  return Number.isInteger(num) && num > 0 ? num : null;
}

/**
 * Whether the value is a valid tournament ID for API/tabs (non-empty, not a placeholder route).
 *
 * @param {string | number | null | undefined} id - Tournament ID or param
 * @returns {boolean}
 */
export function isValidTournamentId(id) {
  return (
    id != null &&
    String(id).trim() !== '' &&
    !String(id).startsWith('placeholder-')
  );
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
 * Tournament cover/display image URL with fallback.
 *
 * @param {object | null | undefined} tournament
 * @param {string} [fallback] - Default image URL when tournament has no cover
 * @returns {string}
 */
export function getTournamentImage(tournament, fallback = '') {
  return tournament?.cover_image ?? tournament?.display_image ?? fallback;
}
