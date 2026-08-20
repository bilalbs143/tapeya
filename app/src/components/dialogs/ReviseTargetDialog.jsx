import { useState } from 'react';

import { useDialog } from '@/context/DialogContext';
import { useMatchAdmin } from '@/hooks/useMatchAdmin';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { DialogFormSection } from '@/ui/form/DialogFormSection';
import { FormActions } from '@/ui/form/FormActions';
import { FormStack } from '@/ui/form/FormStack';
import { Input } from '@/ui/Input';
import { Loader } from '@/ui/Loader';

/**
 * Revise 2nd innings chase target (DLS) — set new target, then continue or end innings.
 *
 * @param {string} matchId
 * @param {number} [currentTarget] Current chase target shown to the scorer
 * @param {() => void} [onInningsEnded] When action is end_innings and API succeeds
 */
export function ReviseTargetDialog({ matchId, currentTarget, onInningsEnded }) {
  const { closeDialog } = useDialog();
  const toast = useToast();
  const { reviseTarget, isRevisingTarget } = useMatchAdmin({ matchId });

  const [revisedTarget, setRevisedTarget] = useState(
    currentTarget != null && Number.isFinite(currentTarget) ? String(currentTarget) : '',
  );
  const [pendingAction, setPendingAction] = useState('');

  const parsedTarget = Number.parseInt(revisedTarget, 10);
  const targetValid = Number.isFinite(parsedTarget) && parsedTarget >= 1;
  const targetError = revisedTarget !== '' && !targetValid ? 'Enter a whole number between 1 and 999.' : undefined;

  const submit = async (action) => {
    if (!targetValid || isRevisingTarget) return;
    setPendingAction(action);
    try {
      await reviseTarget({ revised_target: parsedTarget, action });
      closeDialog();
      if (action === 'end_innings') {
        toast.success('Target revised and innings ended.');
        onInningsEnded?.();
      } else {
        toast.success('Target revised. Innings continues.');
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not revise target. Please try again.'));
    } finally {
      setPendingAction('');
    }
  };

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>Revise 2nd Innings Target</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody>
        <FormStack density="compact">
          {currentTarget != null ? (
            <p className="text-muted text-[13px]">
              Current target: <span className="text-brand font-bold">{currentTarget}</span>
            </p>
          ) : null}

          <DialogFormSection label="New Target (Runs to Win)" controlOffset="sm">
            <Input
              id="revised-target-input"
              type="number"
              min={1}
              max={999}
              inputMode="numeric"
              value={revisedTarget}
              onChange={(e) => setRevisedTarget(e.target.value)}
              error={targetError}
            />
          </DialogFormSection>

          <DialogFormSection label="How Do You Want to Proceed?" controlOffset="sm">
            <FormActions className="flex-row gap-3 pt-0">
              <button
                type="button"
                disabled={!targetValid || isRevisingTarget}
                onClick={() => submit('continue')}
                className="border-border-subtle bg-surface focus-visible:ring-brand enabled:active:bg-surface-raised flex flex-1 items-center justify-center gap-2 rounded-[10px] border-2 px-3 py-3 text-[12px] font-bold tracking-wide text-white uppercase transition-colors focus:outline-none focus-visible:ring-2 disabled:opacity-40"
              >
                {pendingAction === 'continue' && isRevisingTarget ? <Loader size="xs" /> : null}
                {pendingAction === 'continue' && isRevisingTarget ? 'Saving…' : 'Continue Innings'}
              </button>
              <button
                type="button"
                disabled={!targetValid || isRevisingTarget}
                onClick={() => submit('end_innings')}
                className="border-border-subtle bg-surface focus-visible:ring-brand enabled:active:bg-surface-raised flex flex-1 items-center justify-center gap-2 rounded-[10px] border-2 px-3 py-3 text-[12px] font-bold tracking-wide text-white uppercase transition-colors focus:outline-none focus-visible:ring-2 disabled:opacity-40"
              >
                {pendingAction === 'end_innings' && isRevisingTarget ? <Loader size="xs" /> : null}
                {pendingAction === 'end_innings' && isRevisingTarget ? 'Saving…' : 'End Innings'}
              </button>
            </FormActions>
          </DialogFormSection>
        </FormStack>
      </DialogScrollBody>
    </>
  );
}

export default ReviseTargetDialog;
