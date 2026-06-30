import { useCallback, useEffect, useMemo } from 'react';

import { useDispatch } from 'react-redux';

import { graphicSessionApi, useGetGraphicSessionQuery } from '@/store/api/graphicSessionApi';

import { useGraphicEcho } from '../GraphicEchoProvider';
import { patchSessionContextHash, patchSessionFromReverbEvent, resolveSessionQueryArg } from './graphicSessionSync';
import { useGraphicChannel } from './useGraphicChannel';

/**
 * Overlay session: initial HTTP load + Reverb cache patches for `match.{id}.graphics`.
 * Must render under {@link GraphicEchoProvider} (see `useGraphicChannel`).
 *
 * @param {string|undefined} matchId
 * @param {URLSearchParams} searchParams
 */
export function useGraphicSession(matchId, searchParams) {
  const dispatch = useDispatch();
  const echo = useGraphicEcho();

  const sessionQueryArg = useMemo(() => resolveSessionQueryArg(matchId, searchParams), [matchId, searchParams]);

  const {
    data: session,
    isError,
    isLoading,
    refetch,
  } = useGetGraphicSessionQuery(sessionQueryArg, {
    skip: !sessionQueryArg,
  });

  const refetchContextIfHashChanged = useCallback(
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

    const handleFlashHash = (event) => {
      refetchContextIfHashChanged(event?.context_hash ?? null);
    };

    echo.channel(channelName).listen('.match.graphic.flash', handleFlashHash);

    return () => {
      echo.channel(channelName).stopListening('.match.graphic.flash', handleFlashHash);
    };
  }, [matchId, echo, refetchContextIfHashChanged]);

  return { session, isError, isLoading, sessionQueryArg };
}
