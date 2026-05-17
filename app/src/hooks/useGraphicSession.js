import { useCallback, useMemo } from 'react';

import { useDispatch } from 'react-redux';

import { useGraphicChannel } from '@/hooks/useGraphicChannel';
import { graphicSessionApi, useGetGraphicSessionQuery } from '@/store/api/graphicSessionApi';

/**
 * Overlay session: initial HTTP load + Reverb cache patches for `match.{id}.graphics`.
 * Must render under {@link GraphicEchoProvider} (see `useGraphicChannel`).
 *
 * @param {string|undefined} matchId
 * @param {URLSearchParams} searchParams
 */
export function useGraphicSession(matchId, searchParams) {
  const dispatch = useDispatch();

  const sessionQueryArg = useMemo(() => {
    if (!matchId) return null;
    const expires = searchParams.get('expires');
    const signature = searchParams.get('signature');
    if (expires && signature) {
      return { matchId, expires, signature };
    }
    return matchId;
  }, [matchId, searchParams]);

  const {
    data: session,
    isError,
    isLoading,
  } = useGetGraphicSessionQuery(sessionQueryArg, {
    skip: !sessionQueryArg,
  });

  const handleReverbEvent = useCallback(
    (event) => {
      if (!sessionQueryArg) return;
      dispatch(
        graphicSessionApi.util.updateQueryData('getGraphicSession', sessionQueryArg, (draft) => {
          draft.active_command = {
            command_key: event.command_key,
            command_type: event.command_type,
            display_mode: event.display_mode ?? null,
            payload: event.payload ?? null,
            id: event.command_id,
          };
          if (event.context != null) {
            draft.context = event.context;
          }
          if (event.graphic_theme_id != null) {
            draft.graphic_theme_id = event.graphic_theme_id;
          }
          if (Object.prototype.hasOwnProperty.call(event, 'config')) {
            draft.config = event.config ?? null;
          }
          if (Object.prototype.hasOwnProperty.call(event, 'pending_players')) {
            draft.pending_players = event.pending_players ?? null;
          }
        }),
      );
    },
    [dispatch, sessionQueryArg],
  );

  useGraphicChannel(matchId, handleReverbEvent);

  return { session, isError, isLoading, sessionQueryArg };
}
