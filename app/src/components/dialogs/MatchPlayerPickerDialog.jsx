import { ScoringBatsmanPickerRow, ScoringBowlerPickerRow } from '@/components/scoring/ScoringPlayerPickerRows';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { FormStack } from '@/ui/form/FormStack';

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
  battingStats = [],
  dismissalTypeOptions = [],
  canAddMoreBatsmen,
  isPlayerBattingOrOut,
  getBatsmanDisplayStats,
  onPickBatsman,
  replaceStrikerMode = false,
  strikerId,
  nonStrikerId,
  // bowler-only
  bowlersInTable,
  bowlingStats = [],
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

      <DialogScrollBody>
        <FormStack density="compact">
          {players.length === 0 && <p className="text-muted py-6 text-center text-sm">No Players Available</p>}
          {players.map((player) =>
            isBatsman ? (
              <ScoringBatsmanPickerRow
                key={player.id}
                player={player}
                strikerId={strikerId}
                nonStrikerId={nonStrikerId}
                replaceStrikerMode={replaceStrikerMode}
                canAddMoreBatsmen={canAddMoreBatsmen}
                isPlayerBattingOrOut={isPlayerBattingOrOut}
                getBatsmanDisplayStats={getBatsmanDisplayStats}
                battingStats={battingStats}
                dismissalTypeOptions={dismissalTypeOptions}
                onPick={onPickBatsman}
              />
            ) : (
              <ScoringBowlerPickerRow
                key={player.id}
                player={player}
                bowlersInTable={bowlersInTable}
                bowlingStats={bowlingStats}
                replaceActiveBowlerMode={replaceActiveBowlerMode}
                activeBowlerId={activeBowlerId}
                onReplaceActiveBowlerPick={onReplaceActiveBowlerPick}
                onSelectBowlerForNextOver={onSelectBowlerForNextOver}
              />
            ),
          )}
        </FormStack>
      </DialogScrollBody>
    </>
  );
}
