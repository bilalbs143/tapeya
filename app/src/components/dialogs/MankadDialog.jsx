import { BatterCard } from '@/components/scoring/DismissalShared';
import { useDialog } from '@/context/DialogContext';
import { useMankadFlow } from '@/hooks/useMankadFlow';
import { mankadSelectionToUiFields } from '@/lib/utils/dismissalSelectionUtils';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { DialogBackButton } from '@/ui/DialogBackButton';
import { DialogFormSection } from '@/ui/form/DialogFormSection';
import { FormStack } from '@/ui/form/FormStack';

/**
 * Mankad — non-striker (usually) run out; bowler credited as fielder too.
 */
export function MankadDialog({ batsmen = [], strikerId, nonStrikerId, bowlerId, onConfirm, onBack }) {
  const { closeDialog } = useDialog();
  const { striker, nonStriker, outPlayerId, setOutPlayerId, canSubmit, buildPayload } = useMankadFlow(batsmen, nonStrikerId);

  const handleSubmit = () => {
    if (!canSubmit) return;
    onConfirm?.(mankadSelectionToUiFields(buildPayload({ strikerId, nonStrikerId, bowlerId })));
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
        <DialogTitle className={dialogPrimaryTitleClass}>Mankad</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody>
        <FormStack density="compact">
          <p className="border-border-subtle bg-surface text-muted rounded-lg border px-3 py-2.5 text-[12px] leading-snug">
            Mankad dismissal always applies to the <span className="font-semibold text-white">non-striker</span>. The striker card
            is disabled.
          </p>

          <DialogFormSection label="Who Is Out?" controlOffset="md">
            <div className="flex gap-3">
              <div className="flex-1 cursor-not-allowed opacity-40" aria-hidden>
                <BatterCard batter={striker} selected={false} onSelect={() => {}} />
              </div>
              <div className="flex-1">
                <BatterCard batter={nonStriker} selected={outPlayerId === nonStriker?.id} onSelect={setOutPlayerId} />
              </div>
            </div>
          </DialogFormSection>

          <p className="text-muted text-center text-[12px]">
            The bowler is credited as both bowler and fielder on the wicket summary.
          </p>
        </FormStack>
      </DialogScrollBody>

      <DialogSaveButton onClick={handleSubmit} disabled={!canSubmit}>
        Done
      </DialogSaveButton>
    </>
  );
}

export default MankadDialog;
