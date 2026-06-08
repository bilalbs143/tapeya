import { useState } from 'react';

import { BatterCard, CollapsibleSection } from '@/components/scoring/DismissalShared';
import { ScoringPlayerList } from '@/components/scoring/ScoringPlayerList';
import { useDialog } from '@/context/DialogContext';
import { useSubstitutePlayer } from '@/hooks/useSubstitutePlayer';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { playerNameById } from '@/lib/utils/dismissalUtils';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { DialogFormSection } from '@/ui/form/DialogFormSection';
import { FormStack } from '@/ui/form/FormStack';

/**
 * Action menu → Substitute Player.
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

      <DialogScrollBody>
        <FormStack density="compact">
          <DialogFormSection label="Current Striker And Non-Striker" controlOffset="md">
            <div className="flex gap-3">
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
          </DialogFormSection>

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
        </FormStack>
      </DialogScrollBody>

      <DialogSaveButton disabled={!canSubmit} onClick={handleDone}>
        Done
      </DialogSaveButton>
    </>
  );
}

export default SubstitutePlayerDialog;
