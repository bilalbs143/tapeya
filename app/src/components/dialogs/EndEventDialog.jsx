import { useState } from 'react';

import { useDialog } from '@/context/DialogContext';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { RadioOptionList } from '@/ui/RadioOptionList';
import { Switch } from '@/ui/Switch';

/**
 * Shared base for EndInningsDialog and EndMatchDialog.
 *
 * @param {string}   title              Dialog title
 * @param {string}   reasonLabel        Label above the reason list
 * @param {string}   reasonAriaLabel    Accessible label for the radio group
 * @param {string}   commentsId         `id` for the textarea (for `<label htmlFor>`)
 * @param {{ value: string, label: string }[]} reasonOptions
 * @param {Function} onSubmit           async (reason, comments, pointsEach) => void
 * @param {string}   [submitLabel='Done']
 * @param {string}   [savingLabel='Saving…']
 */
export function EndEventDialog({
  title,
  reasonLabel,
  reasonAriaLabel,
  commentsId,
  reasonOptions,
  onSubmit,
  submitLabel = 'Done',
  savingLabel = 'Saving…',
}) {
  const { closeDialog } = useDialog();
  const toast = useToast();

  const [reason, setReason] = useState('');
  const [comments, setComments] = useState('');
  const [pointsEach, setPointsEach] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const canSubmit = Boolean(reason) && !isSaving;

  const handleDone = async () => {
    if (!canSubmit) return;
    setIsSaving(true);
    try {
      await onSubmit(reason, comments.trim() || null, pointsEach);
      closeDialog();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not complete this action. Please try again.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>{title}</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody className="flex flex-col gap-4">
        <div>
          <p className="text-[13px] font-medium text-white">{reasonLabel}</p>
          <RadioOptionList
            className="mt-3"
            options={reasonOptions}
            value={reason}
            onChange={setReason}
            ariaLabel={reasonAriaLabel}
          />
        </div>

        <div>
          <label htmlFor={commentsId} className="text-[13px] font-medium text-white">
            Comments
          </label>
          <textarea
            id={commentsId}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Write Here"
            rows={3}
            className="bg-surface-raised placeholder:text-muted/47 focus-visible:ring-brand mt-2 w-full resize-none rounded-[8px] border border-[#141412] px-4 py-3 text-[14px] text-white focus:ring-2 focus:outline-none"
          />
        </div>

        <div className="bg-surface flex items-center justify-between gap-3 rounded-[10px] border border-[#141412] px-4 py-3">
          <span className="text-muted text-[12px] leading-snug">Do you want to give 1/1 point to each team.</span>
          <Switch checked={pointsEach} onCheckedChange={setPointsEach} aria-label="Award One Point to Each Team" />
        </div>
      </DialogScrollBody>

      <DialogSaveButton disabled={!canSubmit} onClick={handleDone}>
        {isSaving ? savingLabel : submitLabel}
      </DialogSaveButton>
    </>
  );
}
