import { useState } from 'react';

import { useDialog } from '@/context/DialogContext';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { useStoreAdditionalRunsMutation } from '@/store/api/matchApi';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';

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

      <DialogScrollBody className="flex flex-col gap-4">
        <div>
          <label htmlFor="additional-runs-input" className="text-[13px] font-medium text-white">
            Enter Runs
          </label>
          <input
            id="additional-runs-input"
            type="text"
            inputMode="numeric"
            value={runsInput}
            onChange={(e) => setRunsInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
            placeholder="Enter Additional Runs"
            className="bg-surface-raised placeholder:text-muted/47 focus-visible:ring-brand mt-2 w-full rounded-[8px] border border-[#141412] px-4 py-3 text-[14px] text-white focus:ring-2 focus:outline-none"
          />
          {runsInput !== '' && !runsValid && <p className="mt-1.5 text-[11px] text-red-400">Enter a value between 1 and 999.</p>}
        </div>
      </DialogScrollBody>

      <DialogSaveButton disabled={!canSubmit} onClick={handleAdd}>
        {isLoading ? 'Adding…' : 'Add Runs'}
      </DialogSaveButton>
    </>
  );
}

export default AdditionalRunsDialog;
