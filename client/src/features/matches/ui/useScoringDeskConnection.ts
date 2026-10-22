import { useCallback } from 'react';
import type { useSearchParams } from 'react-router-dom';

import { setScoreTab } from '../lib/scoreTabs';
import type { StoreBallPayload } from '../lib/storeBallPayload';
import { useOfflineBallQueue } from '../lib/useOfflineBallQueue';
import { type ScorerConnection, useScorerConnection } from '../lib/useScorerConnection';

type StoreBallFn = (arg: { matchId: number; inningsId: number; payload: StoreBallPayload }) => {
  unwrap: () => Promise<unknown>;
};

export type ScoringDeskConnection = {
  conn: ScorerConnection;
  /** Offline / flush conflict — blocks new submits until discard/review. */
  queueConflict: boolean;
  enqueueBall: (arg: { inningsId: number; payload: StoreBallPayload }) => unknown;
};

/**
 * Offline ball queue + scorer connection face.
 * Stale “Review” switches to the Balls tab; Discard clears queue and refetches state/scorecard.
 */
export function useScoringDeskConnection(args: {
  matchId: number;
  storeBall: StoreBallFn;
  oversDisplay: string | null;
  runs: number;
  wickets: number;
  setSearchParams: ReturnType<typeof useSearchParams>[1];
  refetchState: () => void;
  refetchScorecard: () => void;
}): ScoringDeskConnection {
  const { matchId, storeBall, oversDisplay, runs, wickets, setSearchParams, refetchState, refetchScorecard } = args;

  const {
    queued: queuedBalls,
    conflict: queueConflict,
    enqueue: enqueueBall,
    discard: discardBallQueue,
  } = useOfflineBallQueue(matchId, storeBall);

  const onReviewBalls = useCallback(() => {
    setScoreTab(setSearchParams, 'balls');
  }, [setSearchParams]);

  const discardQueueAndReload = useCallback(() => {
    discardBallQueue();
    refetchState();
    refetchScorecard();
  }, [discardBallQueue, refetchScorecard, refetchState]);

  const conn = useScorerConnection({
    matchId,
    oversDisplay,
    runs,
    wickets,
    onReviewBalls,
    queuedCount: queuedBalls,
    queueConflict,
    onDiscardQueue: discardQueueAndReload,
  });

  return {
    conn,
    queueConflict,
    enqueueBall,
  };
}
