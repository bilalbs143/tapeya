import { useCallback, useEffect, useReducer } from 'react';

import { useGetLiveCommentsQuery } from '@/store/api/liveApi';

import { useStreamChatChannel } from './useStreamChatChannel';

const MAX_MESSAGES = 100;

function reducer(state, action) {
  switch (action.type) {
    case 'RESET':
      return [];

    case 'ADD': {
      if (!action.msg?.id || state.some((m) => m.id === action.msg.id)) {
        return state;
      }

      const next = [...state, action.msg];
      return next.length > MAX_MESSAGES ? next.slice(next.length - MAX_MESSAGES) : next;
    }

    default:
      return state;
  }
}

/**
 * Local comment feed for a stream. `enabled` gates the chat WebSocket.
 */
export function useStreamComments(streamId, enabled = true, onHeart) {
  const [messages, dispatch] = useReducer(reducer, []);

  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  useEffect(() => {
    dispatch({ type: 'RESET' });
  }, [streamId]);

  const { data: history } = useGetLiveCommentsQuery(streamId, {
    skip: !enabled || !streamId,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (!history?.length) return;
    history.forEach((msg) => dispatch({ type: 'ADD', msg }));
  }, [history]);

  const handleMessage = useCallback((msg) => {
    if (!msg?.id) return;
    dispatch({ type: 'ADD', msg });
  }, []);

  useStreamChatChannel(enabled && streamId ? streamId : null, handleMessage, onHeart);

  return { messages, reset, addMessage: handleMessage };
}
