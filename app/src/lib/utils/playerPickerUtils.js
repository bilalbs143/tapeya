import { dismissalBadgeLabel, scorecardBowlerToUi } from '@/lib/utils/scoringMappers';

const toStr = (v) => (v == null ? '' : String(v));

function findBattingStat(playerId, battingStats = []) {
  const sid = toStr(playerId);
  return battingStats.find((b) => toStr(b.id ?? b.player_id) === sid) ?? null;
}

/**
 * Row state for batsman picker dialogs (Select Batsman / Replace Striker).
 *
 * @returns {{ canSelect: boolean, statusBadge: { label: string, tone: 'out'|'crease' }|null, scoreLine: string|null }}
 */
export function resolveBatsmanPickerRow({
  playerId,
  strikerId,
  nonStrikerId,
  replaceStrikerMode = false,
  canAddMoreBatsmen = true,
  isPlayerBattingOrOut,
  getBatsmanDisplayStats,
  battingStats = [],
  dismissalTypeOptions = [],
}) {
  const sid = toStr(playerId);
  const isStriker = sid === toStr(strikerId);
  const isNonStriker = nonStrikerId != null && sid === toStr(nonStrikerId);
  const isOnCrease = isStriker || isNonStriker;

  const statRow = findBattingStat(playerId, battingStats);
  const isDismissed =
    !isOnCrease &&
    (
      (statRow?.dismissal_type != null && !statRow?.is_retired_hurt) ||
      (!statRow && isPlayerBattingOrOut?.(playerId))
    );

  const isUnavailable = replaceStrikerMode ? isOnCrease || isDismissed : Boolean(isPlayerBattingOrOut?.(playerId));

  const canSelect = !isUnavailable && (replaceStrikerMode || canAddMoreBatsmen);

  let statusBadge = null;
  if (isDismissed) {
    statusBadge = {
      label: dismissalBadgeLabel({
        dismissalType: statRow?.dismissal_type,
        label: statRow?.dismissal_label,
        enumOptions: dismissalTypeOptions,
      }),
      tone: 'out',
    };
  } else if (isStriker) {
    statusBadge = { label: 'Striker', tone: 'crease' };
  } else if (isNonStriker) {
    statusBadge = { label: 'Non-striker', tone: 'crease' };
  }

  const stats = getBatsmanDisplayStats?.(playerId);
  const scoreLine =
    stats && (stats.runs > 0 || stats.balls > 0 || isUnavailable)
      ? `${stats.runs} (${stats.balls})`
      : null;

  return { canSelect, isUnavailable, statusBadge, scoreLine };
}

function findBowlerStats(playerId, bowlersInTable = [], bowlingStats = []) {
  const sid = toStr(playerId);
  const fromTable = bowlersInTable.find((b) => toStr(b.id) === sid);
  if (fromTable) return fromTable;
  const fromScorecard = bowlingStats.find((b) => toStr(b.id) === sid);
  return fromScorecard ? scorecardBowlerToUi(fromScorecard) : null;
}

/** Minimal bowling line for picker rows: "2.3 ov · 18 r · 1 w" */
export function formatBowlerPickerStats(stats) {
  if (!stats) return null;
  const overs = stats.overs ?? '0';
  const runs = stats.runs ?? 0;
  const wickets = stats.wickets ?? 0;
  if (overs === '0' && runs === 0 && wickets === 0) return null;
  return `${overs} ov · ${runs} r · ${wickets} w`;
}

/**
 * Row state for bowler picker dialogs.
 *
 * @returns {{ canSelect: boolean, statusBadge: { label: string, tone: 'active' }|null, statsLine: string|null }}
 */
export function resolveBowlerPickerRow({
  playerId,
  bowlersInTable = [],
  bowlingStats = [],
  replaceActiveBowlerMode = false,
  activeBowlerId,
}) {
  const sid = toStr(playerId);
  const isActiveBowler = replaceActiveBowlerMode && sid === toStr(activeBowlerId);
  const canSelect = replaceActiveBowlerMode ? !isActiveBowler : true;

  const stats = findBowlerStats(playerId, bowlersInTable, bowlingStats);
  const statsLine = formatBowlerPickerStats(stats);

  const statusBadge = isActiveBowler ? { label: 'Bowling now', tone: 'active' } : null;

  return { canSelect, isActiveBowler, statusBadge, statsLine };
}
