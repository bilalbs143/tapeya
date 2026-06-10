import { DontCountBallField } from '@/components/scoring/DontCountBallField';
import { ScoringPlayerList } from '@/components/scoring/ScoringPlayerList';
import { useDialog } from '@/context/DialogContext';
import { useWhoIsOutDismissalFlow } from '@/hooks/useWhoIsOutDismissalFlow';
import { timedOutSelectionToUiFields } from '@/lib/utils/dismissalSelectionUtils';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { DialogBackButton } from '@/ui/DialogBackButton';
import { DialogFormSection } from '@/ui/form/DialogFormSection';
import { FormStack } from '@/ui/form/FormStack';

const TITLES = {
  timed_out: 'Timed Out',
};

/**
 * Timed out — pick batter from XI; ball usually not counted.
 */
export function WhoIsOutDismissalDialog({ dismissalType, players = [], strikerId, nonStrikerId, bowlerId, onConfirm, onBack }) {
  const { closeDialog } = useDialog();
  const { outPlayerId, setOutPlayerId, dontCountBall, setDontCountBall, canSubmit, buildPayload } =
    useWhoIsOutDismissalFlow(true);

  const title = TITLES[dismissalType] ?? 'Who Is Out?';

  const handleSubmit = () => {
    if (!canSubmit) return;
    onConfirm?.(timedOutSelectionToUiFields(buildPayload({ strikerId, nonStrikerId, bowlerId })));
    closeDialog();
  };

  const handleBack = () => {
    closeDialog();
    onBack?.();
  };

  return (
    <>
      <DialogHeaderRow>
        {onBack ? <DialogBackButton onClick={handleBack} ariaLabel="Back to Dismissal List" /> : null}
        <DialogTitle className={dialogPrimaryTitleClass}>{title}</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody>
        <FormStack density="compact">
          <DialogFormSection label="Who Is Out?" controlOffset="md">
            <ScoringPlayerList players={players} selectedId={outPlayerId} onSelect={setOutPlayerId} ariaLabel="Who Is Out?" />
          </DialogFormSection>

          <DontCountBallField checked={dontCountBall} onCheckedChange={setDontCountBall} />
        </FormStack>
      </DialogScrollBody>

      <DialogSaveButton onClick={handleSubmit} disabled={!canSubmit}>
        Done
      </DialogSaveButton>
    </>
  );
}

export default WhoIsOutDismissalDialog;
