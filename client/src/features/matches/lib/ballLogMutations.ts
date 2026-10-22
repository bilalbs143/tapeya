import { getApiErrorMessage } from '@/shared/api/errors';
import { confirm } from '@/shared/dialogs/helpers';
import { toast } from '@/shared/ui/toast';

import type { BallLogEntry } from './ballLog';
import { buildUpdateBallPayload, type EditBallFormPatch } from './editBallPayload';

type Unwrapable<T> = { unwrap: () => Promise<T> };

/** Ball-log edit/delete — confirm + toast; desk owns editing state. */

export async function saveEditedBall(args: {
  matchId: number;
  inningsId: number;
  entry: BallLogEntry;
  patch: EditBallFormPatch;
  updateBall: (arg: {
    matchId: number;
    inningsId: number;
    ballId: number;
    payload: NonNullable<ReturnType<typeof buildUpdateBallPayload>>;
  }) => Unwrapable<unknown>;
  onSuccess: () => void;
}): Promise<void> {
  const payload = buildUpdateBallPayload(args.entry.snapshot, args.patch);
  if (!payload) return;
  try {
    await args
      .updateBall({
        matchId: args.matchId,
        inningsId: args.inningsId,
        ballId: args.entry.id,
        payload,
      })
      .unwrap();
    toast({ title: 'Ball Updated' });
    args.onSuccess();
  } catch (error) {
    toast({ title: getApiErrorMessage(error, 'Ball not updated — try again.'), tone: 'error' });
  }
}

export async function deleteLoggedBall(args: {
  matchId: number;
  inningsId: number;
  entry: BallLogEntry;
  overNo: number;
  deleteBall: (arg: { matchId: number; inningsId: number; ballId: number }) => Unwrapable<unknown>;
}): Promise<void> {
  const ballRef = args.entry.ballInOver != null ? `${args.overNo}.${args.entry.ballInOver}` : String(args.overNo);
  const ok = await confirm({
    title: 'Delete Ball?',
    message: `Ball ${ballRef} will be removed and the innings score recalculated. This cannot be undone.`,
    confirmLabel: 'Delete',
    tone: 'danger',
  });
  if (!ok) return;
  try {
    await args.deleteBall({ matchId: args.matchId, inningsId: args.inningsId, ballId: args.entry.id }).unwrap();
    toast({ title: 'Ball Deleted' });
  } catch (error) {
    toast({ title: getApiErrorMessage(error, 'Ball not deleted — try again.'), tone: 'error' });
  }
}
