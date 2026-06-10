import { BatterCard } from '@/components/scoring/DismissalShared';
import { DontCountBallField } from '@/components/scoring/DontCountBallField';
import { useDialog } from '@/context/DialogContext';
import { getDismissalDeliveryOptions } from '@/lib/utils/overthrowExtras';
import { useGetEnumsQuery } from '@/store/api/enumApi';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { DialogBackButton } from '@/ui/DialogBackButton';
import { DialogFormSection } from '@/ui/form/DialogFormSection';
import { FormStack } from '@/ui/form/FormStack';

/**
 * Shared base for RetiredHurt and RetiredOut.
 */
export function RetiredDismissalDialog({
  countAsWicket,
  batsmen = [],
  useFlow,
  selectionToUiFields,
  strikerId,
  nonStrikerId,
  bowlerId,
  onConfirm,
  onBack,
}) {
  const { closeDialog } = useDialog();
  const { data: enums } = useGetEnumsQuery();
  const deliveryOptions = getDismissalDeliveryOptions(enums?.overthrow_delivery_type);

  const {
    striker,
    nonStriker,
    outPlayerId,
    setOutPlayerId,
    dontCountBall,
    setDontCountBall,
    dismissalDeliveryType,
    setDismissalDeliveryType,
    canSubmit,
    buildPayload,
  } = useFlow(batsmen);

  const handleSubmit = () => {
    if (!canSubmit) return;
    onConfirm?.(selectionToUiFields(buildPayload({ strikerId, nonStrikerId, bowlerId })));
    closeDialog();
  };

  const handleBack = () => {
    closeDialog();
    onBack?.();
  };

  const title = countAsWicket ? 'Retired Out' : 'Retired Hurt';

  return (
    <>
      <DialogHeaderRow>
        {onBack ? <DialogBackButton onClick={handleBack} ariaLabel="Back to Dismissal List" /> : null}
        <DialogTitle className={dialogPrimaryTitleClass}>{title}</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody>
        <FormStack density="compact">
          <DialogFormSection label="Who Is Out?" controlOffset="md">
            <div className="flex gap-3">
              <BatterCard batter={striker} selected={outPlayerId === striker?.id} onSelect={setOutPlayerId} />
              <BatterCard batter={nonStriker} selected={outPlayerId === nonStriker?.id} onSelect={setOutPlayerId} />
            </div>
          </DialogFormSection>

          <DontCountBallField checked={dontCountBall} onCheckedChange={setDontCountBall} />

          <DialogFormSection label="Select Delivery Type" controlOffset="md">
            <div className="flex flex-wrap gap-2">
              {deliveryOptions.map((opt) => {
                const selected = dismissalDeliveryType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDismissalDeliveryType(opt.value)}
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

          <p className="text-muted text-center text-[12px]">
            {countAsWicket
              ? 'Counts as a wicket. The batter cannot return in this innings.'
              : 'Does not count as a wicket. The batter may return later in the innings.'}
          </p>
        </FormStack>
      </DialogScrollBody>

      <DialogSaveButton onClick={handleSubmit} disabled={!canSubmit}>
        Done
      </DialogSaveButton>
    </>
  );
}
