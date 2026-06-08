import { DontCountBallField } from '@/components/scoring/DontCountBallField';
import { ScoringPlayerList } from '@/components/scoring/ScoringPlayerList';
import { useDialog } from '@/context/DialogContext';
import { useWhoIsOutDismissalFlow } from '@/hooks/useWhoIsOutDismissalFlow';
import { timedOutSelectionToUiFields } from '@/lib/utils/dismissalSelectionUtils';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { DialogBackButton } from '@/ui/DialogBackButton';

const TITLES = {
  timed_out: 'Timed Out',
};

/**
 * Timed out — pick batter from XI; ball usually not counted.
 *
 * @param {'timed_out'} dismissalType
 * @param {object[]} players Batting XI eligible to select
 * @param {number} strikerId
 * @param {number} nonStrikerId
 * @param {number} bowlerId
 * @param {Function} onConfirm
 * @param {Function} [onBack]
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

      <DialogScrollBody className="flex flex-col gap-4">
        <section>
          <p className="text-[13px] font-medium text-white">Who Is Out?</p>
          <ScoringPlayerList
            className="mt-3"
            players={players}
            selectedId={outPlayerId}
            onSelect={setOutPlayerId}
            ariaLabel="Who Is Out?"
          />
        </section>

        <DontCountBallField checked={dontCountBall} onCheckedChange={setDontCountBall} />
      </DialogScrollBody>

      <DialogSaveButton onClick={handleSubmit} disabled={!canSubmit}>
        Done
      </DialogSaveButton>
    </>
  );
}

export default WhoIsOutDismissalDialog;
