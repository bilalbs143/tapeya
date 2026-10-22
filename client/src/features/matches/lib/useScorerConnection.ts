import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import type { ConnectionState } from '../ui/ConnectionBanner';
import { type SocketFace, useMatchScoringChannel } from './useMatchScoringChannel';

const DEMO_STATES = new Set(['online', 'reconnecting', 'offline', 'stale']);

export type ScorerConnection = {
  state: ConnectionState;
  queued: number;
  lastSent: string | null;
  crowdScore: string | null;
  serverOvers: string | null;
  localOvers: string | null;
  conflictSince: string | null;
  onDiscard: (() => void) | undefined;
  onReview: (() => void) | undefined;
};

type UseScorerConnectionArgs = {
  matchId: number;
  /** Live overs for header save-meta / offline crowd line. */
  oversDisplay: string | null;
  runs: number;
  wickets: number;
  /** Switch to Balls tab for stale “review” (demo + future conflict UX). */
  onReviewBalls: () => void;
  enabled?: boolean | undefined;
  /** Real offline queue depth from `useOfflineBallQueue`. */
  queuedCount?: number | undefined;
  /** Flush conflict — another scorer moved on while balls were queued. */
  queueConflict?: boolean | undefined;
  /** Discard local queue + reload match (stale resolution). */
  onDiscardQueue?: (() => void) | undefined;
};

/** Scorer face from online/Echo/offline queue; `?conn=` demo override. */

export function useScorerConnection({
  matchId,
  oversDisplay,
  runs,
  wickets,
  onReviewBalls,
  enabled = true,
  queuedCount = 0,
  queueConflict = false,
  onDiscardQueue,
}: UseScorerConnectionArgs): ScorerConnection {
  const [searchParams, setSearchParams] = useSearchParams();
  const { socketFace } = useMatchScoringChannel(matchId, { enabled });
  const [browserOnline, setBrowserOnline] = useState(() => typeof navigator === 'undefined' || navigator.onLine);

  useEffect(() => {
    function onOnline() {
      setBrowserOnline(true);
    }
    function onOffline() {
      setBrowserOnline(false);
    }
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const clearDemo = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete('conn');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const demoRaw = searchParams.get('conn');
  if (demoRaw && DEMO_STATES.has(demoRaw)) {
    return demoConnection(demoRaw as ConnectionState, {
      oversDisplay,
      clearDemo,
      onReviewBalls,
    });
  }

  const crowdScore = `${runs}/${wickets}${oversDisplay ? ` · ${oversDisplay}` : ''}`;
  const liveState = resolveLiveState(browserOnline, socketFace, queueConflict);

  return {
    state: liveState,
    queued: queuedCount,
    lastSent: liveState === 'offline' || liveState === 'reconnecting' ? oversDisplay : null,
    crowdScore: liveState === 'offline' ? crowdScore : null,
    serverOvers: liveState === 'stale' ? oversDisplay : null,
    localOvers: liveState === 'stale' ? oversDisplay : null,
    conflictSince: liveState === 'stale' ? oversDisplay : null,
    onDiscard:
      liveState === 'stale'
        ? () => {
            onDiscardQueue?.();
          }
        : undefined,
    onReview: liveState === 'stale' ? onReviewBalls : undefined,
  };
}

function resolveLiveState(browserOnline: boolean, socketFace: SocketFace, queueConflict: boolean): ConnectionState {
  if (queueConflict) return 'stale';
  if (!browserOnline) return 'offline';
  if (socketFace === 'reconnecting') return 'reconnecting';
  return 'online';
}

function demoConnection(
  state: ConnectionState,
  {
    oversDisplay,
    clearDemo,
    onReviewBalls,
  }: {
    oversDisplay: string | null;
    clearDemo: () => void;
    onReviewBalls: () => void;
  }
): ScorerConnection {
  if (state === 'online') {
    return emptyOnline();
  }
  if (state === 'reconnecting') {
    return {
      ...emptyOnline(),
      state,
      queued: 2,
    };
  }
  if (state === 'offline') {
    return {
      ...emptyOnline(),
      state,
      queued: 9,
      lastSent: '16.3',
      crowdScore: '151/5 · 16.3',
    };
  }
  return {
    ...emptyOnline(),
    state: 'stale',
    queued: 9,
    localOvers: oversDisplay ?? '18.2',
    serverOvers: '19.4',
    conflictSince: '18.3',
    onDiscard: clearDemo,
    onReview: onReviewBalls,
  };
}

function emptyOnline(): ScorerConnection {
  return {
    state: 'online',
    queued: 0,
    lastSent: null,
    crowdScore: null,
    serverOvers: null,
    localOvers: null,
    conflictSince: null,
    onDiscard: undefined,
    onReview: undefined,
  };
}
