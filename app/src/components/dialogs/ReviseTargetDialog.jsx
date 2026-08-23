import { useState } from 'react';

import { useDialog } from '@/context/DialogContext';
import { useMatchAdmin } from '@/hooks/useMatchAdmin';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { Button } from '@/ui/Button';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { DialogFormSection } from '@/ui/form/DialogFormSection';
import { FormStack } from '@/ui/form/FormStack';
import { Input } from '@/ui/Input';

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

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-w-0 flex-1"
              disabled={!targetValid || isRevisingTarget}
              loading={pendingAction === 'end_innings' && isRevisingTarget}
              onClick={() => submit('end_innings')}
            >
              End Innings
            </Button>
            <Button
              type="button"
              variant="orange"
              size="sm"
              className="min-w-0 flex-1"
              disabled={!targetValid || isRevisingTarget}
              loading={pendingAction === 'continue' && isRevisingTarget}
              onClick={() => submit('continue')}
            >
              Continue Innings
            </Button>
          </div>
        </FormStack>
      </DialogScrollBody>
    </>
  );
}

export default ReviseTargetDialog;
