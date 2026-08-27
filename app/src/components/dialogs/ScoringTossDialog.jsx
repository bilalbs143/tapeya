import { useState } from 'react';

import { TeamLogo } from '@/components/TeamLogo';
import { useDialog } from '@/context/DialogContext';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { DialogFormSection } from '@/ui/form/DialogFormSection';
import { FormStack } from '@/ui/form/FormStack';
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

      <DialogScrollBody>
        <FormStack>
          <div className="flex gap-3">
            {[
              { key: 'home', label: homeTeamName || 'Home Team', logo: homeTeamLogo },
              { key: 'away', label: awayTeamName || 'Away Team', logo: awayTeamLogo },
            ].map(({ key, label, logo }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTossWinner(key)}
                className={`flex flex-1 flex-col items-center gap-1 rounded-[17px] border-2 px-3 py-4 transition-colors focus:outline-none ${
                  tossWinner === key ? 'border-brand bg-brand text-white' : 'bg-surface border-[#141412] text-white'
                }`}
              >
                <div className="flex w-full items-center justify-center">
                  <TeamLogo name={label} logo={logo} variant="match" />
                </div>
                <span className="flex min-h-[2.5rem] w-full items-center justify-center px-1 text-center text-[14px] leading-tight font-bold uppercase">
                  {label}
                </span>
              </button>
            ))}
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

      <DialogSaveButton onClick={handleSave} disabled={!canSave} loading={isSaving}>
        {isSaving ? 'Saving toss…' : 'Save Toss'}
      </DialogSaveButton>
    </>
  );
}

export default ScoringTossDialog;
