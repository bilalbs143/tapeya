import { getApiErrorMessage } from '@/shared/api/errors';
import { toast } from '@/shared/ui/toast';

type Unwrapable<T> = { unwrap: () => Promise<T> };

/** Crease / match-state mutation helpers — toast + close on success; desk owns navigation. */

export async function saveCreaseMutation(args: {
  updateCrease: (arg: {
    matchId: number;
    nextBatterId?: number;
    nextNonStrikerId?: number;
    nextBowlerId?: number;
  }) => Unwrapable<unknown>;
  matchId: number;
  patch: { nextBatterId?: number; nextNonStrikerId?: number; nextBowlerId?: number };
  onSuccess: () => void;
}): Promise<void> {
  try {
    await args.updateCrease({ matchId: args.matchId, ...args.patch }).unwrap();
    args.onSuccess();
  } catch (error) {
    toast({ title: getApiErrorMessage(error, 'Could not save the crease.'), tone: 'error' });
  }
}

export async function reviseTargetMutation(args: {
  reviseTarget: (arg: {
    matchId: number;
    revisedTarget: number;
    action: 'continue' | 'end_innings';
  }) => Unwrapable<unknown>;
  matchId: number;
  target: number;
  then: 'continue' | 'end_innings';
  onSuccess: () => void;
}): Promise<void> {
  try {
    await args.reviseTarget({ matchId: args.matchId, revisedTarget: args.target, action: args.then }).unwrap();
    args.onSuccess();
    toast({ title: 'Target Revised', tone: 'success' });
  } catch (error) {
    toast({ title: getApiErrorMessage(error, 'Could not revise target.'), tone: 'error' });
  }
}

export async function endInningsMutation(args: {
  endInnings: (arg: {
    matchId: number;
    inningsId: number;
    endReason: string;
    endComments?: string | null | undefined;
    pointsAwardedEach?: boolean | undefined;
  }) => Unwrapable<unknown>;
  matchId: number;
  inningsId: number | null | undefined;
  reason: string;
  comments: string;
  pointsAwardedEach?: boolean | undefined;
  onSuccess: () => void;
}): Promise<void> {
  if (args.inningsId == null) {
    toast({ title: 'No Active Innings to End', tone: 'error' });
    return;
  }
  try {
    await args
      .endInnings({
        matchId: args.matchId,
        inningsId: args.inningsId,
        endReason: args.reason,
        endComments: args.comments || null,
        pointsAwardedEach: args.pointsAwardedEach,
      })
      .unwrap();
    args.onSuccess();
    toast({ title: 'Innings Ended', tone: 'success' });
  } catch (error) {
    toast({ title: getApiErrorMessage(error, 'Could not end innings.'), tone: 'error' });
  }
}

export async function declareResultMutation(args: {
  declareResult: (arg: {
    matchId: number;
    declareResultType: 'award' | 'draw';
    winnerTeamId?: number | null | undefined;
    declareResultNote?: string | null | undefined;
  }) => Unwrapable<unknown>;
  matchId: number;
  declareResultType: 'award' | 'draw';
  winnerTeamId?: number | null | undefined;
  declareResultNote?: string | null | undefined;
  onSuccess: () => void;
}): Promise<void> {
  try {
    await args
      .declareResult({
        matchId: args.matchId,
        declareResultType: args.declareResultType,
        winnerTeamId: args.winnerTeamId,
        declareResultNote: args.declareResultNote,
      })
      .unwrap();
    args.onSuccess();
    toast({ title: 'Result Declared', tone: 'success' });
  } catch (error) {
    toast({ title: getApiErrorMessage(error, 'Could not declare result.'), tone: 'error' });
  }
}

export async function endMatchMutation(args: {
  endMatch: (arg: {
    matchId: number;
    cancelReason: string;
    cancelComments?: string | null | undefined;
    cancelPointsAwardedEach?: boolean | undefined;
  }) => Unwrapable<unknown>;
  matchId: number;
  cancelReason: string;
  cancelComments: string;
  cancelPointsAwardedEach?: boolean | undefined;
  onSuccess: () => void;
}): Promise<void> {
  try {
    await args
      .endMatch({
        matchId: args.matchId,
        cancelReason: args.cancelReason,
        cancelComments: args.cancelComments || null,
        cancelPointsAwardedEach: args.cancelPointsAwardedEach,
      })
      .unwrap();
    args.onSuccess();
    toast({ title: 'Match Cancelled', tone: 'success' });
  } catch (error) {
    toast({ title: getApiErrorMessage(error, 'Could not cancel match.'), tone: 'error' });
  }
}
