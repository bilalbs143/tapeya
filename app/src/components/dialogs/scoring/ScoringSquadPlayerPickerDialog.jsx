import { BaseDialog } from '@/components/dialogs/BaseDialog';
import { ScoringPlayerPickerMeta } from '@/components/scoring/ScoringPlayerPickerMeta';
import { Button } from '@/ui/Button';
import {
  DialogHeaderRow,
  dialogPrimaryTitleClass,
  DialogScrollBody,
  DialogTitle,
} from '@/ui/Dialog';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Safely coerce any id value to a string for comparison. */
const toStr = (v) => (v == null ? '' : String(v));

// ─── Sub-components ─────────────────────────────────────────────────────────

function PlayingBenchRoleToggle({ playerId, role, onSetRole }) {
  return (
    <div className="flex shrink-0 gap-1" onClick={(e) => e.stopPropagation()}>
      <Button
        type="button"
        size="sm"
        variant={role === 'playing' ? 'orange' : 'black'}
        aria-pressed={role === 'playing'}
        aria-label="Set as playing"
        onClick={() => onSetRole(playerId, 'playing')}
        className="text-[12px] font-bold uppercase"
      >
        Playing
      </Button>
      <Button
        type="button"
        size="sm"
        variant={role === 'bench' ? 'orange' : 'black'}
        aria-pressed={role === 'bench'}
        aria-label="Set as bench"
        onClick={() => onSetRole(playerId, 'bench')}
        className="text-[12px] font-bold uppercase"
      >
        Bench
      </Button>
    </div>
  );
}

function SquadPickerSaveFooter({
  isApiMatch,
  hideSquadSetup,
  saving,
  requiredPlayingCount,
  squad,
  onSave,
}) {
  if (!isApiMatch || hideSquadSetup) return null;

  const playingCount = squad.filter((p) => p.role === 'playing').length;
  const remaining = requiredPlayingCount - playingCount;
  const isReady = remaining === 0;

  const label = saving
    ? 'Saving…'
    : isReady
      ? 'Save'
      : `Select ${remaining} more`;

  return (
    <div className="shrink-0 px-5 pt-2 pb-5">
      <Button
        type="button"
        variant="orangeDialog"
        size="dialog"
        className="w-full"
        disabled={saving || !isReady}
        onClick={onSave}
      >
        {label}
      </Button>
    </div>
  );
}

function BatsmanSquadPickerRow({
  b,
  ballHistory,
  hideSquadSetup,
  replaceStrikerMode,
  strikerId,
  nonStrikerId,
  canAddMoreBatsmen,
  isPlayerBattingOrOut,
  getBatsmanDisplayStats,
  onPickBatsman,
  onSetRole,
}) {
  const sid = toStr(b.id);

  const isCurrentStriker = replaceStrikerMode && sid === toStr(strikerId);
  const isNonStrikerOnCrease =
    replaceStrikerMode && nonStrikerId != null && sid === toStr(nonStrikerId);
  const dismissed =
    replaceStrikerMode &&
    ballHistory.some(
      (ball) => ball.type === 'out' && toStr(ball.striker?.id) === sid,
    );

  const hasBattingStats = replaceStrikerMode
    ? isCurrentStriker || isNonStrikerOnCrease || dismissed
    : isPlayerBattingOrOut(b.id);

  // Single readable expression — replaceStrikerMode doesn't gate on canAddMoreBatsmen
  const isEligible = hideSquadSetup || b.role === 'playing';
  const canAdd =
    !hasBattingStats && isEligible && (replaceStrikerMode || canAddMoreBatsmen);

  const stats = getBatsmanDisplayStats(b.id);

  return (
    <div
      role="button"
      tabIndex={canAdd ? 0 : -1}
      aria-disabled={!canAdd}
      onClick={() => canAdd && onPickBatsman(b)}
      onKeyDown={(e) => {
        if (canAdd && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onPickBatsman(b);
        }
      }}
      className={`flex flex-col gap-2 rounded-[10px] bg-[#141412] px-4 py-3 ${
        canAdd ? 'cursor-pointer transition-opacity active:opacity-90' : ''
      } ${hasBattingStats ? 'cursor-not-allowed opacity-90' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-[14px] font-bold text-white">{b.name}</span>
          <ScoringPlayerPickerMeta player={b} variant="batting" />
        </div>
        {hasBattingStats && stats ? (
          <div className="flex shrink-0 gap-4 text-[12px] text-[#A2A6AB]">
            <span>R: {stats.runs}</span>
            <span>B: {stats.balls}</span>
            <span>4s: {stats.fours}</span>
            <span>6s: {stats.sixes}</span>
            <span>SR: {stats.strikeRate}</span>
          </div>
        ) : hideSquadSetup ? null : (
          <PlayingBenchRoleToggle
            playerId={b.id}
            role={b.role}
            onSetRole={onSetRole}
          />
        )}
      </div>
    </div>
  );
}

function BowlerSquadPickerRow({
  b,
  hideSquadSetup,
  bowlersInTable,
  replaceActiveBowlerMode,
  activeBowlerId,
  onReplaceActiveBowlerPick,
  onSelectBowlerForNextOver,
  onSetRole,
}) {
  const sid = toStr(b.id);
  const table = bowlersInTable ?? [];
  const inTable = table.some((bt) => toStr(bt.id) === sid);
  const isActiveBowler =
    replaceActiveBowlerMode && sid === toStr(activeBowlerId);
  const isEligible = hideSquadSetup || b.role === 'playing';

  // In replace-mode: any eligible non-active bowler is selectable.
  // Otherwise: bowler is selectable if they're already in the table,
  // OR if they're eligible and not yet in the table (add OR swap).
  const canSelect = replaceActiveBowlerMode
    ? isEligible && !isActiveBowler
    : inTable || (isEligible && !inTable);

  const handlePick = () => {
    if (!canSelect) return;
    if (replaceActiveBowlerMode) {
      onReplaceActiveBowlerPick?.(b);
    } else {
      onSelectBowlerForNextOver(b);
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
        canSelect
          ? 'cursor-pointer transition-opacity active:opacity-90'
          : 'cursor-default'
      } ${replaceActiveBowlerMode && isActiveBowler ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-[14px] font-bold text-white">{b.name}</span>
          <ScoringPlayerPickerMeta player={b} variant="bowling" />
        </div>
        {hideSquadSetup ? null : (
          <PlayingBenchRoleToggle
            playerId={b.id}
            role={b.role}
            onSetRole={onSetRole}
          />
        )}
      </div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

/**
 * Squad picker used for batting and bowling during live scoring.
 * Same shell and role/save footer; row rules differ by `variant`.
 */
export default function ScoringSquadPlayerPickerDialog({
  variant,
  open,
  onOpenChange,
  players,
  hideSquadSetup = false,
  isApiMatch,
  savingSquad,
  requiredPlayingCount,
  squad,
  onSaveSquad,
  onSetRole,
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
  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) onOpenChange(false);
  };

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
    <BaseDialog open={open} onOpenChange={handleOpenChange}>
      <DialogHeaderRow hideClose>
        <DialogTitle className={dialogPrimaryTitleClass}>{title}</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody className="flex flex-col gap-3">
        {players.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-[#A2A6AB]">
            No players available
          </p>
        )}
        {players.map((b) =>
          isBatsman ? (
            <BatsmanSquadPickerRow
              key={b.id}
              b={b}
              ballHistory={ballHistory}
              hideSquadSetup={hideSquadSetup}
              replaceStrikerMode={replaceStrikerMode}
              strikerId={strikerId}
              nonStrikerId={nonStrikerId}
              canAddMoreBatsmen={canAddMoreBatsmen}
              isPlayerBattingOrOut={isPlayerBattingOrOut}
              getBatsmanDisplayStats={getBatsmanDisplayStats}
              onPickBatsman={onPickBatsman}
              onSetRole={onSetRole}
            />
          ) : (
            <BowlerSquadPickerRow
              key={b.id}
              b={b}
              hideSquadSetup={hideSquadSetup}
              bowlersInTable={bowlersInTable}
              replaceActiveBowlerMode={replaceActiveBowlerMode}
              activeBowlerId={activeBowlerId}
              onReplaceActiveBowlerPick={onReplaceActiveBowlerPick}
              onSelectBowlerForNextOver={onSelectBowlerForNextOver}
              onSetRole={onSetRole}
            />
          ),
        )}
      </DialogScrollBody>

      <SquadPickerSaveFooter
        isApiMatch={isApiMatch}
        hideSquadSetup={hideSquadSetup}
        saving={savingSquad}
        requiredPlayingCount={requiredPlayingCount}
        squad={squad}
        onSave={onSaveSquad}
      />
    </BaseDialog>
  );
}
