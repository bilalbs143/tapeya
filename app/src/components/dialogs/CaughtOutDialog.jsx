import { BatterCard, CollapsibleSection, FielderList } from '@/components/scoring/DismissalShared';
import { useDialog } from '@/context/DialogContext';
import { useCaughtOutFlow } from '@/hooks/useCaughtOutFlow';
import { caughtOutSelectionToUiFields } from '@/lib/utils/dismissalSelectionUtils';
import { playerNameById } from '@/lib/utils/dismissalUtils';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { DialogBackButton } from '@/ui/DialogBackButton';

/**
 * Caught out — who is out + fielder (§6.2).
 *
 * @param {object[]} batsmen
 * @param {object[]} fieldingPlayers
 * @param {number} strikerId
 * @param {number} nonStrikerId
 * @param {number} bowlerId
 * @param {number|null} [presetFielderId] Pre-selected fielder (Caught Bowled / Caught Behind)
 * @param {boolean} [lockFielder] When true, fielder is fixed to presetFielderId
 * @param {boolean} [isWide]
 * @param {boolean} [isNoBall]
 * @param {Function} onConfirm
 * @param {Function} [onBack]
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

      <DialogScrollBody className="flex flex-col gap-4">
        <section>
          <p className="text-[13px] font-medium text-white">Who Is Out?</p>
          <div className="mt-3 flex gap-3">
            <BatterCard batter={striker} selected={outPlayerId === striker?.id} onSelect={setOutPlayerId} />
            <BatterCard batter={nonStriker} selected={outPlayerId === nonStriker?.id} onSelect={setOutPlayerId} />
          </div>
        </section>

        {lockFielder && lockedFielderName ? (
          <section className="border-border-subtle bg-surface rounded-lg border px-3 py-3">
            <p className="text-[13px] font-medium text-white">Who Did Out (Fielder)?</p>
            <p className="text-brand mt-2 text-[14px] font-medium">{lockedFielderName}</p>
          </section>
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
      </DialogScrollBody>

      <DialogSaveButton onClick={handleSubmit} disabled={!canSubmit}>
        Done
      </DialogSaveButton>
    </>
  );
}

export default CaughtOutDialog;
