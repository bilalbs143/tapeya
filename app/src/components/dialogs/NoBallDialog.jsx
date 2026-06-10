import { useDialog } from '@/context/DialogContext';
import { useNoBallExtrasFlow } from '@/hooks/useNoBallExtrasFlow';
import { EXTRA_RUN_OPTIONS } from '@/lib/utils/extraRunOptions';
import { noBallSelectionToUiFields } from '@/lib/utils/noBallExtras';
import { useGetEnumsQuery } from '@/store/api/enumApi';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { DialogFormSection } from '@/ui/form/DialogFormSection';
import { FormStack } from '@/ui/form/FormStack';

const TYPE_ICONS = {
  over_footed: '👣',
  over_heighten: '↕',
  field_restriction: '⊘',
  bowling_action: '🎳',
};

const RUNS_TYPE_ICONS = {
  from_bat: '🏏',
  bye: 'B',
  leg_bye: 'LB',
};

function IconOptionButton({ active, onClick, icon, label, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel ?? label}
      aria-pressed={active}
      className={`focus-visible:ring-brand flex flex-col items-center gap-2 rounded-full border-2 px-2 py-3 transition-colors focus:outline-none focus-visible:ring-2 ${
        active ? 'border-brand bg-surface-raised' : 'bg-surface border-[#141412]'
      }`}
    >
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-full text-lg ${
          active ? 'bg-brand text-black' : 'text-brand bg-[#10100F]'
        }`}
        aria-hidden
      >
        {icon}
      </span>
      <span className="max-w-[72px] text-center text-[9px] leading-tight font-semibold text-white">{label}</span>
    </button>
  );
}

/**
 * No-ball scoring dialog — type, runs type, NB+0…6, live equation.
 *
 * @param {Function} onConfirm Receives fields for {@link noBallSelectionToUiFields} + dispatch
 */
export function NoBallDialog({ onConfirm }) {
  const { closeDialog } = useDialog();
  const { data: enums } = useGetEnumsQuery();
  const noBallTypeOptions = enums?.no_ball_type ?? [];
  const noBallRunsTypeOptions = enums?.no_ball_runs_type ?? [];

  const {
    noBallType,
    setNoBallType,
    noBallRunsType,
    setNoBallRunsType,
    extraRuns,
    setExtraRuns,
    equation,
    buildPayload,
    canContinue,
  } = useNoBallExtrasFlow(noBallTypeOptions, noBallRunsTypeOptions);

  const handleContinue = () => {
    if (!canContinue) return;
    const selection = buildPayload();
    if (!selection) return;
    const uiFields = noBallSelectionToUiFields(selection);
    onConfirm?.(uiFields);
    closeDialog();
  };

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>No Ball</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody>
        <FormStack density="compact">
          <DialogFormSection label="No Ball Type" labelId="no-ball-type-label" controlOffset="md">
            <div className="flex flex-wrap gap-2" role="group" aria-labelledby="no-ball-type-label">
              {noBallTypeOptions.map((opt) => (
                <IconOptionButton
                  key={opt.value}
                  active={noBallType === opt.value}
                  onClick={() => setNoBallType(opt.value)}
                  icon={TYPE_ICONS[opt.value] ?? '•'}
                  label={opt.label}
                />
              ))}
            </div>
          </DialogFormSection>

          <DialogFormSection label="Runs(s) Type" controlOffset="md">
            <div className="grid grid-cols-3 gap-3">
              {noBallRunsTypeOptions.map((opt) => (
                <IconOptionButton
                  key={opt.value}
                  active={noBallRunsType === opt.value}
                  onClick={() => setNoBallRunsType(opt.value)}
                  icon={RUNS_TYPE_ICONS[opt.value] ?? '•'}
                  label={opt.label}
                />
              ))}
            </div>
          </DialogFormSection>

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
                    NB+{runs}
                  </button>
                );
              })}
            </div>
            <p className="text-muted mt-4 text-center text-[12px] leading-snug">{equation.text}</p>
          </DialogFormSection>
        </FormStack>
      </DialogScrollBody>

      <DialogSaveButton disabled={!canContinue} onClick={handleContinue}>
        Continue
      </DialogSaveButton>
    </>
  );
}

export default NoBallDialog;
