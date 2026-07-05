import { useCallback, useEffect, useMemo } from 'react';

import { useDispatch } from 'react-redux';

import { graphicSessionApi, useGetGraphicSessionQuery } from '@/graphics/entry/hooks/graphicSessionApiBinding';

import { useGraphicEcho } from '../GraphicEchoProvider';
import {
  patchSessionContextHash,
  patchSessionFromReverbEvent,
  resolveMatchIdForReverb,
  resolveSessionQueryArg,
} from './graphicSessionSync';
import { useGraphicChannel } from './useGraphicChannel';

/**
 * Graphics session: initial HTTP load + Reverb cache patches for `match.{id}.graphics`.
 * Must render under {@link GraphicEchoProvider} (see `useGraphicChannel`).
 *
 * @param {string|undefined} accessToken Stateless overlay access token from the URL path.
 */
export function useGraphicSession(accessToken) {
  const dispatch = /** @type {import('@/graphics/bootstrap/bootstrapStore').GraphicsBootstrapDispatch} */ (useDispatch());
  const echo = useGraphicEcho();

  const sessionQueryArg = useMemo(() => resolveSessionQueryArg(accessToken), [accessToken]);

  const {
    data: session,
    isError,
    isLoading,
    refetch,
  } = useGetGraphicSessionQuery(sessionQueryArg, {
    skip: !sessionQueryArg,
  });

  const matchId = useMemo(() => resolveMatchIdForReverb(session), [session]);

  const refetchContextIfHashChanged = useCallback(
    /** @param {string|null|undefined} nextHash */
    (nextHash) => {
      if (!sessionQueryArg || nextHash == null) return;

      let shouldRefetch = false;

      dispatch(
        graphicSessionApi.util.updateQueryData('getGraphicSession', sessionQueryArg, (draft) => {
          shouldRefetch = patchSessionContextHash(draft, nextHash);
        }),
      );

      if (shouldRefetch) {
        void refetch();
      }
    },
    [dispatch, sessionQueryArg, refetch],
  );

  const handleReverbEvent = useCallback(
    /** @param {Record<string, unknown>} event */
    (event) => {
      if (!sessionQueryArg) return;

      let shouldRefetchContext = false;

      dispatch(
        graphicSessionApi.util.updateQueryData('getGraphicSession', sessionQueryArg, (draft) => {
          ({ shouldRefetchContext } = patchSessionFromReverbEvent(draft, event));
        }),
      );

      if (shouldRefetchContext) {
        void refetch();
      }
    },
    [dispatch, sessionQueryArg, refetch],
  );

  useGraphicChannel(matchId, handleReverbEvent);

  useEffect(() => {
    if (!matchId || !echo) {
      return undefined;
    }

    const channelName = `match.${matchId}.graphics`;

    /** @param {Record<string, unknown>} event */
    const handleFlashHash = (event) => {
      refetchContextIfHashChanged(/** @type {string|null|undefined} */ (event?.context_hash) ?? null);
    };

    echo.channel(channelName).listen('.match.graphic.flash', handleFlashHash);

    return () => {
      echo.channel(channelName).stopListening('.match.graphic.flash', handleFlashHash);
    };
  }, [matchId, echo, refetchContextIfHashChanged]);

  // Re-sync full session state after a WebSocket reconnect. Without this, any
  // command activated while the connection was down is never seen — the overlay
  // keeps showing whatever it last rendered until the next event happens to
  // arrive. Only refetches on a genuine drop-then-reconnect, never on the
  // initial connect (the HTTP query above already covers that case).
  useEffect(() => {
    if (!echo?.connector?.onConnectionChange || !sessionQueryArg) {
      return undefined;
    }

    let hasDroppedSinceMount = false;
    let reconnectTimer = null;
    const RECONNECT_DEBOUNCE_MS = 2500;

    const unsubscribe = echo.connector.onConnectionChange((status) => {
      if (status === 'connected') {
        if (hasDroppedSinceMount) {
          hasDroppedSinceMount = false;
          clearTimeout(reconnectTimer);
          reconnectTimer = setTimeout(() => {
            console.error(
              '[graphics] WebSocket reconnected after a drop — refetching session to catch up on any missed commands.',
            );
            void refetch();
          }, RECONNECT_DEBOUNCE_MS);
        }
        return;
      }

      if (status === 'disconnected' || status === 'reconnecting' || status === 'failed') {
        hasDroppedSinceMount = true;
      }
    });

    return () => {
      clearTimeout(reconnectTimer);
      unsubscribe();
    };
  }, [echo, sessionQueryArg, refetch]);

  return { session, isError, isLoading, sessionQueryArg, matchId };
}
