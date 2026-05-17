/**
 * useMatchScoringChannel
 *
 * Subscribes to the private `match.{matchId}.scoring` Reverb channel and:
 *   1. Patches the RTK Query `MatchState` cache immediately on every
 *      `.match.state.updated` event — crease / free-hit / score update with
 *      no network refetch.
 *   2. Schedules a `Scorecard` + `Match` cache invalidation ~4 s later so the
 *      scorecard viewer re-fetches once `RefreshMatchStatsJob` (3 s delay) has
 *      materialised updated batting/bowling stats.
 *   3. On WebSocket reconnect, invalidates `MatchState` so RTK Query refetches
 *      the latest state — avoids a stale-cache gap from missed events during
 *      the disconnection window.
 *
 * Call it in any component that needs live match-state updates (scorecard
 * viewer, scoring app, etc.).  Safe to call when the match is not live or
 * the user is not authenticated — it simply does nothing in those cases.
 */

import { useEffect, useRef } from 'react';

import { createEcho } from '@/config/reverb';
import { matchApi } from '@/store/api/matchApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

// RefreshMatchStatsJob runs 3 s after each ball; add 1 s buffer.
const SCORECARD_INVALIDATE_DELAY_MS = 4000;

export function useMatchScoringChannel(matchId, { onMatchState } = {}) {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((s) => s.auth?.accessToken);
  const onMatchStateRef = useRef(onMatchState);
  onMatchStateRef.current = onMatchState;

  useEffect(() => {
    if (!matchId || !accessToken) return;

    const echo = createEcho({ authToken: accessToken });
    if (!echo) return;

    const pendingTimers = new Set();

    echo.private(`match.${matchId}.scoring`).listen('.match.state.updated', (event) => {
      const ms = event?.match_state;
      if (!ms) return;

      // 1. Patch MatchState cache immediately — zero latency for crease/score.
      dispatch(matchApi.util.updateQueryData('getMatchState', String(matchId), () => ms));

      onMatchStateRef.current?.(ms);

      // 2. Invalidate scorecard and match caches after the stats job window so
      //    the scorecard tab shows fresh batting/bowling figures.
      const timer = setTimeout(() => {
        pendingTimers.delete(timer);
        dispatch(
          matchApi.util.invalidateTags([
            { type: 'Scorecard', id: String(matchId) },
            { type: 'Match', id: String(matchId) },
          ]),
        );
      }, SCORECARD_INVALIDATE_DELAY_MS);
      pendingTimers.add(timer);
    });

    // 3. Reconnection recovery: when Pusher reconnects after a drop, any events
    //    sent during the gap were missed.  Invalidate MatchState AND Scorecard so
    //    RTK Query refetches both — crease/score AND ball history stay in sync.
    //    Without Scorecard invalidation here the Stats/Balls tabs can show stale
    //    ball data — scorecard is refetched on reconnect via tag invalidation.
    const pusher = echo.connector?.pusher;
    let everConnected = false;
    const handleStateChange = ({ current }) => {
      if (current === 'connected') {
        if (everConnected) {
          // Reconnect after a drop — missed events window.  Force refetch of
          // both live state and the ball-by-ball scorecard.
          dispatch(
            matchApi.util.invalidateTags([
              { type: 'MatchState', id: String(matchId) },
              { type: 'Scorecard', id: String(matchId) },
            ]),
          );
        }
        everConnected = true;
      }
    };
    if (pusher) {
      pusher.connection.bind('state_change', handleStateChange);
    }

    return () => {
      pendingTimers.forEach(clearTimeout);
      pendingTimers.clear();
      if (pusher) {
        pusher.connection.unbind('state_change', handleStateChange);
      }
      echo.leave(`match.${matchId}.scoring`);
      echo.disconnect();
    };
  }, [matchId, accessToken, dispatch]);
}
