import { useState } from 'react';

import { useDialog } from '@/context/DialogContext';
import { useMatchAdmin } from '@/hooks/useMatchAdmin';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { useGetEnumsQuery } from '@/store/api/enumApi';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { RadioOptionList } from '@/ui/RadioOptionList';

/**
 * Action menu → Add Breaks.
 *
 * @param {string} matchId
 * @param {string|number|null} [inningsId] Current live innings, if any
 */
export function AddBreakDialog({ matchId, inningsId = null }) {
  const { closeDialog } = useDialog();
  const toast = useToast();
  const { data: enums } = useGetEnumsQuery();
  const { storeBreak, isStoringBreak } = useMatchAdmin({ matchId });

  const breakOptions = enums?.match_break_type ?? [];

  const [breakType, setBreakType] = useState('');
  const [notes, setNotes] = useState('');

  const canSubmit = Boolean(breakType) && !isStoringBreak;

  const handleDone = async () => {
    if (!canSubmit) return;
    try {
      await storeBreak({
        break_type: breakType,
        notes: notes.trim() || null,
        innings_id: inningsId ?? undefined,
      });
      toast.success('Break recorded.');
      closeDialog();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not record break. Please try again.'));
    }
  };

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>Add Breaks</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody className="flex flex-col gap-4">
        <div>
          <p className="text-[13px] font-medium text-white">Select Break Type</p>
          <RadioOptionList
            className="mt-3 max-h-64 overflow-y-auto"
            options={breakOptions}
            value={breakType}
            onChange={setBreakType}
            ariaLabel="Break Type"
          />
        </div>

        <div>
          <label htmlFor="add-break-notes" className="text-[13px] font-medium text-white">
            Notes
          </label>
          <textarea
            id="add-break-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write Here..."
            rows={3}
            className="bg-surface-raised placeholder:text-muted/47 focus-visible:ring-brand mt-2 w-full resize-none rounded-[8px] border border-[#141412] px-4 py-3 text-[14px] text-white focus:ring-2 focus:outline-none"
          />
        </div>
      </DialogScrollBody>

      <DialogSaveButton disabled={!canSubmit} onClick={handleDone}>
        {isStoringBreak ? 'Saving…' : 'Done'}
      </DialogSaveButton>
    </>
  );
}

export default AddBreakDialog;
