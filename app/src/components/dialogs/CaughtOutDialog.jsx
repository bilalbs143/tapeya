import { BatterCard, CollapsibleSection, FielderList } from '@/components/scoring/DismissalShared';
import { useDialog } from '@/context/DialogContext';
import { useCaughtOutFlow } from '@/hooks/useCaughtOutFlow';
import { caughtOutSelectionToUiFields } from '@/lib/utils/dismissalSelectionUtils';
import { playerNameById } from '@/lib/utils/dismissalUtils';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { DialogBackButton } from '@/ui/DialogBackButton';
import { DialogFormSection } from '@/ui/form/DialogFormSection';
import { FormStack } from '@/ui/form/FormStack';

/**
 * Caught out — who is out + fielder (§6.2).
 */
export function CaughtOutDialog({
  batsmen = [],
  fieldingPlayers = [],
  strikerId,
  nonStrikerId,
  bowlerId,
  presetFielderId = null,
  lockFielder = false,
  isWide = false,
  isNoBall = false,
  onConfirm,
  onBack,
}) {
  const { closeDialog } = useDialog();

  const {
    striker,
    nonStriker,
    outPlayerId,
    setOutPlayerId,
    fielderId,
    setFielderId,
    fielderOpen,
    setFielderOpen,
    canSubmit,
    buildPayload,
  } = useCaughtOutFlow(batsmen, strikerId, presetFielderId);

  const lockedFielderName =
    lockFielder && presetFielderId != null
      ? (fieldingPlayers.find((p) => String(p.id) === String(presetFielderId))?.name ?? 'Fielder')
      : null;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const selection = buildPayload({ strikerId, nonStrikerId, bowlerId, isWide, isNoBall });
    onConfirm?.(caughtOutSelectionToUiFields(selection));
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
        <DialogTitle className={dialogPrimaryTitleClass}>Caught Out</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody>
        <FormStack density="compact">
          <DialogFormSection label="Who Is Out?" controlOffset="md">
            <div className="flex gap-3">
              <BatterCard batter={striker} selected={outPlayerId === striker?.id} onSelect={setOutPlayerId} />
              <BatterCard batter={nonStriker} selected={outPlayerId === nonStriker?.id} onSelect={setOutPlayerId} />
            </div>
          </DialogFormSection>

          {lockFielder && lockedFielderName ? (
            <DialogFormSection label="Who Did Out (Fielder)?" controlOffset="sm">
              <p className="border-border-subtle bg-surface text-brand rounded-lg border px-3 py-3 text-[14px] font-medium">
                {lockedFielderName}
              </p>
            </DialogFormSection>
          ) : (
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
          )}
        </FormStack>
      </DialogScrollBody>

      <DialogSaveButton onClick={handleSubmit} disabled={!canSubmit}>
        Done
      </DialogSaveButton>
    </>
  );
}

export default CaughtOutDialog;
