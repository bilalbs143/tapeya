import { useDialog } from '@/context/DialogContext';
import { useWideBallExtrasFlow } from '@/hooks/useWideBallExtrasFlow';
import { EXTRA_RUN_OPTIONS } from '@/lib/utils/extraRunOptions';
import { wideBallSelectionToUiFields } from '@/lib/utils/wideBallExtras';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { DialogFormSection } from '@/ui/form/DialogFormSection';
import { FormStack } from '@/ui/form/FormStack';

/**
 * Wide-ball scoring dialog — WB+0…6 pill chips + live equation.
 *
 * @param {Function} onConfirm Receives `{ type: 'wd', extraRuns }` for the scoring engine
 */
export function WideBallDialog({ onConfirm }) {
  const { closeDialog } = useDialog();
  const { extraRuns, setExtraRuns, equation } = useWideBallExtrasFlow();

  const handleContinue = () => {
    if (extraRuns == null) return;
    onConfirm?.(wideBallSelectionToUiFields(extraRuns));
    closeDialog();
  };

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>Wide Ball</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody>
        <FormStack density="compact">
          <DialogFormSection label="Select Extra Run" controlOffset="md">
            <div className="flex flex-wrap gap-2">
              {EXTRA_RUN_OPTIONS.map((runs) => {
                const selected = extraRuns === runs;
                return (
                  <button
                    key={runs}
                    type="button"
                    onClick={() => setExtraRuns(runs)}
                    aria-pressed={selected}
                    className={`focus-visible:ring-brand rounded-full px-4 py-2 text-[13px] font-bold transition-colors focus:outline-none focus-visible:ring-2 ${
                      selected ? 'bg-brand text-black' : 'bg-surface text-white'
                    }`}
                  >
                    WB+{runs}
                  </button>
                );
              })}
            </div>
            <p className="text-muted mt-4 text-center text-[12px] leading-snug">{equation.text}</p>
          </DialogFormSection>
        </FormStack>
      </DialogScrollBody>

      <DialogSaveButton onClick={handleContinue} disabled={extraRuns == null}>
        Continue
      </DialogSaveButton>
    </>
  );
}

export default WideBallDialog;
