/**
 * Scoring Action menu items (§3, gap A1).
 * Add entries here to extend the menu without restructuring the sheet.
 *
 * @typedef {'change_squad'|'revise_target'|'end_innings'|'add_breaks'|'cancel_match'|'change_wicket_keeper'|'substitute_player'|'give_penalty_runs'|'add_additional_runs'|'match_rules'|'match_notes'|'declare_results'} ScoringActionId
 */

/** @type {Array<{ id: ScoringActionId, label: string, icon: string }>} */
export const SCORING_ACTION_MENU_ITEMS = [
  { id: 'change_squad', label: 'Change Squad', icon: 'squad' },
  { id: 'revise_target', label: 'Revise Target', icon: 'revise' },
  { id: 'end_innings', label: 'End Innings', icon: 'end_innings' },
  { id: 'add_breaks', label: 'Add Breaks', icon: 'break' },
  { id: 'cancel_match', label: 'Cancel Match', icon: 'cancel' },
  { id: 'change_wicket_keeper', label: 'Change Wicket Keeper', icon: 'keeper' },
  { id: 'substitute_player', label: 'Substitute Player', icon: 'substitute' },
  { id: 'give_penalty_runs', label: 'Give Penalty Runs', icon: 'penalty' },
  { id: 'add_additional_runs', label: 'Add Additional Runs', icon: 'additional' },
  { id: 'match_rules', label: 'Match Rules', icon: 'rules' },
  { id: 'match_notes', label: 'Match Notes', icon: 'notes' },
  { id: 'declare_results', label: 'Declare Results', icon: 'declare' },
];
