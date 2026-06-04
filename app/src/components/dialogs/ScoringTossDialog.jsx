import { useState } from 'react';

import { TeamLogo } from '@/components/TeamLogo';
import { useDialog } from '@/context/DialogContext';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { ToggleGroup, ToggleGroupItem } from '@/ui/ToggleGroup';

/**
 * Body-only toss picker for live scoring (home/away team keys).
 * DialogManager provides the BaseDialog wrapper.
 */
export function ScoringTossDialog({ homeTeamName, awayTeamName, homeTeamLogo, awayTeamLogo, onSave }) {
  const { closeDialog } = useDialog();
  const [tossWinner, setTossWinner] = useState('');
  const [tossDecision, setTossDecision] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const canSave = !!tossWinner && !!tossDecision && !isSaving;

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    try {
      await onSave?.({ tossWinner, tossDecision });
      closeDialog();
    } catch {
      // Parent surfaces API errors; keep dialog open to retry.
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <DialogHeaderRow hideClose>
        <DialogTitle className={dialogPrimaryTitleClass}>Who Won the Toss?</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody className="flex flex-col gap-6">
        <div className="flex gap-3">
          {[
            { key: 'home', label: homeTeamName || 'Home Team', logo: homeTeamLogo },
            { key: 'away', label: awayTeamName || 'Away Team', logo: awayTeamLogo },
          ].map(({ key, label, logo }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTossWinner(key)}
              className={`flex flex-1 flex-col items-center justify-center gap-2 rounded-[17px] border-2 px-4 py-4 transition-colors focus:outline-none ${
                tossWinner === key ? 'border-[#DA9811] bg-[#DA9811] text-white' : 'border-[#141412] bg-[#141412] text-white'
              }`}
            >
              <TeamLogo name={label} logo={logo} variant="dialog" />
              <span className="text-[14px] font-bold uppercase">{label}</span>
            </button>
          ))}
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

      <DialogSaveButton onClick={handleSave} disabled={!canSave}>
        {isSaving ? 'Saving toss…' : 'Save Toss'}
      </DialogSaveButton>
    </>
  );
}

export default ScoringTossDialog;
