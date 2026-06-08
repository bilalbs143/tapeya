import { RunPickerRow } from '@/components/scoring/RunPickerRow';
import { useDialog } from '@/context/DialogContext';
import { useOverthrowFlow } from '@/hooks/useOverthrowFlow';
import { getOverthrowDeliveryOptions, overthrowDialogTitle, overthrowSelectionToUiFields } from '@/lib/utils/overthrowExtras';
import { useGetEnumsQuery } from '@/store/api/enumApi';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { DialogFormSection } from '@/ui/form/DialogFormSection';
import { FormStack } from '@/ui/form/FormStack';

/**
 * Overthrow scoring — delivery type chips with inline runs picker (0–6).
 *
 * @param {Function} onConfirm Receives UI fields for the scoring engine
 * @param {string|null} [initialDeliveryType] Pre-set delivery type (combined extras buttons)
 */
export function OverthrowDialog({ onConfirm, initialDeliveryType = null }) {
  const { closeDialog } = useDialog();
  const { data: enums } = useGetEnumsQuery();
  const deliveryOptions = getOverthrowDeliveryOptions(enums?.overthrow_delivery_type);
  const lockedDelivery = Boolean(initialDeliveryType);

  const { deliveryType, setDeliveryType, runs, setRuns } = useOverthrowFlow(initialDeliveryType);

  const handleContinue = () => {
    if (!deliveryType) return;
    onConfirm?.(overthrowSelectionToUiFields({ deliveryType, runs }));
    closeDialog();
  };

  const selectedLabel = deliveryOptions.find((o) => o.value === deliveryType)?.label ?? deliveryType;

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>{overthrowDialogTitle(initialDeliveryType)}</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody>
        <FormStack density="compact">
          {lockedDelivery ? (
            <p className="text-muted text-[12px]">Delivery: {selectedLabel}</p>
          ) : (
            <DialogFormSection label="Select Delivery Type" controlOffset="md">
              <div className="flex flex-wrap gap-2">
                {deliveryOptions.map((opt) => {
                  const selected = deliveryType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setDeliveryType(opt.value)}
                      aria-pressed={selected}
                      className={`focus-visible:ring-brand rounded-full px-4 py-2 text-[13px] font-bold transition-colors focus:outline-none focus-visible:ring-2 ${
                        selected ? 'bg-brand text-black' : 'bg-surface text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </DialogFormSection>
          )}

          <DialogFormSection label="Select Runs" controlOffset="md">
            <RunPickerRow className="px-1" value={runs} onChange={setRuns} />
          </DialogFormSection>
        </FormStack>
      </DialogScrollBody>

      <DialogSaveButton onClick={handleContinue} disabled={!deliveryType}>
        Continue
      </DialogSaveButton>
    </>
  );
}

export default OverthrowDialog;
