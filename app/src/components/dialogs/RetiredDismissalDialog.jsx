import { BatterCard } from '@/components/scoring/DismissalShared';
import { DontCountBallField } from '@/components/scoring/DontCountBallField';
import { useDialog } from '@/context/DialogContext';
import { getDismissalDeliveryOptions } from '@/lib/utils/overthrowExtras';
import { useGetEnumsQuery } from '@/store/api/enumApi';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { DialogBackButton } from '@/ui/DialogBackButton';

/**
 * Shared base for RetiredHurt and RetiredOut.
 *
 * @param {boolean}  countAsWicket   true → RetiredOut; false → RetiredHurt
 * @param {object[]} batsmen
 * @param {Function} useFlow         useRetiredHurtFlow | useRetiredOutFlow
 * @param {Function} selectionToUiFields  serialiser for the scoring engine
 * @param {number}   strikerId
 * @param {number}   nonStrikerId
 * @param {number}   bowlerId
 * @param {Function} onConfirm
 * @param {Function} [onBack]
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

      <DialogScrollBody className="flex flex-col gap-4">
        <div>
          <p className="text-[13px] font-medium text-white">Who Is Out?</p>
          <div className="mt-3 flex gap-3">
            <BatterCard batter={striker} selected={outPlayerId === striker?.id} onSelect={setOutPlayerId} />
            <BatterCard batter={nonStriker} selected={outPlayerId === nonStriker?.id} onSelect={setOutPlayerId} />
          </div>
        </div>

        <DontCountBallField checked={dontCountBall} onCheckedChange={setDontCountBall} />

        <div>
          <p className="text-[13px] font-medium text-white">Select Delivery Type</p>
          <div className="mt-3 flex flex-wrap gap-2">
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
        </div>

        <p className="text-muted text-center text-[12px]">
          {countAsWicket
            ? 'Counts as a wicket. The batter cannot return in this innings.'
            : 'Does not count as a wicket. The batter may return later in the innings.'}
        </p>
      </DialogScrollBody>

      <DialogSaveButton onClick={handleSubmit} disabled={!canSubmit}>
        Done
      </DialogSaveButton>
    </>
  );
}
