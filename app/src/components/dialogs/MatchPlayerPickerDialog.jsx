import { ScoringPlayerPickerMeta } from '@/components/scoring/ScoringPlayerPickerMeta';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogScrollBody, DialogTitle } from '@/ui/Dialog';

const toStr = (v) => (v == null ? '' : String(v));

function BatsmanRow({
  player,
  ballHistory,
  replaceStrikerMode,
  strikerId,
  nonStrikerId,
  canAddMoreBatsmen,
  isPlayerBattingOrOut,
  getBatsmanDisplayStats,
  onPick,
}) {
  const sid = toStr(player.id);
  const isCurrentStriker = replaceStrikerMode && sid === toStr(strikerId);
  const isNonStriker = replaceStrikerMode && nonStrikerId != null && sid === toStr(nonStrikerId);
  const dismissed = replaceStrikerMode && ballHistory.some((ball) => ball.type === 'out' && toStr(ball.striker?.id) === sid);

  const hasBattingStats = replaceStrikerMode ? isCurrentStriker || isNonStriker || dismissed : isPlayerBattingOrOut(player.id);

  const canAdd = !hasBattingStats && (replaceStrikerMode || canAddMoreBatsmen);

  const stats = getBatsmanDisplayStats(player.id);

  return (
    <div
      role="button"
      tabIndex={canAdd ? 0 : -1}
      aria-disabled={!canAdd}
      onClick={() => canAdd && onPick(player)}
      onKeyDown={(e) => {
        if (canAdd && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onPick(player);
        }
      }}
      className={`flex flex-col gap-2 rounded-[10px] bg-[#141412] px-4 py-3 ${
        canAdd ? 'cursor-pointer transition-opacity active:opacity-90' : ''
      } ${hasBattingStats ? 'cursor-not-allowed opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-[14px] font-bold text-white">{player.name}</span>
          <ScoringPlayerPickerMeta player={player} variant="batting" />
        </div>
        {hasBattingStats && stats ? (
          <div className="flex shrink-0 gap-4 text-[12px] text-[#A2A6AB]">
            <span>R: {stats.runs}</span>
            <span>B: {stats.balls}</span>
            <span>4s: {stats.fours}</span>
            <span>6s: {stats.sixes}</span>
            <span>SR: {stats.strikeRate}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function BowlerRow({
  player,
  bowlersInTable,
  replaceActiveBowlerMode,
  activeBowlerId,
  onReplaceActiveBowlerPick,
  onSelectBowlerForNextOver,
}) {
  const sid = toStr(player.id);
  const table = bowlersInTable ?? [];
  const inTable = table.some((bt) => toStr(bt.id) === sid);
  const isActiveBowler = replaceActiveBowlerMode && sid === toStr(activeBowlerId);

  const canSelect = replaceActiveBowlerMode ? !isActiveBowler : inTable || !inTable;

  const handlePick = () => {
    if (!canSelect) return;
    if (replaceActiveBowlerMode) {
      onReplaceActiveBowlerPick?.(player);
    } else {
      onSelectBowlerForNextOver(player);
    }
  };

  return (
    <div
      role="button"
      tabIndex={canSelect ? 0 : -1}
      aria-disabled={!canSelect}
      onClick={handlePick}
      onKeyDown={(e) => {
        if (canSelect && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handlePick();
        }
      }}
      className={`flex flex-col gap-2 rounded-[10px] bg-[#141412] px-4 py-3 ${
        canSelect ? 'cursor-pointer transition-opacity active:opacity-90' : 'cursor-default'
      } ${replaceActiveBowlerMode && isActiveBowler ? 'opacity-60' : ''}`}
    >
      <div className="min-w-0 flex-1">
        <span className="text-[14px] font-bold text-white">{player.name}</span>
        <ScoringPlayerPickerMeta player={player} variant="bowling" />
      </div>
    </div>
  );
}

/**
 * Lightweight in-match player picker — shows only active Playing XI members.
 * No Play/Bench toggles, no squad management. Used for all live scoring flows:
 * new batter after wicket, bowler change, replacement, over change.
 */
/** Body-only — DialogManager provides the BaseDialog wrapper. */
export default function MatchPlayerPickerDialog({
  variant,
  players,
  // batsman-only
  ballHistory = [],
  canAddMoreBatsmen,
  isPlayerBattingOrOut,
  getBatsmanDisplayStats,
  onPickBatsman,
  replaceStrikerMode = false,
  strikerId,
  nonStrikerId,
  // bowler-only
  bowlersInTable,
  onSelectBowlerForNextOver,
  replaceActiveBowlerMode = false,
  activeBowlerId,
  onReplaceActiveBowlerPick,
}) {
  const title =
    variant === 'batsman'
      ? replaceStrikerMode
        ? 'Replace Striker'
        : 'Select Batsman'
      : replaceActiveBowlerMode
        ? 'Replace Bowler'
        : 'Select Bowler';

  const isBatsman = variant === 'batsman';

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>{title}</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody className="flex flex-col gap-3">
        {players.length === 0 && <p className="px-4 py-6 text-center text-sm text-[#A2A6AB]">No players available</p>}
        {players.map((player) =>
          isBatsman ? (
            <BatsmanRow
              key={player.id}
              player={player}
              ballHistory={ballHistory}
              replaceStrikerMode={replaceStrikerMode}
              strikerId={strikerId}
              nonStrikerId={nonStrikerId}
              canAddMoreBatsmen={canAddMoreBatsmen}
              isPlayerBattingOrOut={isPlayerBattingOrOut}
              getBatsmanDisplayStats={getBatsmanDisplayStats}
              onPick={onPickBatsman}
            />
          ) : (
            <BowlerRow
              key={player.id}
              player={player}
              bowlersInTable={bowlersInTable}
              replaceActiveBowlerMode={replaceActiveBowlerMode}
              activeBowlerId={activeBowlerId}
              onReplaceActiveBowlerPick={onReplaceActiveBowlerPick}
              onSelectBowlerForNextOver={onSelectBowlerForNextOver}
            />
          ),
        )}
      </DialogScrollBody>
    </>
  );
}
