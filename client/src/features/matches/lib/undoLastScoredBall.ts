import type { MutableRefObject } from 'react';

import { getApiErrorMessage } from '@/shared/api/errors';
import { toast } from '@/shared/ui/toast';

import { endSave, tryBeginSave } from './scoringSaveGate';

type DeleteLastBallFn = (arg: { matchId: number; inningsId: number }) => {
  unwrap: () => Promise<unknown>;
};

/**
 * Shared undo-last-ball path (pad + wicket summary).
 * Returns a promise that settles after the mutation attempt (or immediately if gated).
 */
export function undoLastScoredBall(args: {
  matchId: number;
  inningsId: number | null | undefined;
  savingRef: MutableRefObject<boolean>;
  deleteLastBall: DeleteLastBallFn;
  onSuccess?: (() => void) | undefined;
}): Promise<void> {
  const { matchId, inningsId, savingRef, deleteLastBall, onSuccess } = args;
  if (!inningsId || !tryBeginSave(savingRef)) return Promise.resolve();

  return deleteLastBall({ matchId, inningsId })
    .unwrap()
    .then(() => {
      onSuccess?.();
    })
    .catch((error: unknown) => {
      toast({ title: getApiErrorMessage(error, 'Undo failed.'), tone: 'error' });
    })
    .finally(() => {
      endSave(savingRef);
    });
}
