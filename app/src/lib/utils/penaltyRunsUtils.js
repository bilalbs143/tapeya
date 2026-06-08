/** Default penalty when opening the dialog (Law 41.17 common award). */
export const DEFAULT_PENALTY_RUNS = 5;

export const PENALTY_REASON_FALLBACK = [
  { value: 'deliberate_short_run', label: 'Deliberate Short Run' },
  { value: 'time_wasting_batting', label: 'Time Wasting by Batting Side' },
  { value: 'damaging_pitch_batting', label: 'Damaging the Pitch by Batting Side' },
  { value: 'practice_on_field_batting', label: 'Practice on the Field by Batting Side' },
  { value: 'unfair_stealing_run', label: 'Batsman Unfair Stealing a Run' },
  { value: 'super_ball', label: 'Super Ball' },
  { value: 'unfair_actions', label: 'Unfair Actions' },
];

/**
 * Completed innings total for a team (batting innings only).
 *
 * @param {object[]} [inningsList]
 * @param {number} teamId
 */
export function inningsBattingTotalForTeam(inningsList, teamId) {
  if (!Array.isArray(inningsList) || teamId == null) return 0;
  for (const inn of inningsList) {
    if (Number(inn.batting_team_id) === Number(teamId)) {
      return Number(inn.total_runs ?? 0);
    }
  }
  return 0;
}

/**
 * Live display score for batting or bowling team — used only for the penalty preview label.
 *
 * This is a display-only approximation. The backend is the source of truth for
 * the actual score after a penalty is submitted. Two rules:
 *
 * 1. Batting team (currently at crease): use `liveScore.totalRuns` — the backend's
 *    live total, already inclusive of all penalties awarded this innings.
 * 2. Bowling team (completed innings): use the innings `total_runs` from the API
 *    scorecard response — the backend has already applied cross-innings penalties
 *    via `InningsStatsService::applyCrossInningsPenalties()`, so we must NOT add
 *    them again locally.
 *
 * @param {object} params
 * @param {'batting'|'bowling'} params.side
 * @param {number} params.battingTeamId
 * @param {number} params.bowlingTeamId
 * @param {object|null} params.liveScore   Active innings live totals from match_state
 * @param {object[]}   [params.allInnings] Scorecard innings from the API (total_runs is backend-computed)
 */
export function teamDisplayScore({ side, battingTeamId, bowlingTeamId, liveScore, allInnings = [] }) {
  if (side === 'batting' && liveScore?.totalRuns != null) {
    // Backend live total — already includes all penalties awarded this innings.
    return Number(liveScore.totalRuns);
  }

  // For the bowling team (or fallback): use the backend-computed total_runs from
  // the completed innings. Do NOT add crossInningsPenaltyForTeam — the backend
  // already folds those into total_runs via applyCrossInningsPenalties().
  const teamId = side === 'batting' ? battingTeamId : bowlingTeamId;
  return inningsBattingTotalForTeam(allInnings, teamId);
}

/**
 * @param {object} params
 * @param {number} params.baseScore
 * @param {number} params.runs  Positive = award, negative = deduction.
 */
export function formatPenaltyRevisedScorePreview(baseScore, runs) {
  const base = Math.max(0, Number(baseScore) || 0);
  const delta = Number(runs) || 0;
  const revised = Math.max(0, base + delta);

  if (delta === 0) {
    return { base, delta, revised, text: 'Enter an amount to see the revised score.' };
  }

  const sign = delta > 0 ? '+' : '−';
  const abs = Math.abs(delta);
  return {
    base,
    delta,
    revised,
    text: `Revised score will be ${revised} (${base} ${sign} ${abs})`,
  };
}

/**
 * @param {object} params
 * @param {number} params.runs  Positive = award, negative = deduction.
 * @param {string} params.penaltyTeam batting | bowling
 * @param {string} params.penaltyReason
 */
export function penaltySelectionToUiFields({ runs, penaltyTeam, penaltyReason }) {
  return {
    type: 'penalty',
    penaltyRuns: Number(runs) || 0,
    penaltyTeam,
    penaltyReason,
  };
}
