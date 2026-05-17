import { useState } from 'react';

import { useDialog } from '@/context/DialogContext';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { ToggleGroup, ToggleGroupItem } from '@/ui/ToggleGroup';

const teamMatchIcon = `${CLOUDFRONT_APP_BASE}/images/icons/team-match-icon.svg`;

/**
 * Body-only — DialogManager provides the BaseDialog wrapper.
 * Owns toss winner/decision state locally.
 * Calls onStartScoring({ tossWinner, tossDecision }) on confirm.
 * Tracks its own saving state so the disabled prop isn't needed.
 */
export function TossDialog({ teamAName, teamBName, onStartScoring }) {
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

      <DialogScrollBody className="flex flex-col gap-6">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setTossWinner('A')}
            className={`flex flex-1 flex-col items-center justify-center gap-2 rounded-[17px] border-2 px-4 py-4 transition-colors focus:outline-none ${
              tossWinner === 'A' ? 'border-[#DA9811] bg-[#DA9811] text-white' : 'border-[#141412] bg-[#141412] text-white'
            }`}
          >
            <img src={teamMatchIcon} alt="" className="h-8 w-8 shrink-0" aria-hidden />
            <span className="text-[14px] font-bold uppercase">{teamAName || 'Team A'}</span>
          </button>
          <button
            type="button"
            onClick={() => setTossWinner('B')}
            className={`flex flex-1 flex-col items-center justify-center gap-2 rounded-[17px] border-2 px-4 py-4 transition-colors focus:outline-none ${
              tossWinner === 'B' ? 'border-[#DA9811] bg-[#DA9811] text-white' : 'border-[#141412] bg-[#141412] text-white'
            }`}
          >
            <img src={teamMatchIcon} alt="" className="h-8 w-8 shrink-0" aria-hidden />
            <span className="text-[14px] font-bold uppercase">{teamBName || 'Team B'}</span>
          </button>
        </div>

        <div>
          <p className="text-[14px] font-medium text-white">Decided To?</p>
          <ToggleGroup
            type="single"
            value={tossDecision}
            onValueChange={(v) => v && setTossDecision(v)}
            className="mt-2 flex gap-2"
          >
            <ToggleGroupItem value="bat" aria-label="Bat">
              Bat
            </ToggleGroupItem>
            <ToggleGroupItem value="bowl" aria-label="Bowl">
              Bowl
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </DialogScrollBody>

      <DialogSaveButton disabled={!canConfirm || isStarting} onClick={handleConfirm}>
        {isStarting ? 'Creating…' : 'Start Scoring'}
      </DialogSaveButton>
    </>
  );
}

export default TossDialog;
