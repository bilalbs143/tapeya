/**
 * Shared utilities for graphics processors and normalizeSession.
 */

/**
 * Return the first non-empty trimmed string from the argument list.
 * @param {...unknown} vals
 * @returns {string}
 */
export function coalesceTrim(...vals) {
  for (const v of vals) {
    if (v == null) continue;
    const s = String(v).trim();
    if (s !== '') return s;
  }
  return '';
}

/**
 * Coerce API / JSON numbers that may arrive as strings.
 * @param {unknown} v
 * @returns {number | null}
 */
export function toNum(v) {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * Resolve a visible tournament short label when API short code is missing.
 * @param {unknown} shortCode
 * @param {unknown} tournamentName
 */
export function resolveTournamentShortCode(shortCode, tournamentName = '') {
  const trimmed = String(shortCode ?? '').trim();
  if (trimmed) return trimmed;

  const name = String(tournamentName ?? '').trim();
  if (!name) return '';

  const words = name.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return words
      .map((word) => word[0])
      .join('')
      .slice(0, 4)
      .toUpperCase();
  }

  return name.slice(0, 3).toUpperCase();
}
