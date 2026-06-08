import { useState } from 'react';

import { TeamLogo } from '@/components/TeamLogo';
import { useDialog } from '@/context/DialogContext';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { DialogFormSection } from '@/ui/form/DialogFormSection';
import { FormStack } from '@/ui/form/FormStack';
import { ToggleGroup, ToggleGroupItem } from '@/ui/ToggleGroup';

/**
 * Body-only — DialogManager provides the BaseDialog wrapper.
 * Owns toss winner/decision state locally.
 * Calls onStartScoring({ tossWinner, tossDecision }) on confirm.
 * Tracks its own saving state so the disabled prop isn't needed.
 */
export function TossDialog({ teamAName, teamBName, teamALogo, teamBLogo, onStartScoring }) {
  const { closeDialog } = useDialog();
  const [tossWinner, setTossWinner] = useState('');
  const [tossDecision, setTossDecision] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  const canConfirm = !!tossWinner && !!tossDecision;

  const handleConfirm = async () => {
    if (!canConfirm || isStarting) return;
    setIsStarting(true);
    try {
      await onStartScoring?.({ tossWinner, tossDecision });
      closeDialog();
    } catch {
      // Parent shows toast; keep dialog open to retry.
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>Who Won the Toss?</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody>
        <FormStack>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setTossWinner('A')}
              className={`flex flex-1 flex-col items-center justify-center gap-2 rounded-[17px] border-2 px-4 py-4 transition-colors focus:outline-none ${
                tossWinner === 'A' ? 'border-brand bg-brand text-white' : 'bg-surface border-[#141412] text-white'
              }`}
            >
              <TeamLogo name={teamAName} logo={teamALogo} variant="dialog" />
              <span className="text-[14px] font-bold uppercase">{teamAName || 'Team A'}</span>
            </button>
            <button
              type="button"
              onClick={() => setTossWinner('B')}
              className={`flex flex-1 flex-col items-center justify-center gap-2 rounded-[17px] border-2 px-4 py-4 transition-colors focus:outline-none ${
                tossWinner === 'B' ? 'border-brand bg-brand text-white' : 'bg-surface border-[#141412] text-white'
              }`}
            >
              <TeamLogo name={teamBName} logo={teamBLogo} variant="dialog" />
              <span className="text-[14px] font-bold uppercase">{teamBName || 'Team B'}</span>
            </button>
          </div>

          <DialogFormSection label="Decided To?" controlOffset="sm">
            <ToggleGroup type="single" value={tossDecision} onValueChange={(v) => v && setTossDecision(v)} className="flex gap-2">
              <ToggleGroupItem value="bat" aria-label="Bat">
                Bat
              </ToggleGroupItem>
              <ToggleGroupItem value="bowl" aria-label="Bowl">
                Bowl
              </ToggleGroupItem>
            </ToggleGroup>
          </DialogFormSection>
        </FormStack>
      </DialogScrollBody>

      <DialogSaveButton disabled={!canConfirm || isStarting} onClick={handleConfirm}>
        {isStarting ? 'Creating…' : 'Start Scoring'}
      </DialogSaveButton>
    </>
  );
}

export default TossDialog;
