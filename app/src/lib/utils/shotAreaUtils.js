/**
 * Shot area geometry and helpers – shared by ShotAreaDialog and WagonWheelChart.
 * Keys must match backend ShotPositionEnum values (shot_position API).
 */

import { getRunsFromBall } from './scoringUtils';

/** Geometry keyed by zone id (enum value). Order for UI comes from API; default order = Object.keys. */
export const SHOT_ZONE_GEOMETRY = {
  deep_fine_leg: {
    path: 'M233.02 39.9799C207.421 14.3812 172.702 4.31705e-07 136.5 0L136.5 136.5L233.02 39.9799Z',
    position: { angleDeg: 292.5, r: 100 },
  },
  third_man: {
    path: 'M273 136.5C273 118.575 269.469 100.825 262.61 84.2637C255.75 67.7028 245.695 52.6551 233.02 39.9799L136.5 136.5H273Z',
    position: { angleDeg: 337.5, r: 100 },
  },
  deep_point: {
    path: 'M233.02 233.02C245.695 220.345 255.75 205.297 262.61 188.736C269.469 172.175 273 154.425 273 136.5L136.5 136.5L233.02 233.02Z',
    position: { angleDeg: 22.5, r: 100 },
  },
  deep_cover: {
    path: 'M136.5 273C154.425 273 172.175 269.469 188.736 262.61C205.297 255.75 220.345 245.695 233.02 233.02L136.5 136.5L136.5 273Z',
    position: { angleDeg: 67.5, r: 100 },
  },
  long_off: {
    path: 'M39.9799 233.02C52.6551 245.695 67.7028 255.75 84.2637 262.61C100.825 269.469 118.575 273 136.5 273L136.5 136.5L39.9799 233.02Z',
    position: { angleDeg: 112.5, r: 100 },
  },
  long_on: {
    path: 'M0 136.5C-1.56709e-06 154.425 3.53067 172.175 10.3904 188.736C17.2502 205.297 27.3047 220.345 39.9799 233.02L136.5 136.5L0 136.5Z',
    position: { angleDeg: 157.5, r: 100 },
  },
  mid_wicket: {
    path: 'M39.9799 39.9799C27.3047 52.6551 17.2502 67.7028 10.3904 84.2637C3.53067 100.825 -2.70666e-06 118.575 0 136.5L136.5 136.5L39.9799 39.9799Z',
    position: { angleDeg: 202.5, r: 100 },
  },
  square_leg: {
    path: 'M136.5 0C118.575 -2.13759e-07 100.825 3.53068 84.2637 10.3904C67.7028 17.2502 52.6551 27.3047 39.9799 39.9799L136.5 136.5L136.5 0Z',
    position: { angleDeg: 247.5, r: 100 },
  },
};

/**
 * Convert shot-zone math angle (see {@link SHOT_ZONE_GEOMETRY} position.angleDeg)
 * to wagon-wheel graphic angle: degrees clockwise from straight down (0 = bottom).
 */
export function shotZoneAngleToWagonWheel(angleDeg) {
  return 90 - angleDeg;
}

/** Default zones when API not used: one entry per geometry key (order = object key order). */
export const SHOT_DIRECTION_ZONES = Object.keys(SHOT_ZONE_GEOMETRY).map((id) => {
  const label = id.replace(/_/g, ' ').toUpperCase();
  const parts = label.split(/\s+/);
  const mid = Math.ceil(parts.length / 2);
  return {
    id,
    label,
    labelLine1: parts.slice(0, mid).join(' '),
    labelLine2: parts.slice(mid).join(' '),
  };
});

export function resolveShotDirection(ball) {
  return ball?.shotDirection ?? ball?.shot_direction ?? ball?.shot_position ?? null;
}

/**
 * Runs scored per shot zone (only zones with at least one tagged ball).
 * Sorted by runs descending — for wagon wheel FS stats panel.
 *
 * @param {Array} ballHistory
 * @returns {Array<{ id: string, label: string, runs: number, pct: number }>}
 */
export function getShotZoneRunBreakdown(ballHistory = []) {
  const totals = new Map();
  let totalRuns = 0;

  for (const ball of ballHistory) {
    if (ball.type !== 'runs') continue;
    const dir = resolveShotDirection(ball);
    if (!dir || !SHOT_ZONE_GEOMETRY[dir]) continue;
    const runs = getRunsFromBall(ball);
    if (runs <= 0) continue;
    totals.set(dir, (totals.get(dir) ?? 0) + runs);
    totalRuns += runs;
  }

  return [...totals.entries()]
    .map(([id, runs]) => ({
      id,
      label: id.replace(/_/g, ' ').toUpperCase(),
      runs,
      pct: totalRuns > 0 ? Math.round((runs / totalRuns) * 100) : 0,
    }))
    .sort((a, b) => b.runs - a.runs);
}

/**
 * From ball history, compute share of runs (off the bat, type `runs`) per shot direction.
 * Percentages are by total runs in tagged zones, not ball count (e.g. 1 + 6 → 14% / 86%).
 *
 * @param {Array} ballHistory
 * @param {Array} [zones] - Zone list (from API or SHOT_DIRECTION_ZONES); order defines percentages index.
 * @returns {{ total: number, percentages: number[] }} total = sum of those runs; percentages[i] is 0–100 for zones[i].
 */
export function getShotDirectionPercentages(ballHistory = [], zones = SHOT_DIRECTION_ZONES) {
  const list = Array.isArray(zones) && zones.length > 0 ? zones : SHOT_DIRECTION_ZONES;
  const runTotals = list.map(() => 0);
  let totalRuns = 0;
  for (const ball of ballHistory) {
    const dir = resolveShotDirection(ball);
    if (ball.type !== 'runs' || !dir) continue;
    const runs = getRunsFromBall(ball);
    if (runs <= 0) continue;
    const idx = list.findIndex((z) => (z.id ?? z.value) === dir);
    if (idx >= 0) {
      runTotals[idx] += runs;
      totalRuns += runs;
    }
  }
  const percentages = totalRuns > 0 ? runTotals.map((r) => Math.round((r / totalRuns) * 100)) : runTotals.map(() => 0);
  return { total: totalRuns, percentages };
}
