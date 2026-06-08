import { BatterCard, CollapsibleSection, FielderList } from '@/components/scoring/DismissalShared';
import { RunPickerRow } from '@/components/scoring/RunPickerRow';
import { useDialog } from '@/context/DialogContext';
import { useRunOutFlow } from '@/hooks/useRunOutFlow';
import { playerNameById } from '@/lib/utils/dismissalUtils';
import { runOutSelectionToUiFields } from '@/lib/utils/runOutUtils';
import { useGetEnumsQuery } from '@/store/api/enumApi';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { DialogBackButton } from '@/ui/DialogBackButton';

/**
 * Run-out dismissal — full form (normal delivery) or simplified (no-ball delivery).
 *
 * @param {object[]} batsmen On-crease batters
 * @param {object[]} fieldingPlayers Bowling XI for fielder pickers
 * @param {'normal'|'no_ball'} [deliveryContext]
 * @param {number} strikerId
 * @param {number} nonStrikerId
 * @param {number} bowlerId
 * @param {Function} onConfirm
 * @param {Function} [onBack]
 */
export function RunOutDialog({
  batsmen = [],
  fieldingPlayers = [],
  deliveryContext = 'normal',
  strikerId,
  nonStrikerId,
  bowlerId,
  onConfirm,
  onBack,
}) {
  const { closeDialog } = useDialog();
  const { data: enums } = useGetEnumsQuery();
  const runTypeOptions = enums?.no_ball_runs_type ?? [];

  const {
    simplified,
    striker,
    nonStriker,
    outPlayerId,
    setOutPlayerId,
    fielderId,
    setFielderId,
    fielderOpen,
    setFielderOpen,
    runoutExtraRuns,
    setRunoutExtraRuns,
    runoutRunType,
    setRunoutRunType,
    batterCrossed,
    setBatterCrossed,
    canSubmit,
    buildPayload,
  } = useRunOutFlow(batsmen, deliveryContext, strikerId);

  const handleSubmit = () => {
    if (!canSubmit) return;
    const selection = buildPayload({ strikerId, nonStrikerId, bowlerId });
    if (!selection) return;
    onConfirm?.(runOutSelectionToUiFields(selection));
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
        <DialogTitle className={dialogPrimaryTitleClass}>Run Out</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody className="flex flex-col gap-4">
        <section>
          <p className="text-[13px] font-medium text-white">Who Is Out?</p>
          <div className="mt-3 flex gap-3">
            <BatterCard batter={striker} selected={outPlayerId === striker?.id} onSelect={setOutPlayerId} />
            <BatterCard batter={nonStriker} selected={outPlayerId === nonStriker?.id} onSelect={setOutPlayerId} />
          </div>
        </section>

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

        <section>
          <p className="text-[13px] font-medium text-white">Select Extra Run</p>
          <RunPickerRow className="mt-3 px-1" value={runoutExtraRuns} onChange={setRunoutExtraRuns} />
        </section>

        {!simplified && (
          <>
            <section>
              <p className="text-[13px] font-medium text-white" id="batter-crossed-label">
                Has Batter Crossed?
              </p>
              <div className="mt-3 flex gap-3" role="group" aria-labelledby="batter-crossed-label">
                {[
                  { value: true, label: 'Yes' },
                  { value: false, label: 'No' },
                ].map((opt) => (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => setBatterCrossed(opt.value)}
                    aria-pressed={batterCrossed === opt.value}
                    className={`focus-visible:ring-brand flex-1 rounded-full px-4 py-2 text-[13px] font-bold transition-colors focus:outline-none focus-visible:ring-2 ${
                      batterCrossed === opt.value ? 'bg-brand text-black' : 'bg-surface text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <p className="text-[13px] font-medium text-white">Select Run Type</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {runTypeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRunoutRunType(opt.value)}
                    aria-pressed={runoutRunType === opt.value}
                    className={`focus-visible:ring-brand rounded-full px-4 py-2 text-[12px] font-bold transition-colors focus:outline-none focus-visible:ring-2 ${
                      runoutRunType === opt.value ? 'bg-brand text-black' : 'bg-surface text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
      </DialogScrollBody>

      <DialogSaveButton onClick={handleSubmit} disabled={!canSubmit}>
        {simplified ? 'Next' : 'Done'}
      </DialogSaveButton>
    </>
  );
}

export default RunOutDialog;
