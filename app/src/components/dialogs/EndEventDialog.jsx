import { useState } from 'react';

import { useDialog } from '@/context/DialogContext';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { DialogFormSection } from '@/ui/form/DialogFormSection';
import { FormStack } from '@/ui/form/FormStack';
import { RadioOptionList } from '@/ui/RadioOptionList';
import { Switch } from '@/ui/Switch';
import { Textarea } from '@/ui/Textarea';

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

      <DialogScrollBody>
        <FormStack density="compact">
          <DialogFormSection label={reasonLabel} controlOffset="md">
            <RadioOptionList options={reasonOptions} value={reason} onChange={setReason} ariaLabel={reasonAriaLabel} />
          </DialogFormSection>

          <DialogFormSection label="Comments" controlOffset="sm">
            <Textarea
              id={commentsId}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Write Here"
              rows={3}
              className="min-h-0 resize-none"
            />
          </DialogFormSection>

          <div className="bg-surface flex items-center justify-between gap-3 rounded-[10px] border border-[#141412] px-4 py-3">
            <span className="text-muted text-[12px] leading-snug">Do you want to give 1/1 point to each team.</span>
            <Switch checked={pointsEach} onCheckedChange={setPointsEach} aria-label="Award One Point to Each Team" />
          </div>
        </FormStack>
      </DialogScrollBody>

      <DialogSaveButton disabled={!canSubmit} loading={isSaving} onClick={handleDone}>
        {isSaving ? savingLabel : submitLabel}
      </DialogSaveButton>
    </>
  );
}
