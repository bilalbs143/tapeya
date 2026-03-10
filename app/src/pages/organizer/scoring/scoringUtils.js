/**
 * Shared scoring helpers – used by ScoringMatch, ScoringTab, PartnershipTab, StartMatch.
 */

/**
 * Format date for API (Y-m-d). Accepts Y-m-d, MM-DD-YYYY, or Date.
 */
export function formatDateForApi(value) {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value))
    return value;
  const mmdd = (value ?? '').match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (mmdd) {
    const [, mm, dd, yyyy] = mmdd;
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }
  try {
    const d = value instanceof Date ? value : new Date(value);
    return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

/**
 * Format time for API (HH:mm). Normalises single-digit minutes (e.g. "2:5" → "2:05").
 */
export function formatTimeForApi(value) {
  if (!value) return '';
  const v = (value ?? '').trim();
  const normalised = v.replace(/^(\d{1,2}):(\d)$/, '$1:0$2');
  if (/^\d{1,2}:\d{2}$/.test(normalised)) {
    return normalised.length === 4 ? `0${normalised}` : normalised;
  }
  return '';
}

/**
 * Normalize ball to a shape with .type (for compatibility with API-loaded balls that use is_wicket, is_wide, etc.).
 * @param {Object} ball - UI shape { type } or API shape { is_wicket, is_wide, is_no_ball, is_bye, is_leg_bye, runs }
 */
function normalizeBallType(ball) {
  if (!ball) return null;
  if (ball.type) return ball;
  if (ball.is_wicket) return { ...ball, type: 'out' };
  if (ball.is_wide) return { ...ball, type: 'wd' };
  if (ball.is_no_ball) return { ...ball, type: 'nb' };
  if (ball.is_bye) return { ...ball, type: 'bye' };
  if (ball.is_leg_bye) return { ...ball, type: 'lb' };
  return { ...ball, type: 'runs' };
}

/** Runs scored in a single ball (for over total / extras). */
export function getRunsFromBall(ball) {
  const b = normalizeBallType(ball);
  if (!b) return 0;
  if (b.type === 'runs') return b.runs ?? 0;
  if (b.type === 'out') return 0;
  return b.runs ?? 0;
}

/** Format balls as overs (e.g. 8 balls -> "1.2"). */
export function ballsToOvers(balls) {
  const b = Number(balls) || 0;
  if (b === 0) return '0';
  return `${Math.floor(b / 6)}.${b % 6}`;
}

/**
 * Compute live score from ball history.
 * An over = 6 legal deliveries; WD and NB do not count, so overs can be 6+ balls.
 *
 * @param {Array} ballHistory
 * @param {number|string|undefined} maxOvers - From API; no default.
 * @returns {{ totalRuns, totalWickets, totalBalls, validDeliveries, oversDisplay, maxOvers, extras, crr }}
 */
export function computeLiveScore(ballHistory, maxOvers) {
  const list = ballHistory || [];
  const totalRuns = list.reduce((s, b) => s + getRunsFromBall(b), 0);
  const totalWickets = list.filter((b) => {
    const n = normalizeBallType(b);
    return n && n.type === 'out';
  }).length;
  let validDeliveries = 0; // only runs/out/bye/lb count; wd/nb do not
  let extras = 0;
  for (const b of list) {
    const n = normalizeBallType(b);
    if (n?.type !== 'wd' && n?.type !== 'nb') validDeliveries += 1;
    if (n && ['wd', 'nb', 'bye', 'lb'].includes(n.type)) extras += n.runs ?? 0;
  }
  const oversDisplay = ballsToOvers(validDeliveries);
  const max =
    maxOvers != null && maxOvers !== '' ? Number(maxOvers) : undefined;
  const oversDecimal = validDeliveries / 6;
  const crr =
    validDeliveries > 0 ? (totalRuns / oversDecimal).toFixed(1) : '0.0';
  return {
    totalRuns,
    totalWickets,
    totalBalls: list.length,
    validDeliveries,
    oversDisplay,
    maxOvers: max,
    extras,
    crr,
  };
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
