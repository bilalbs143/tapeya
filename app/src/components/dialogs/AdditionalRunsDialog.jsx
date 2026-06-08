import { useState } from 'react';

import { useDialog } from '@/context/DialogContext';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { useStoreAdditionalRunsMutation } from '@/store/api/matchApi';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { DialogFormSection } from '@/ui/form/DialogFormSection';
import { FormStack } from '@/ui/form/FormStack';
import { Input } from '@/ui/Input';

/**
 * Action menu → Add Additional Runs.
 *
 * @param {string} matchId
 * @param {string|number} inningsId
 */
export function AdditionalRunsDialog({ matchId, inningsId }) {
  const { closeDialog } = useDialog();
  const toast = useToast();
  const [runsInput, setRunsInput] = useState('');
  const [storeAdditionalRuns, { isLoading }] = useStoreAdditionalRunsMutation();

  const parsedRuns = Number.parseInt(runsInput, 10);
  const runsValid = Number.isFinite(parsedRuns) && parsedRuns > 0 && parsedRuns <= 999;
  const canSubmit = runsValid && !isLoading;
  const runsError = runsInput !== '' && !runsValid ? 'Enter a value between 1 and 999.' : undefined;

  const handleAdd = async () => {
    if (!canSubmit) return;
    try {
      await storeAdditionalRuns({ matchId, inningsId, runs: parsedRuns }).unwrap();
      toast.success('Additional runs added.');
      closeDialog();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not add runs. Please try again.'));
    }
  };

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>Add Additional Runs</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody>
        <FormStack density="compact">
          <DialogFormSection label="Enter Runs" controlOffset="sm">
            <Input
              id="additional-runs-input"
              type="text"
              inputMode="numeric"
              value={runsInput}
              onChange={(e) => setRunsInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
              placeholder="Enter Additional Runs"
              error={runsError}
            />
          </DialogFormSection>
        </FormStack>
      </DialogScrollBody>

      <DialogSaveButton disabled={!canSubmit} onClick={handleAdd}>
        {isLoading ? 'Adding…' : 'Add Runs'}
      </DialogSaveButton>
    </>
  );
}

export default AdditionalRunsDialog;
