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

  useEffect(() => {
    if (!enabled) {
      reset();
    }
  }, [enabled, reset]);

  const handleMessage = useCallback((msg) => {
    dispatch({ type: 'ADD', msg });
  }, []);

  useStreamChatChannel(enabled && streamId ? streamId : null, handleMessage, onHeart);

  return { messages, reset };
}
