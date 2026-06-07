/**
 * Synthetic OUT-grid entries for Caught Bowled / Caught Behind (§6.1 items 3–4).
 * Stored as `caught` with fielder preset to bowler or wicket keeper.
 */

export const DISMISSAL_GRID_CAUGHT_BOWLED = {
  value: '__grid_caught_bowled__',
  label: 'Caught Bowled',
  dismissalType: 'caught',
  requires_fielder: true,
  caughtVariant: 'bowled',
};

export const DISMISSAL_GRID_CAUGHT_BEHIND = {
  value: '__grid_caught_behind__',
  label: 'Caught Behind',
  dismissalType: 'caught',
  requires_fielder: true,
  caughtVariant: 'behind',
};

/**
 * Inserts Caught Bowled / Caught Behind immediately after the generic Caught option.
 *
 * @param {object[]} dismissalOptions From {@link getDismissalOptions}
 */
export function injectCaughtDismissalVariants(dismissalOptions) {
  if (!Array.isArray(dismissalOptions)) return [];
  const caughtIdx = dismissalOptions.findIndex((o) => o.value === 'caught');
  if (caughtIdx === -1) return dismissalOptions;
  const next = [...dismissalOptions];
  next.splice(caughtIdx + 1, 0, DISMISSAL_GRID_CAUGHT_BOWLED, DISMISSAL_GRID_CAUGHT_BEHIND);
  return next;
}

/**
 * @param {{ caughtVariant?: string }|null|undefined} option
 */
export function isCaughtDismissalVariant(option) {
  return option?.caughtVariant === 'bowled' || option?.caughtVariant === 'behind';
}
