/**
 * cricketRules.js
 *
 * Pure, stateless cricket rule helpers.
 * No React, no API coupling — safe to import anywhere.
 *
 * Laws referenced: MCC Laws of Cricket (2017 Code, 5th Edition).
 */

// ─── Delivery classification ──────────────────────────────────────────────────

/** Ball types that do NOT count as a legal delivery (over counter does not advance). */
export const ILLEGAL_DELIVERY_TYPES = new Set(['wd', 'nb', 'penalty']);

/** Ball types that DO count as a legal delivery (over counter advances). */
export function isLegalDelivery(ballType) {
  return !ILLEGAL_DELIVERY_TYPES.has(ballType);
}

/** True for wide or no-ball. */
export function isExtraDelivery(ballType) {
  return ILLEGAL_DELIVERY_TYPES.has(ballType);
}

// ─── Free Hit (Law 21.18) ─────────────────────────────────────────────────────

/**
 * Dismissal types that are valid on a free-hit delivery.
 * Law 21.18: only run out, obstructing the field, and hitting the ball twice.
 */
export const FREE_HIT_VALID_DISMISSALS = new Set([
  'run_out',
  'obstructing_the_field',
  'hit_ball_twice',
]);

/**
 * Whether a dismissal type is valid on a free-hit delivery.
 * @param {string} dismissalType
 */
export function isDismissalValidOnFreeHit(dismissalType) {
  return FREE_HIT_VALID_DISMISSALS.has(dismissalType);
}

/**
 * Whether the free-hit flag should CARRY OVER to the next delivery.
 * A free hit carries over when the free-hit delivery itself is a wide or no-ball.
 *
 * @param {'runs'|'out'|'wd'|'nb'|'bye'|'lb'|'retired_hurt'|'penalty'} ballType
 * @returns {boolean}
 */
export function doesFreeHitCarryOver(ballType) {
  return ballType === 'wd' || ballType === 'nb';
}

/**
 * Given the last ball in history, determine whether the NEXT ball is a free hit.
 * Rule: free hit follows every no-ball, and the free-hit flag carries over
 * through wides and subsequent no-balls until a legal delivery consumes it.
 *
 * @param {object[]} ballHistory - UI-shape ball history
 * @param {boolean}  currentPendingFreeHit - current pendingFreeHit state
 * @returns {boolean}
 */
export function computePendingFreeHit(ballHistory, currentPendingFreeHit) {
  const last = ballHistory[ballHistory.length - 1];
  if (!last) return false;

  // Penalty-only rows are not a delivery — free-hit state is unchanged.
  if (last.type === 'penalty') return currentPendingFreeHit;

  // A no-ball always triggers a free hit on the next delivery.
  if (last.type === 'nb') return true;

  // If a free hit is pending and the last ball was wide or no-ball, carry over.
  if (currentPendingFreeHit && doesFreeHitCarryOver(last.type)) return true;

  // Any other legal delivery consumes the free-hit flag.
  return false;
}

// ─── Penalty Runs (Law 41.17) ─────────────────────────────────────────────────

/** Standard penalty run award amount per ICC / MCC laws. */
export const PENALTY_RUNS_AMOUNT = 5;

// ─── Wicket counting ──────────────────────────────────────────────────────────

/**
 * Whether a ball type and dismissal type together count as a wicket
 * for innings completion purposes.
 *
 * Retired hurt (dismissalType === 'retired_hurt') does NOT count as a wicket —
 * the batter may return to the crease.
 *
 * @param {string} ballType
 * @param {string|null|undefined} dismissalType
 */
export function countsAsWicket(ballType, dismissalType) {
  if (ballType !== 'out' && ballType !== 'retired_hurt') return false;
  return dismissalType !== 'retired_hurt';
}

// ─── Strike rotation ──────────────────────────────────────────────────────────

/**
 * Whether runs scored cause a strike rotation (odd number of runs).
 * @param {number} runs
 */
export function causesStrikeRotation(runs) {
  return typeof runs === 'number' && runs % 2 === 1;
}

// ─── Innings completion ───────────────────────────────────────────────────────

/**
 * Given current live score figures, determine if the innings has ended.
 *
 * @param {object} p
 * @param {number}           p.totalRuns
 * @param {number}           p.totalWickets
 * @param {number}           p.validDeliveries
 * @param {number|undefined} p.maxOvers          match.overs (undefined = no limit)
 * @param {number|undefined} p.playersPerSide     for max wickets = playersPerSide - 1
 * @param {number|undefined} p.targetScore        innings 2 chase target
 * @returns {{ ended: boolean, reason: 'target'|'wickets'|'overs'|null }}
 */
export function checkInningsEnd({
  totalRuns,
  totalWickets,
  validDeliveries,
  maxOvers,
  playersPerSide,
  targetScore,
}) {
  if (targetScore != null && totalRuns >= targetScore) {
    return { ended: true, reason: 'target' };
  }
  const maxWickets =
    playersPerSide != null ? Number(playersPerSide) - 1 : undefined;
  if (maxWickets != null && totalWickets >= maxWickets) {
    return { ended: true, reason: 'wickets' };
  }
  const maxValidBalls =
    maxOvers != null && maxOvers !== '' ? Number(maxOvers) * 6 : undefined;
  if (maxValidBalls != null && validDeliveries >= maxValidBalls) {
    return { ended: true, reason: 'overs' };
  }
  return { ended: false, reason: null };
}

// ─── Over boundary ────────────────────────────────────────────────────────────

/** Number of legal deliveries in a standard over. */
export const LEGAL_DELIVERIES_PER_OVER = 6;

/**
 * Count the number of legal deliveries in the CURRENT (incomplete) over.
 * Walks backward through history and resets every time 6 legals are seen
 * so only the partial-over remainder is returned.
 *
 * @param {object[]} ballHistory
 * @returns {number} 0–5
 */
export function legalDeliveriesInCurrentOver(ballHistory) {
  let count = 0;
  for (let i = (ballHistory ?? []).length - 1; i >= 0; i--) {
    const t = ballHistory[i].type;
    if (isLegalDelivery(t)) {
      count++;
      if (count === LEGAL_DELIVERIES_PER_OVER) count = 0;
    }
  }
  return count;
}

/**
 * True when the next legal delivery will complete the current over.
 * @param {object[]} ballHistory
 */
export function willNextLegalCompleteOver(ballHistory) {
  return (
    legalDeliveriesInCurrentOver(ballHistory) === LEGAL_DELIVERIES_PER_OVER - 1
  );
}
