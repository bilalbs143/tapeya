/**
 * scoringUtils.js
 *
 * Shared scoring helpers — pure functions, no React.
 * Used by: ScoringMatch, ScoringTab, PartnershipTab, StartMatch, ScorecardTab.
 */

import { checkInningsEnd, isLegalDelivery } from './cricketRules';

// ─── Date / time formatting ───────────────────────────────────────────────────

/**
 * Format date for API (YYYY-MM-DD).
 * Accepts YYYY-MM-DD, MM-DD-YYYY, or Date objects.
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
 * Format time for API (HH:mm). Normalises single-digit minutes ("2:5" → "2:05").
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

// ─── Ball type normalisation ──────────────────────────────────────────────────

/**
 * Normalise a ball to ensure it has a `type` field.
 * Handles both UI shape (has .type) and API shape (has is_wicket, is_wide, etc.).
 */
function normaliseBallType(ball) {
  if (!ball) return null;
  if (ball.type) return ball;
  if (ball.is_wicket) return { ...ball, type: 'out' };
  if (ball.is_wide) return { ...ball, type: 'wd' };
  if (ball.is_no_ball) return { ...ball, type: 'nb' };
  if (ball.is_bye) return { ...ball, type: 'bye' };
  if (ball.is_leg_bye) return { ...ball, type: 'lb' };
  const pr = Number(ball.penalty_runs ?? ball.penaltyRuns ?? 0) || 0;
  if (
    pr > 0 &&
    !ball.is_wicket &&
    Number(ball.runs ?? 0) === 0
  ) {
    return { ...ball, type: 'penalty', penaltyRuns: pr, runs: 0 };
  }
  return { ...ball, type: 'runs' };
}

// ─── Per-ball run extraction ──────────────────────────────────────────────────

/**
 * Total runs contributed by a single ball (batting runs + extras + penalty).
 */
export function getRunsFromBall(ball) {
  const b = normaliseBallType(ball);
  if (!b) return 0;
  // 'out' and 'retired_hurt' contribute 0 batting runs (runs field may be absent).
  if (b.type === 'out' || b.type === 'retired_hurt') return 0;
  const pr = Number(b.penaltyRuns ?? b.penalty_runs ?? 0) || 0;
  return (b.runs ?? 0) + pr;
}

// ─── Extra-ball display label ─────────────────────────────────────────────────

/**
 * Returns the chip label for an extra delivery in international format:
 *
 *   WD        → 'WD'   (1 wide penalty, no additional run)
 *   1WD       → '1WD'  (1 extra run + 1 wide penalty = 2 total)
 *   NB        → 'NB'   (1 no-ball penalty, 0 off bat)
 *   1NB       → '1NB'  (1 off bat  + 1 NB penalty  = 2 total)
 *   2NB       → '2NB'  (2 off bat  + 1 NB penalty  = 3 total)
 *   B         → 'B'    (1 bye)
 *   2B        → '2B'   (2 byes)
 *   LB        → 'LB'   (1 leg bye)
 *   2LB       → '2LB'  (2 leg byes)
 *
 * @param {'wd'|'nb'|'bye'|'lb'} type
 * @param {number} runs  total runs as stored (WD/NB include the 1-run penalty)
 */
export function extraBallLabel(type, runs) {
  const r = runs ?? 0;
  switch (type) {
    case 'wd': {
      const extra = Math.max(1, r) - 1;
      return extra > 0 ? `${extra}WD` : 'WD';
    }
    case 'nb': {
      const extra = Math.max(1, r) - 1;
      return extra > 0 ? `${extra}NB` : 'NB';
    }
    case 'bye':  return r > 1 ? `${r}B`  : 'B';
    case 'lb':   return r > 1 ? `${r}LB` : 'LB';
    default:     return type.toUpperCase();
  }
}

// ─── Over formatting ──────────────────────────────────────────────────────────

/**
 * Format a count of legal balls as an overs string (e.g. 8 → "1.2").
 */
export function ballsToOvers(balls) {
  const b = Number(balls) || 0;
  if (b === 0) return '0';
  return `${Math.floor(b / 6)}.${b % 6}`;
}

// ─── Extras breakdown ─────────────────────────────────────────────────────────

/**
 * Compute a detailed extras breakdown from ball history.
 *
 * @param {object[]} ballHistory  UI-shape balls
 * @returns {{
 *   wides:        number,
 *   noBalls:      number,
 *   byes:         number,
 *   legByes:      number,
 *   penaltyRuns:  number,
 *   total:        number,
 * }}
 */
export function computeExtrasBreakdown(ballHistory) {
  const list = ballHistory ?? [];
  let wides = 0;
  let noBalls = 0;
  let byes = 0;
  let legByes = 0;
  let penaltyRuns = 0;

  for (const ball of list) {
    const b = normaliseBallType(ball);
    if (!b) continue;
    const r = b.runs ?? 0;
    switch (b.type) {
      case 'wd':
        wides += r;
        break;
      case 'nb':
        noBalls += r;
        break;
      case 'bye':
        byes += r;
        break;
      case 'lb':
        legByes += r;
        break;
      default:
        break;
    }
    penaltyRuns +=
      Number(b.penaltyRuns ?? b.penalty_runs ?? 0) || 0;
  }

  return {
    wides,
    noBalls,
    byes,
    legByes,
    penaltyRuns,
    total: wides + noBalls + byes + legByes + penaltyRuns,
  };
}

// ─── Live score computation ───────────────────────────────────────────────────

/**
 * Compute live innings score from ball history.
 *
 * Wicket count excludes 'retired_hurt' (does not count as a dismissal).
 *
 * @param {object[]} ballHistory
 * @param {number|string|undefined} maxOvers  match.overs
 * @returns {{
 *   totalRuns: number,
 *   totalWickets: number,
 *   totalBalls: number,
 *   validDeliveries: number,
 *   oversDisplay: string,
 *   maxOvers: number|undefined,
 *   extras: number,
 *   extrasBreakdown: object,
 *   crr: string,
 * }}
 */
export function computeLiveScore(ballHistory, maxOvers) {
  const list = ballHistory ?? [];
  let totalRuns = 0;
  let totalWickets = 0;
  let validDeliveries = 0;

  for (const ball of list) {
    const b = normaliseBallType(ball);
    if (!b) continue;

    totalRuns += getRunsFromBall(ball);

    // Retired hurt does NOT count as a wicket.
    if (b.type === 'out' && b.dismissalType !== 'retired_hurt')
      totalWickets += 1;

    if (isLegalDelivery(b.type)) validDeliveries += 1;
  }

  const extrasBreakdown = computeExtrasBreakdown(list);
  const oversDisplay = ballsToOvers(validDeliveries);
  const max =
    maxOvers != null && maxOvers !== '' ? Number(maxOvers) : undefined;
  const crr =
    validDeliveries > 0
      ? (totalRuns / (validDeliveries / 6)).toFixed(1)
      : '0.0';

  return {
    totalRuns,
    totalWickets,
    totalBalls: list.length,
    validDeliveries,
    oversDisplay,
    maxOvers: max,
    extras: extrasBreakdown.total,
    extrasBreakdown,
    crr,
  };
}

// ─── Innings-end projection ───────────────────────────────────────────────────

/**
 * If `pendingBall` were appended to `ballHistory`, would the innings be over?
 *
 * @param {object} p
 * @param {object[]} p.ballHistory
 * @param {object}   p.pendingBall
 * @param {number|string|undefined} p.maxOvers
 * @param {number|undefined} p.playersPerSide
 * @param {number|undefined} p.targetScore
 */
export function wouldInningsEndAfterBall({
  ballHistory = [],
  pendingBall,
  maxOvers,
  playersPerSide,
  targetScore,
}) {
  if (!pendingBall) return false;
  const next = [...ballHistory, pendingBall];
  const live = computeLiveScore(next, maxOvers);
  const { ended } = checkInningsEnd({
    totalRuns: live.totalRuns,
    totalWickets: live.totalWickets,
    validDeliveries: live.validDeliveries,
    maxOvers: live.maxOvers,
    playersPerSide,
    targetScore,
  });
  return ended;
}

// ─── Partnership ──────────────────────────────────────────────────────────────

/**
 * Compute current partnership from two batsmen on the crease.
 * Partnership resets on wicket; with only one batsman → 0(0).
 *
 * @param {object[]} batsmenOnCrease
 * @returns {{ runs: number, balls: number }}
 */
export function computePartnership(batsmenOnCrease) {
  const list = batsmenOnCrease ?? [];
  if (list.length !== 2) return { runs: 0, balls: 0 };
  const runs = list.reduce((s, b) => s + (b?.runs ?? 0), 0);
  const balls = list.reduce((s, b) => s + (b?.balls ?? 0), 0);
  return { runs, balls };
}

// ─── Ball list + over summaries (for BallsTab) ────────────────────────────────

/**
 * Build an annotated ball list with over summaries from ball history.
 * Extras (wd/nb) do not count toward the 6 legal balls.
 * A summary block appears after every 6th legal delivery.
 *
 * @param {object[]} ballHistory  UI-shape balls
 * @returns {{
 *   ballListWithMeta: Array<{ ball, overBallLabel, validCount, overIndex }>,
 *   overSummaries: Record<number, object>,
 * }}
 */
export function buildBallListWithMetaAndOverSummaries(ballHistory) {
  const list = [];
  const summaries = {};

  let validCount = 0;
  let currentOverIdx = 0;
  let cumulativeRuns = 0;
  let cumulativeWickets = 0;
  let currentOverBalls = [];
  let currentOverRuns = 0;

  const batsmanStatsMap = new Map();
  const bowlerStatsMap = new Map();
  const activeBatsmen = [];
  let currentOverBowlerId = null;
  let currentOverBowlerRuns = 0;

  for (const ball of ballHistory ?? []) {
    const isExtra = !isLegalDelivery(ball.type);
    const ballRuns = ball.runs ?? 0;
    const strikerId = ball.strikerId ?? ball.striker?.id;
    const bowlerId = ball.bowlerId;

    // Batsman stats accumulation
    if (strikerId) {
      if (!activeBatsmen.find((b) => b.id === strikerId))
        activeBatsmen.push({ id: strikerId });
      if (!batsmanStatsMap.has(strikerId))
        batsmanStatsMap.set(strikerId, { runs: 0, balls: 0 });
      const bs = batsmanStatsMap.get(strikerId);
      if (ball.type === 'runs') bs.runs += ballRuns;
      else if (ball.type === 'nb') bs.runs += ball.runsOffBat ?? Math.max(0, ballRuns - 1);
      if (!isExtra) bs.balls += 1;
    }

    if (ball.type === 'out' || ball.type === 'retired_hurt') {
      const outId = ball.striker?.id ?? strikerId;
      if (outId) {
        const idx = activeBatsmen.findIndex((b) => b.id === outId);
        if (idx !== -1) activeBatsmen.splice(idx, 1);
      }
    }

    // Bowler stats accumulation
    if (bowlerId) {
      if (!bowlerStatsMap.has(bowlerId)) {
        bowlerStatsMap.set(bowlerId, {
          balls: 0,
          runs: 0,
          wickets: 0,
          maidens: 0,
        });
      }
      const bws = bowlerStatsMap.get(bowlerId);
      bws.runs += ballRuns;
      if (!isExtra) bws.balls += 1;
      if (ball.type === 'out' && ball.dismissalType !== 'retired_hurt')
        bws.wickets += 1;
      currentOverBowlerId = bowlerId;
      currentOverBowlerRuns = ballRuns;
    }

    cumulativeRuns += getRunsFromBall(ball);
    if (ball.type === 'out' && ball.dismissalType !== 'retired_hurt')
      cumulativeWickets += 1;
    currentOverRuns += getRunsFromBall(ball);
    currentOverBalls.push(ball);

    if (!isExtra) validCount += 1;

    // Over-ball label: e.g. "2.3" = 3rd ball of 2nd over
    const overBallLabel =
      validCount > 0
        ? `${Math.floor((validCount - 1) / 6) + 1}.${((validCount - 1) % 6) + 1}`
        : '0.0';

    list.push({ ball, overBallLabel, validCount, overIndex: currentOverIdx });

    // End of a completed over (every 6th legal delivery)
    if (!isExtra && validCount % 6 === 0) {
      // Maiden detection: over bowler conceded 0 runs this over
      if (
        currentOverBowlerId &&
        bowlerStatsMap.has(currentOverBowlerId) &&
        currentOverBowlerRuns === 0
      ) {
        bowlerStatsMap.get(currentOverBowlerId).maidens += 1;
      }

      const creaseSnapshot = activeBatsmen.slice(-2).map(({ id }) => {
        const stats = batsmanStatsMap.get(id) ?? { runs: 0, balls: 0 };
        return { id, runs: stats.runs, balls: stats.balls };
      });

      const bowlerSnapshot =
        currentOverBowlerId && bowlerStatsMap.has(currentOverBowlerId)
          ? {
              id: currentOverBowlerId,
              ...bowlerStatsMap.get(currentOverBowlerId),
            }
          : null;

      summaries[currentOverIdx] = {
        balls: [...currentOverBalls],
        overRuns: currentOverRuns,
        cumulativeRuns,
        cumulativeWickets,
        completedOvers: validCount / 6,
        creaseSnapshot,
        bowlerSnapshot,
      };

      currentOverIdx += 1;
      currentOverBalls = [];
      currentOverRuns = 0;
      currentOverBowlerId = null;
      currentOverBowlerRuns = 0;
    }
  }

  return { ballListWithMeta: list, overSummaries: summaries };
}
