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
 *
 * `enabled` gates the WebSocket subscription. When disabled we only leave the
 * channel — we do **not** wipe messages (brief disable used to clear the owner's feed).
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
    const id = msg?.id ?? msg?.data?.id;
    const name = msg?.name ?? msg?.data?.name;
    const text = msg?.text ?? msg?.body ?? msg?.data?.text ?? msg?.data?.body;
    if (id == null || text == null) return;
    dispatch({ type: 'ADD', msg: { id: String(id), name: name ?? 'Viewer', text: String(text) } });
  }, []);

  useStreamChatChannel(enabled && streamId != null && streamId !== '' ? streamId : null, handleMessage, onHeart);

  return { messages, reset, addMessage: handleMessage };
}
