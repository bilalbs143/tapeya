import type { AdminSheetAction } from './adminActionSheetTypes';

/** Admin sheet actions opened via AdminActionSheet (subset of MatchAdminAction). */
export type RoutedAdminSheetAction = AdminSheetAction;

/** Full match-admin menu codes — keep in sync with MatchActionMenu. */
export type RoutedMatchAdminAction =
  | 'change_squad'
  | 'change_keeper'
  | 'substitute'
  | 'penalty'
  | 'additional_runs'
  | 'revise_target'
  | 'add_break'
  | 'match_notes'
  | 'match_rules'
  | 'end_innings'
  | 'declare_result'
  | 'cancel_match';

const ADMIN_SHEET_ACTIONS = new Set<RoutedMatchAdminAction>([
  'change_keeper',
  'substitute',
  'additional_runs',
  'add_break',
  'match_notes',
  'match_rules',
]);

export type AdminActionRoute =
  | { kind: 'declare_squad' }
  | { kind: 'penalty' }
  | { kind: 'state_sheet'; action: 'revise_target' | 'end_innings' }
  | { kind: 'declare_result' }
  | { kind: 'cancel_match' }
  | { kind: 'admin_sheet'; action: RoutedAdminSheetAction }
  | { kind: 'noop' };

/** Pure router — ScoringDesk only applies the returned route to local sheet state. */
export function routeAdminAction(code: RoutedMatchAdminAction): AdminActionRoute {
  if (code === 'change_squad') return { kind: 'declare_squad' };
  if (code === 'penalty') return { kind: 'penalty' };
  if (code === 'revise_target' || code === 'end_innings') {
    return { kind: 'state_sheet', action: code };
  }
  if (code === 'declare_result') return { kind: 'declare_result' };
  if (code === 'cancel_match') return { kind: 'cancel_match' };
  if (ADMIN_SHEET_ACTIONS.has(code)) {
    return { kind: 'admin_sheet', action: code as RoutedAdminSheetAction };
  }
  return { kind: 'noop' };
}
