import { DISMISSAL_GRID_CAUGHT_BEHIND, DISMISSAL_GRID_CAUGHT_BOWLED } from '@/lib/constants/dismissalCaughtVariants';
import { DISMISSAL_GRID_NO_BALL_WICKET, DISMISSAL_GRID_WIDE_WICKET } from '@/lib/constants/dismissalGridShortcuts';

const DISMISSAL_GRID_SHORTCUTS = [DISMISSAL_GRID_WIDE_WICKET, DISMISSAL_GRID_NO_BALL_WICKET];

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

/**
 * @param {object[]} dismissalOptions From {@link getDismissalOptions}
 * @param {{ includeShortcuts?: boolean }} [opts]
 */
export function appendDismissalGridShortcuts(dismissalOptions, { includeShortcuts = true } = {}) {
  if (!includeShortcuts || !Array.isArray(dismissalOptions)) return dismissalOptions ?? [];
  return [...dismissalOptions, ...DISMISSAL_GRID_SHORTCUTS];
}

/**
 * @param {{ id: number|string, name?: string }[]} players
 * @param {number|string|null} id
 */
export function playerNameById(players, id) {
  if (id == null) return null;
  return players.find((p) => String(p.id) === String(id))?.name ?? null;
}
