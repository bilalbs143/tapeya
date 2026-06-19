/**
 * Theme-agnostic cricket player/bowling helpers shared by processors and adapters.
 */

/**
 * Parse bowling figures string like "2/35" into wickets and runs.
 *
 * @param {string|null|undefined} figures
 * @returns {{ wickets: number|null, runs: number|null }}
 */
export function parseBowlingFigures(figures) {
  const m = String(figures ?? '').match(/^(\d+)\s*\/\s*(\d+)/);
  if (!m) return { wickets: null, runs: null };
  return { wickets: Number(m[1]), runs: Number(m[2]) };
}
