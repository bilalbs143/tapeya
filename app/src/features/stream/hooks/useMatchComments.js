import { useCallback, useEffect, useReducer, useRef } from 'react';

import { useMatchChatChannel } from './useMatchChatChannel';

const MAX_MESSAGES = 100;

/** O(1) dedup via a Set closure inside the reducer factory. */
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
 * Local ephemeral comment state — never touches RTK Query cache.
 *
 * @param {string|number|null} matchId
 * @param {boolean} [enabled] Pass false when stream is idle/ended
 * @returns {{ messages: object[], reset: () => void }}
 */
export function useMatchComments(matchId, enabled = true) {
  const reducerRef = useRef(makeReducer());

  const [messages, dispatch] = useReducer((state, action) => reducerRef.current(state, action), []);

  const reset = useCallback(() => {
    reducerRef.current = makeReducer();
    dispatch({ type: 'RESET' });
  }, []);

  useEffect(() => {
    reducerRef.current = makeReducer();
    dispatch({ type: 'RESET' });
  }, [matchId]);

  useEffect(() => {
    if (!enabled) {
      reset();
    }
  }, [enabled, reset]);

  const handleMessage = useCallback((msg) => {
    dispatch({ type: 'ADD', msg });
  }, []);

  useMatchChatChannel(enabled && matchId ? matchId : null, handleMessage);

  return { messages, reset };
}
