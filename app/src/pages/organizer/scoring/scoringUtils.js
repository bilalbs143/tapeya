/**
 * Shared scoring helpers – used by ScoringMatch, ScoringTab, PartnershipTab.
 */

/** Runs scored in a single ball (for over total / extras). */
export function getRunsFromBall(ball) {
  if (!ball) return 0;
  if (ball.type === 'runs') return ball.runs ?? 0;
  if (ball.type === 'out') return 0;
  return ball.runs ?? 0;
}

/** Format balls as overs (e.g. 8 balls -> "1.2"). */
export function ballsToOvers(balls) {
  const b = Number(balls) || 0;
  if (b === 0) return '0';
  return `${Math.floor(b / 6)}.${b % 6}`;
}

/**
 * Compute live score from ball history.
 * @param {Array} ballHistory
 * @param {number|string} maxOvers
 * @returns {{ totalRuns, totalWickets, totalBalls, oversDisplay, maxOvers, extras, crr }}
 */
export function computeLiveScore(ballHistory, maxOvers = 20) {
  const totalRuns = (ballHistory || []).reduce((s, b) => s + getRunsFromBall(b), 0);
  const totalWickets = (ballHistory || []).filter((b) => b.type === 'out').length;
  const totalBalls = (ballHistory || []).length;
  const oversDisplay = ballsToOvers(totalBalls);
  const max = Number(maxOvers) || 20;
  const extras = (ballHistory || [])
    .filter((b) => ['wd', 'nb', 'bye', 'lb'].includes(b.type))
    .reduce((s, b) => s + (b.runs ?? 0), 0);
  const oversDecimal = totalBalls / 6;
  const crr = totalBalls > 0 ? (totalRuns / oversDecimal).toFixed(1) : '0.0';
  return { totalRuns, totalWickets, totalBalls, oversDisplay, maxOvers: max, extras, crr };
}

/**
 * Compute current partnership runs and balls from batsmen on crease.
 * Partnership is only between two batsmen; when one is out it resets. With only one batsman, 0(0).
 * @param {Array} batsmenOnCrease
 * @returns {{ runs, balls }}
 */
export function computePartnership(batsmenOnCrease) {
  const list = batsmenOnCrease || [];
  if (list.length !== 2) return { runs: 0, balls: 0 };
  const runs = list.reduce((s, b) => s + (b?.runs ?? 0), 0);
  const balls = list.reduce((s, b) => s + (b?.balls ?? 0), 0);
  return { runs, balls };
}
