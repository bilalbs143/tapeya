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
  const raw = String(figures ?? '').trim();
  const slashMatch = raw.match(/^(\d+)\s*\/\s*(\d+)/);
  if (slashMatch) {
    return { wickets: Number(slashMatch[1]), runs: Number(slashMatch[2]) };
  }
  const hyphenMatch = raw.match(/^(\d+)\s*-\s*(\d+)/);
  if (hyphenMatch) {
    return { wickets: Number(hyphenMatch[1]), runs: Number(hyphenMatch[2]) };
  }
  return { wickets: null, runs: null };
}

/**
 * Broadcast bowling figures — wickets-runs with hyphen (e.g. "2-35"), never slash.
 *
 * @param {string|null|undefined} rawFigures
 * @param {{ wickets?: number|null, runs?: number|null, runsConceded?: number|null, w?: number|null, r?: number|null }} [fallback]
 * @returns {string}
 */
export function formatBroadcastBowlingFigures(rawFigures, fallback = {}) {
  const parsed = parseBowlingFigures(rawFigures);
  const w = parsed.wickets ?? fallback.wickets ?? fallback.w ?? 0;
  const r = parsed.runs ?? fallback.runs ?? fallback.runsConceded ?? fallback.r ?? 0;
  return `${w}-${r}`;
}
