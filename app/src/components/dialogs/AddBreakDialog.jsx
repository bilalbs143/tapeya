import { useState } from 'react';

import { useDialog } from '@/context/DialogContext';
import { useMatchAdmin } from '@/hooks/useMatchAdmin';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { useGetEnumsQuery } from '@/store/api/enumApi';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { DialogFormSection } from '@/ui/form/DialogFormSection';
import { FormStack } from '@/ui/form/FormStack';
import { RadioOptionList } from '@/ui/RadioOptionList';
import { Textarea } from '@/ui/Textarea';

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

      <DialogScrollBody>
        <FormStack density="compact">
          <DialogFormSection label="Select Break Type" controlOffset="md">
            <RadioOptionList
              className="max-h-64 overflow-y-auto"
              options={breakOptions}
              value={breakType}
              onChange={setBreakType}
              ariaLabel="Break Type"
            />
          </DialogFormSection>

          <DialogFormSection label="Notes" controlOffset="sm">
            <Textarea
              id="add-break-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write Here..."
              rows={3}
              className="min-h-0 resize-none"
            />
          </DialogFormSection>
        </FormStack>
      </DialogScrollBody>

      <DialogSaveButton disabled={!canSubmit} onClick={handleDone}>
        {isStoringBreak ? 'Saving…' : 'Done'}
      </DialogSaveButton>
    </>
  );
}

export default AddBreakDialog;
