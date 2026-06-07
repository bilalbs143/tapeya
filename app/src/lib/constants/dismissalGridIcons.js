/**
 * Resolve illustrated icon key for an OUT-grid dismissal option (§6.1 D1).
 *
 * @param {{ value?: string, caughtVariant?: string, gridShortcut?: string }|null|undefined} option
 * @returns {string}
 */
export function getDismissalGridIconKey(option) {
  if (option?.caughtVariant === 'bowled') return 'caught_bowled';
  if (option?.caughtVariant === 'behind') return 'caught_behind';
  if (option?.gridShortcut === 'wide') return 'wide_wicket';
  if (option?.gridShortcut === 'no_ball') return 'no_ball_wicket';
  return option?.value ?? 'default';
}
