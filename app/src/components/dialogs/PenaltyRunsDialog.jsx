import { TeamLogo } from '@/components/TeamLogo';
import { useDialog } from '@/context/DialogContext';
import { usePenaltyRuns } from '@/hooks/usePenaltyRuns';
import { PENALTY_REASON_FALLBACK, penaltySelectionToUiFields } from '@/lib/utils/penaltyRunsUtils';
import { useGetEnumsQuery } from '@/store/api/enumApi';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { DialogFormSection } from '@/ui/form/DialogFormSection';
import { FormStack } from '@/ui/form/FormStack';

/**
 * Penalty runs (Law 41.17) — team, variable amount, reason, live revised score.
 */
export function PenaltyRunsDialog({
  onConfirm,
  battingTeamName,
  bowlingTeamName,
  battingTeamLogo,
  bowlingTeamLogo,
  battingTeamId,
  bowlingTeamId,
  liveScore,
  allInnings = [],
}) {
  const { closeDialog } = useDialog();
  const { data: enums } = useGetEnumsQuery();
  const reasonOptions = enums?.penalty_reason?.length > 0 ? enums.penalty_reason : PENALTY_REASON_FALLBACK;

  const {
    penaltyTeam,
    setPenaltyTeam,
    direction,
    setDirection,
    amount,
    stepAmount,
    runs,
    penaltyReason,
    setPenaltyReason,
    equation,
    canSubmit,
  } = usePenaltyRuns({ battingTeamId, bowlingTeamId, liveScore, allInnings });

  const teamCardClass = (side) => {
    const selected = penaltyTeam === side;
    return `flex flex-1 flex-col items-center gap-2 rounded-[17px] border-2 px-3 py-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
      selected ? 'border-brand bg-surface-raised text-brand' : 'border-border-subtle bg-surface text-white'
    }`;
  };

  const roleClass = (side) => (penaltyTeam === side ? 'text-brand' : 'text-muted');

  const handleDone = () => {
    if (!canSubmit) return;
    onConfirm?.(penaltySelectionToUiFields({ runs, penaltyTeam, penaltyReason }));
    closeDialog();
  };

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>Penalty Runs</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody>
        <FormStack density="compact">
          <DialogFormSection label="Select Team" labelId="penalty-team-label" controlOffset="md">
            <div className="flex gap-3" role="group" aria-labelledby="penalty-team-label">
              <button
                type="button"
                onClick={() => setPenaltyTeam('batting')}
                className={teamCardClass('batting')}
                aria-pressed={penaltyTeam === 'batting'}
              >
                <TeamLogo src={battingTeamLogo} name={battingTeamName} className="h-10 w-10" />
                <span className="text-center text-[11px] font-semibold text-white">{battingTeamName || 'Batting'}</span>
                <span className={`text-[10px] font-medium ${roleClass('batting')}`}>(Batting)</span>
              </button>
              <button
                type="button"
                onClick={() => setPenaltyTeam('bowling')}
                className={teamCardClass('bowling')}
                aria-pressed={penaltyTeam === 'bowling'}
              >
                <TeamLogo src={bowlingTeamLogo} name={bowlingTeamName} className="h-10 w-10" />
                <span className="text-center text-[11px] font-semibold text-white">{bowlingTeamName || 'Bowling'}</span>
                <span className={`text-[10px] font-medium ${roleClass('bowling')}`}>(Bowling)</span>
              </button>
            </div>
          </DialogFormSection>

          <DialogFormSection label="Penalty Runs" controlOffset="md">
            <div className="flex gap-2" role="group" aria-label="Award or deduct runs">
              <button
                type="button"
                onClick={() => setDirection('award')}
                aria-pressed={direction === 'award'}
                className={`focus-visible:ring-brand flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border-2 py-2.5 text-[13px] font-bold transition-colors focus:outline-none focus-visible:ring-2 ${
                  direction === 'award'
                    ? 'border-[#22C55E] bg-[#0D1F14] text-[#22C55E]'
                    : 'border-border-subtle bg-surface text-muted'
                }`}
              >
                <span>+</span> Award
              </button>
              <button
                type="button"
                onClick={() => setDirection('deduct')}
                aria-pressed={direction === 'deduct'}
                className={`focus-visible:ring-brand flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border-2 py-2.5 text-[13px] font-bold transition-colors focus:outline-none focus-visible:ring-2 ${
                  direction === 'deduct'
                    ? 'border-[#EF4444] bg-[#1F0D0D] text-[#EF4444]'
                    : 'border-border-subtle bg-surface text-muted'
                }`}
              >
                <span>−</span> Deduct
              </button>
            </div>

            <div className="mt-3 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => stepAmount(-1)}
                aria-label="Decrease by 1"
                className="bg-surface-raised flex h-11 w-11 items-center justify-center rounded-full text-[20px] font-bold text-white transition-opacity hover:opacity-80 active:opacity-60"
              >
                −
              </button>
              <span className="w-16 text-center text-[28px] font-bold text-white tabular-nums">{amount}</span>
              <button
                type="button"
                onClick={() => stepAmount(1)}
                aria-label="Increase by 1"
                className="bg-surface-raised flex h-11 w-11 items-center justify-center rounded-full text-[20px] font-bold text-white transition-opacity hover:opacity-80 active:opacity-60"
              >
                +
              </button>
            </div>

            <p className="text-muted mt-3 text-center text-[12px] leading-snug">{equation.text}</p>
          </DialogFormSection>

          <DialogFormSection label="Reason" controlOffset="md">
            <div className="flex flex-col gap-2">
              {reasonOptions.map((opt) => {
                const selected = penaltyReason === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPenaltyReason(opt.value)}
                    aria-pressed={selected}
                    className={`focus-visible:ring-brand rounded-lg border px-3 py-2.5 text-left text-[12px] font-medium transition-colors focus:outline-none focus-visible:ring-2 ${
                      selected ? 'border-brand bg-surface-raised text-brand' : 'bg-surface border-[#141412] text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </DialogFormSection>
        </FormStack>
      </DialogScrollBody>

      <DialogSaveButton onClick={handleDone} disabled={!canSubmit}>
        Done
      </DialogSaveButton>
    </>
  );
}

export default PenaltyRunsDialog;
