/**
 * Shared Echo subscriptions for Home Live Score cards.
 *
 * One connection (via echoManager) listens to every match id currently in the
 * live-score feed. MatchStateUpdated patches the getLiveScores RTK cache
 * immediately; completed matches are removed; reconnect invalidates the list.
 *
 * Membership is keyed by a stable id string so RTK cache patches / 60s polls
 * that keep the same match set do not tear down WebSocket subscriptions.
 */

import { useEffect, useRef } from 'react';

import { acquireEcho, releaseEcho } from '@/config/echoManager';
import { applyMatchStateToLiveScoreRow } from '@/lib/utils/liveScoreUtils';
import { liveApi } from '@/store/api/liveApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

/**
 * @param {Array<{ id?: number|string }>|undefined|null} rows
 */
export function useLiveScoreChannels(rows) {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((s) => s.auth?.accessToken);
  const matchIdsKey = (rows ?? [])
    .map((row) => row?.id)
    .filter((id) => id != null)
    .map(String)
    .sort()
    .join(',');

  const echoRef = useRef(null);
  const subscribedRef = useRef(new Set());
  const everConnectedRef = useRef(false);

  useEffect(() => {
    if (!accessToken) {
      return undefined;
    }

    const echo = acquireEcho({ authToken: accessToken });
    if (!echo) {
      return undefined;
    }
    echoRef.current = echo;

    const pusher = echo.connector?.pusher;
    const handleStateChange = ({ current }) => {
      if (current === 'connected') {
        if (everConnectedRef.current) {
          dispatch(liveApi.util.invalidateTags([{ type: 'LiveScores', id: 'LIST' }]));
        }
        everConnectedRef.current = true;
      }
    };
    if (pusher) {
      pusher.connection.bind('state_change', handleStateChange);
    }

    return () => {
      if (pusher) {
        pusher.connection.unbind('state_change', handleStateChange);
      }
      subscribedRef.current.forEach((id) => {
        echo.leave(`match.${id}.scoring`);
      });
      subscribedRef.current.clear();
      echoRef.current = null;
      everConnectedRef.current = false;
      releaseEcho();
    };
  }, [accessToken, dispatch]);

  useEffect(() => {
    const echo = echoRef.current;
    if (!echo || !accessToken) {
      return;
    }

    const nextIds = new Set(matchIdsKey ? matchIdsKey.split(',') : []);
    const prevIds = subscribedRef.current;

    prevIds.forEach((id) => {
      if (!nextIds.has(id)) {
        echo.leave(`match.${id}.scoring`);
        prevIds.delete(id);
      }
    });

    nextIds.forEach((id) => {
      if (prevIds.has(id)) return;

      echo.private(`match.${id}.scoring`).listen('.match.state.updated', (event) => {
        const ms = event?.match_state;
        if (!ms) return;

        dispatch(
          liveApi.util.updateQueryData('getLiveScores', undefined, (draft) => {
            if (!Array.isArray(draft)) return;
            const index = draft.findIndex((item) => String(item.id) === String(id));
            if (index === -1) return;

            const updated = applyMatchStateToLiveScoreRow(draft[index], ms);
            if (updated == null) {
              draft.splice(index, 1);
              return;
            }
            draft[index] = updated;
          }),
        );
      });

      prevIds.add(id);
    });
  }, [accessToken, dispatch, matchIdsKey]);
}
