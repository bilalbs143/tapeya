import { useState } from 'react';

import { RunPickerRow } from '@/components/scoring/RunPickerRow';
import { useDialog } from '@/context/DialogContext';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';

const TITLES = {
  bye: 'Bye',
  lb: 'Leg-Bye',
};

/**
 * Bye / Leg-bye run picker — dedicated titled dialog with circular 0–6 buttons (no equation).
 *
 * @param {'bye'|'lb'} [extraType]
 * @param {Function} [onSelect]  Called with runs when user taps Continue
 */
export function ExtraRunsDialog({ extraType, onSelect }) {
  const { closeDialog } = useDialog();
  const [selectedRuns, setSelectedRuns] = useState(0);
  const title = TITLES[extraType] ?? 'Extra Runs';

  const handleContinue = () => {
    onSelect?.(selectedRuns);
    closeDialog();
  };

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>{title}</DialogTitle>
      </DialogHeaderRow>
      <DialogScrollBody className="flex flex-col gap-4">
        <p className="text-[13px] font-medium text-white">Select Extra Run</p>
        <RunPickerRow className="px-1" value={selectedRuns} onChange={setSelectedRuns} />
      </DialogScrollBody>
      <DialogSaveButton type="button" onClick={handleContinue}>
        Continue
      </DialogSaveButton>
    </>
  );
}

export default ExtraRunsDialog;
