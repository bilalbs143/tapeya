import { BatterCard, CollapsibleSection, FielderList } from '@/components/scoring/DismissalShared';
import { DontCountBallField } from '@/components/scoring/DontCountBallField';
import { useDialog } from '@/context/DialogContext';
import { useObstructTheFieldFlow } from '@/hooks/useObstructTheFieldFlow';
import { obstructSelectionToUiFields } from '@/lib/utils/dismissalSelectionUtils';
import { playerNameById } from '@/lib/utils/dismissalUtils';
import { getDismissalDeliveryOptions } from '@/lib/utils/overthrowExtras';
import { useGetEnumsQuery } from '@/store/api/enumApi';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { DialogBackButton } from '@/ui/DialogBackButton';
import { DialogFormSection } from '@/ui/form/DialogFormSection';
import { FormStack } from '@/ui/form/FormStack';

/**
 * Obstructing the field — who is out, optional fielder, don't count ball, delivery type.
 */
export function ObstructTheFieldDialog({
  batsmen = [],
  fieldingPlayers = [],
  strikerId,
  nonStrikerId,
  bowlerId,
  isWide = false,
  isNoBall = false,
  onConfirm,
  onBack,
}) {
  const { closeDialog } = useDialog();
  const { data: enums } = useGetEnumsQuery();
  const deliveryOptions = getDismissalDeliveryOptions(enums?.overthrow_delivery_type);

  const lockedDeliveryType = isWide ? 'wide' : isNoBall ? 'no_ball' : null;

  const {
    striker,
    nonStriker,
    outPlayerId,
    setOutPlayerId,
    fielderId,
    setFielderId,
    fielderOpen,
    setFielderOpen,
    dontCountBall,
    setDontCountBall,
    dismissalDeliveryType,
    setDismissalDeliveryType,
    lockedDeliveryType: locked,
    canSubmit,
    buildPayload,
  } = useObstructTheFieldFlow(batsmen, lockedDeliveryType);

  const handleSubmit = () => {
    if (!canSubmit) return;
    const selection = buildPayload({ strikerId, nonStrikerId, bowlerId, isWide, isNoBall });
    onConfirm?.(obstructSelectionToUiFields(selection));
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
        <DialogTitle className={dialogPrimaryTitleClass}>Obstructing the Field</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody>
        <FormStack density="compact">
          <DialogFormSection label="Who Is Out?" controlOffset="md">
            <div className="flex gap-3">
              <BatterCard batter={striker} selected={outPlayerId === striker?.id} onSelect={setOutPlayerId} />
              <BatterCard batter={nonStriker} selected={outPlayerId === nonStriker?.id} onSelect={setOutPlayerId} />
            </div>
          </DialogFormSection>

          <CollapsibleSection
            title="Who did Out (Fielder)?"
            subtitle={playerNameById(fieldingPlayers, fielderId)}
            open={fielderOpen}
            onToggle={() => setFielderOpen((v) => !v)}
          >
            <FielderList
              players={fieldingPlayers}
              selectedId={fielderId}
              onSelect={(id) => {
                setFielderId(id);
                setFielderOpen(false);
              }}
            />
          </CollapsibleSection>

          <DontCountBallField checked={dontCountBall} onCheckedChange={setDontCountBall} />

          {!locked && (
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
          )}
        </FormStack>
      </DialogScrollBody>

      <DialogSaveButton onClick={handleSubmit} disabled={!canSubmit}>
        Done
      </DialogSaveButton>
    </>
  );
}

export default ObstructTheFieldDialog;
