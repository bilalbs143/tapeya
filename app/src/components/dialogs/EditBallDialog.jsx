import { useState } from 'react';

import { RunPickerRow } from '@/components/scoring/RunPickerRow';
import { useDialog } from '@/context/DialogContext';
import { buildBallRunsUpdatePayload, editBallDialogTitle, getBallEditableRunsValue } from '@/lib/utils/editBallUtils';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';

/**
 * Correct runs on an existing delivery (PATCH …/balls/{ball}).
 *
 * @param {object} ball UI ball from scorecard history
 * @param {string} [ballLabel] e.g. "12.3"
 * @param {Function} onSave Receives API PATCH payload
 */
export function EditBallDialog({ ball, ballLabel, onSave }) {
  const { closeDialog } = useDialog();
  const initial = getBallEditableRunsValue(ball);
  const [selectedRuns, setSelectedRuns] = useState(initial);

  const handleSave = () => {
    const payload = buildBallRunsUpdatePayload(ball, selectedRuns);
    if (!payload) return;
    onSave?.(payload);
    closeDialog();
  };

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>{editBallDialogTitle(ball)}</DialogTitle>
      </DialogHeaderRow>
      <DialogScrollBody className="flex flex-col gap-4">
        {ballLabel ? <p className="text-muted text-center text-[13px] font-medium">Ball {ballLabel}</p> : null}
        <p className="text-center text-[13px] font-medium text-white">Select Runs</p>
        <RunPickerRow className="px-1" value={selectedRuns} onChange={setSelectedRuns} />
      </DialogScrollBody>
      <DialogSaveButton type="button" onClick={handleSave} disabled={!ball}>
        Save
      </DialogSaveButton>
    </>
  );
}

export default EditBallDialog;
