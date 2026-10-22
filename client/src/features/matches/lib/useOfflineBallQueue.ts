import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

import { parseApiError } from '@/shared/api/errors';

import {
  clearQueuedBalls,
  enqueueBall,
  listQueuedBalls,
  type QueuedBall,
  removeQueuedBall,
  subscribeBallQueue,
} from './ballQueueStorage';
import type { StoreBallPayload } from './storeBallPayload';

type StoreBallFn = (arg: { matchId: number; inningsId: number; payload: StoreBallPayload }) => {
  unwrap: () => Promise<unknown>;
};

export type OfflineBallQueue = {
  queued: number;
  items: QueuedBall[];
  flushing: boolean;
  conflict: boolean;
  enqueue: (arg: { inningsId: number; payload: StoreBallPayload }) => QueuedBall;
  discard: () => void;
  flush: () => Promise<void>;
};

/** Offline ball queue — FIFO flush on reconnect; non-network flush error → stale conflict. */

export function useOfflineBallQueue(
  matchId: number,
  storeBall: StoreBallFn,
  { enabled = true }: { enabled?: boolean | undefined } = {}
): OfflineBallQueue {
  const items = useSyncExternalStore(
    subscribeBallQueue,
    () => (enabled && matchId > 0 ? listQueuedBalls(matchId) : []),
    () => []
  );

  const [flushing, setFlushing] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [conflictForMatch, setConflictForMatch] = useState(matchId);
  if (conflictForMatch !== matchId) {
    setConflictForMatch(matchId);
    setConflict(false);
  }

  const flushingRef = useRef(false);

  const enqueue = useCallback(
    (arg: { inningsId: number; payload: StoreBallPayload }) => {
      const ball = enqueueBall({
        matchId,
        inningsId: arg.inningsId,
        payload: arg.payload,
      });
      setConflict(false);
      return ball;
    },
    [matchId]
  );

  const discard = useCallback(() => {
    clearQueuedBalls(matchId);
    setConflict(false);
  }, [matchId]);

  const flush = useCallback(async () => {
    if (!enabled || matchId <= 0 || flushingRef.current || conflict) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    const pending = listQueuedBalls(matchId);
    if (!pending.length) return;

    flushingRef.current = true;
    setFlushing(true);
    try {
      for (const ball of pending) {
        if (typeof navigator !== 'undefined' && !navigator.onLine) break;
        try {
          await storeBall({
            matchId: ball.matchId,
            inningsId: ball.inningsId,
            payload: ball.payload,
          }).unwrap();
          removeQueuedBall(matchId, ball.id);
        } catch (err) {
          const parsed = parseApiError(err);
          if (parsed.type === 'network') break;
          setConflict(true);
          break;
        }
      }
    } finally {
      flushingRef.current = false;
      setFlushing(false);
    }
  }, [conflict, enabled, matchId, storeBall]);

  useEffect(() => {
    if (!enabled) return undefined;

    function onOnline() {
      void flush();
    }
    window.addEventListener('online', onOnline);
    const t = window.setTimeout(() => {
      void flush();
    }, 0);
    return () => {
      window.removeEventListener('online', onOnline);
      window.clearTimeout(t);
    };
  }, [enabled, flush]);

  return {
    queued: items.length,
    items,
    flushing,
    conflict,
    enqueue,
    discard,
    flush,
  };
}
