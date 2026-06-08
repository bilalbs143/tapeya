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
