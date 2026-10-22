import { useEffect, useState } from 'react';

import { createRealtimeClient, isRealtimeConfigured } from '@/shared/config/realtime';
import { selectAccessToken } from '@/shared/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';

import { matchesApi } from '../api/matchesApi';
import { scoringStateWireSchema, toScoringSession } from '../model/scoringSession';

/** RefreshMatchStatsJob is ~3s after each ball; wait 4s before invalidating. */

const SCORECARD_INVALIDATE_DELAY_MS = 4000;

export type SocketFace = 'online' | 'reconnecting';

type UseMatchScoringChannelOptions = {
  /** When false, skip Echo subscribe (still OK to call). */
  enabled?: boolean | undefined;
};

/** Private scoring channel — patch state, delayed invalidate, reconnect refresh; socket face for banner. */

export function useMatchScoringChannel(matchId: number | null, { enabled = true }: UseMatchScoringChannelOptions = {}) {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const configured = isRealtimeConfigured();
  const canSubscribe = Boolean(enabled && matchId && accessToken && configured);
  const [socketFace, setSocketFace] = useState<SocketFace>('online');

  useEffect(() => {
    if (!canSubscribe || !matchId || !accessToken) return;

    const client = createRealtimeClient({ authToken: accessToken });
    if (!client) return;

    const channelName = `match.${matchId}.scoring`;
    const pendingTimers = new Set<ReturnType<typeof setTimeout>>();

    client.private(channelName).listen('.match.state.updated', (raw) => {
      const event = raw as { match_state?: unknown } | null;
      const ms = event?.match_state;
      if (!ms) return;

      const parsed = scoringStateWireSchema.safeParse(ms);
      if (!parsed.success) return;

      const session = toScoringSession(parsed.data);
      dispatch(matchesApi.util.updateQueryData('getScoringState', matchId, () => session));

      const timer = setTimeout(() => {
        pendingTimers.delete(timer);
        dispatch(
          matchesApi.util.invalidateTags([
            { type: 'Scorecard', id: matchId },
            { type: 'Match', id: matchId },
          ])
        );
      }, SCORECARD_INVALIDATE_DELAY_MS);
      pendingTimers.add(timer);
    });

    let everConnected = false;
    const unbind = client.onConnectionChange((status) => {
      if (status === 'connected') {
        if (everConnected) {
          dispatch(
            matchesApi.util.invalidateTags([
              { type: 'MatchState', id: matchId },
              { type: 'Scorecard', id: matchId },
            ])
          );
        }
        everConnected = true;
        setSocketFace('online');
        return;
      }

      if (status === 'failed' || status === 'unavailable') {
        setSocketFace('reconnecting');
        return;
      }

      // Suppress the initial connecting flash; show strip only after a drop.
      if (everConnected && (status === 'connecting' || status === 'disconnected')) {
        setSocketFace('reconnecting');
      }
    });

    return () => {
      pendingTimers.forEach(clearTimeout);
      pendingTimers.clear();
      unbind();
      client.leave(channelName);
      client.disconnect();
    };
  }, [accessToken, canSubscribe, dispatch, matchId]);

  return {
    /** When not subscribed, treat as online — HTTP scoring still works. */
    socketFace: canSubscribe ? socketFace : 'online',
    realtimeConfigured: configured,
  };
}
