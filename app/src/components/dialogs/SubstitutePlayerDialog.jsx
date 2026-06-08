import { useState } from 'react';

import { BatterCard, CollapsibleSection } from '@/components/scoring/DismissalShared';
import { ScoringPlayerList } from '@/components/scoring/ScoringPlayerList';
import { useDialog } from '@/context/DialogContext';
import { useSubstitutePlayer } from '@/hooks/useSubstitutePlayer';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { playerNameById } from '@/lib/utils/dismissalUtils';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';

/**
 * Action menu → Substitute Player.
 *
 * @param {string} matchId
 * @param {string|number} inningsId
 * @param {object[]} batsmen — striker at index 0
 * @param {object[]} substitutePlayers — batting XI not on crease / not out
 * @param {object[]} fieldingPlayers — bowling XI for optional fielder
 */
export function SubstitutePlayerDialog({ matchId, inningsId, batsmen = [], substitutePlayers = [], fieldingPlayers = [] }) {
  const { closeDialog } = useDialog();
  const toast = useToast();
  const { storeSubstitute, isLoading } = useSubstitutePlayer({ matchId, inningsId });

  const striker = batsmen[0] ?? null;
  const nonStriker = batsmen[1] ?? null;

  const [replacedPlayerId, setReplacedPlayerId] = useState(null);
  const [substitutePlayerId, setSubstitutePlayerId] = useState(null);
  const [fielderId, setFielderId] = useState(null);
  const [substituteOpen, setSubstituteOpen] = useState(false);
  const [fielderOpen, setFielderOpen] = useState(false);

  const canSubmit = matchId && inningsId != null && replacedPlayerId != null && substitutePlayerId != null && !isLoading;

  const handleDone = async () => {
    if (!canSubmit) return;
    try {
      await storeSubstitute({
        replaced_player_id: replacedPlayerId,
        substitute_player_id: substitutePlayerId,
        fielder_id: fielderId,
      });
      toast.success('Substitute recorded.');
      closeDialog();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not record substitute. Please try again.'));
    }
  };

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>Substitute Player</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody className="flex flex-col gap-4">
        <section>
          <p className="text-[13px] font-medium text-white">Current Striker And Non-Striker</p>
          <div className="mt-3 flex gap-3">
            <BatterCard
              batter={striker}
              selected={String(replacedPlayerId) === String(striker?.id)}
              onSelect={setReplacedPlayerId}
            />
            <BatterCard
              batter={nonStriker}
              selected={String(replacedPlayerId) === String(nonStriker?.id)}
              onSelect={setReplacedPlayerId}
            />
          </div>
        </section>

        <CollapsibleSection
          title="Select Substitute Player"
          subtitle={playerNameById(substitutePlayers, substitutePlayerId)}
          open={substituteOpen}
          onToggle={() => setSubstituteOpen((v) => !v)}
        >
          <ScoringPlayerList
            players={substitutePlayers}
            selectedId={substitutePlayerId}
            onSelect={(id) => {
              setSubstitutePlayerId(id);
              setSubstituteOpen(false);
            }}
            emptyMessage="No substitute players available."
          />
        </CollapsibleSection>

        <CollapsibleSection
          title="Select Fielder"
          subtitle={playerNameById(fieldingPlayers, fielderId)}
          open={fielderOpen}
          onToggle={() => setFielderOpen((v) => !v)}
        >
          <ScoringPlayerList
            players={fieldingPlayers}
            selectedId={fielderId}
            onSelect={(id) => {
              setFielderId(id);
              setFielderOpen(false);
            }}
            variant="fielder"
          />
        </CollapsibleSection>
      </DialogScrollBody>

      <DialogSaveButton disabled={!canSubmit} onClick={handleDone}>
        Done
      </DialogSaveButton>
    </>
  );
}

export default SubstitutePlayerDialog;
