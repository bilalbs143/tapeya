import { useState } from 'react';

import { useDialog } from '@/context/DialogContext';
import { useMatchAdmin } from '@/hooks/useMatchAdmin';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogScrollBody, DialogTitle } from '@/ui/Dialog';

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

      <DialogScrollBody className="flex flex-col gap-4">
        {currentTarget != null ? (
          <p className="text-muted text-[13px]">
            Current target: <span className="text-brand font-bold">{currentTarget}</span>
          </p>
        ) : null}

        <div>
          <label htmlFor="revised-target-input" className="text-[13px] font-medium text-white">
            New Target (Runs to Win)
          </label>
          <input
            id="revised-target-input"
            type="number"
            min={1}
            max={999}
            inputMode="numeric"
            value={revisedTarget}
            onChange={(e) => setRevisedTarget(e.target.value)}
            className="bg-surface-raised placeholder:text-muted/47 focus-visible:ring-brand mt-2 w-full rounded-[8px] border border-[#141412] px-4 py-3 text-[14px] text-white focus:ring-2 focus:outline-none"
          />
          {revisedTarget !== '' && !targetValid && (
            <p className="mt-1 text-[12px] text-red-400">Enter a whole number between 1 and 999.</p>
          )}
        </div>

        <p className="text-[13px] font-medium text-white">How Do You Want to Proceed?</p>
        <div className="flex gap-3">
          <button
            type="button"
            disabled={!targetValid || isRevisingTarget}
            onClick={() => submit('continue')}
            className="border-border-subtle bg-surface focus-visible:ring-brand enabled:active:bg-surface-raised flex flex-1 items-center justify-center rounded-[10px] border-2 px-3 py-3 text-[12px] font-bold tracking-wide text-white uppercase transition-colors focus:outline-none focus-visible:ring-2 disabled:opacity-40"
          >
            {pendingAction === 'continue' && isRevisingTarget ? 'Saving…' : 'Continue Innings'}
          </button>
          <button
            type="button"
            disabled={!targetValid || isRevisingTarget}
            onClick={() => submit('end_innings')}
            className="border-border-subtle bg-surface focus-visible:ring-brand enabled:active:bg-surface-raised flex flex-1 items-center justify-center rounded-[10px] border-2 px-3 py-3 text-[12px] font-bold tracking-wide text-white uppercase transition-colors focus:outline-none focus-visible:ring-2 disabled:opacity-40"
          >
            {pendingAction === 'end_innings' && isRevisingTarget ? 'Saving…' : 'End Innings'}
          </button>
        </div>
      </DialogScrollBody>
    </>
  );
}

export default ReviseTargetDialog;
