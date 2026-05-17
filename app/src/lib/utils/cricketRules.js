/**
 * cricketRules.js
 *
 * Pure, stateless cricket rule helpers.
 * No React, no API coupling — safe to import anywhere.
 *
 * Laws referenced: MCC Laws of Cricket (2017 Code, 5th Edition).
 *
 * NOTE: Business-rule functions (innings-end detection, strike rotation,
 * free-hit tracking, etc.) were removed when the backend became the single
 * source of truth for cricket logic.  Only display helpers that are
 * genuinely needed client-side remain here.
 */

/** Ball types that do NOT count as a legal delivery (over counter does not advance). */
const ILLEGAL_DELIVERY_TYPES = new Set(['wd', 'nb', 'penalty']);

/** True when a delivery advances the over counter. */
export function isLegalDelivery(ballType) {
  return !ILLEGAL_DELIVERY_TYPES.has(ballType);
}
