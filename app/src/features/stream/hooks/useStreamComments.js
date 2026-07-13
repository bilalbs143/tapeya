import { useCallback, useEffect, useReducer, useRef } from 'react';

import { useStreamChatChannel } from './useStreamChatChannel';

const MAX_MESSAGES = 100;

function makeReducer() {
  const seenIds = new Set();

  return function reducer(state, action) {
    switch (action.type) {
      case 'RESET':
        seenIds.clear();
        return [];

      case 'ADD': {
        if (seenIds.has(action.msg.id)) {
          return state;
        }
        seenIds.add(action.msg.id);

        const next = [...state, action.msg];
        return next.length > MAX_MESSAGES ? next.slice(next.length - MAX_MESSAGES) : next;
      }

      default:
        return state;
    }
  };
}

/**
 * Local ephemeral comment state keyed by stream id.
 * `enabled` gates the chat WebSocket (comments + hearts on `live-stream.{id}.chat`).
 * Messages are kept when `enabled` flips false so a brief disable does not wipe the feed.
 */
export function useStreamComments(streamId, enabled = true, onHeart) {
  const reducerRef = useRef(makeReducer());
  const [messages, dispatch] = useReducer((state, action) => reducerRef.current(state, action), []);

  const reset = useCallback(() => {
    reducerRef.current = makeReducer();
    dispatch({ type: 'RESET' });
  }, []);

  useEffect(() => {
    reducerRef.current = makeReducer();
    dispatch({ type: 'RESET' });
  }, [streamId]);

  const handleMessage = useCallback((msg) => {
    if (!msg?.id) return;
    dispatch({ type: 'ADD', msg });
  }, []);

  useStreamChatChannel(enabled && streamId ? streamId : null, handleMessage, onHeart);

  return { messages, reset, addMessage: handleMessage };
}
