import { useCallback, useEffect, useReducer, useRef } from 'react';

import { createEcho } from '@/config/reverb';

const MAX_MESSAGES = 100;

function makeReducer() {
  const seenIds = new Set();

  return function reducer(state, action) {
    switch (action.type) {
      case 'RESET':
        seenIds.clear();
        return [];
      case 'ADD': {
        if (seenIds.has(action.msg.id)) return state;
        seenIds.add(action.msg.id);
        const next = [...state, action.msg];
        return next.length > MAX_MESSAGES ? next.slice(next.length - MAX_MESSAGES) : next;
      }
      default:
        return state;
    }
  };
}

function normalizeComment(payload) {
  const data = payload?.id != null || payload?.text != null || payload?.body != null ? payload : payload?.data;
  if (!data) return null;
  const id = data.id;
  const text = data.text ?? data.body;
  if (id == null || text == null) return null;
  return {
    id: String(id),
    name: data.name ?? 'Viewer',
    text: String(text),
  };
}

function normalizeHeart(payload) {
  const data = payload?.user_id != null ? payload : payload?.data;
  if (!data || data.user_id == null) return null;
  return {
    user_id: data.user_id,
    avatar_url: data.avatar_url ?? null,
    initials: data.initials ?? '?',
  };
}

/**
 * Go-live owner chat/hearts — **dedicated public Echo socket**, not the shared echoManager.
 *
 * Why isolated: hub / presence / token refresh on the shared socket kept tearing down
 * `live-stream.{id}.chat`, so the owner never saw viewer comments while viewers still
 * received the owner's optimistic+broadcast sends.
 */
export function useBroadcastOwnerChat(streamId, { enabled = true, onHeart } = {}) {
  const reducerRef = useRef(makeReducer());
  const [messages, dispatch] = useReducer((state, action) => reducerRef.current(state, action), []);
  const heartRef = useRef(onHeart);
  heartRef.current = onHeart;

  useEffect(() => {
    reducerRef.current = makeReducer();
    dispatch({ type: 'RESET' });
  }, [streamId]);

  const addMessage = useCallback((msg) => {
    const normalized = normalizeComment(msg) ?? (msg?.id != null && msg?.text != null ? msg : null);
    if (!normalized) return;
    dispatch({ type: 'ADD', msg: normalized });
  }, []);

  useEffect(() => {
    if (!enabled || streamId == null || streamId === '') {
      return undefined;
    }

    const id = String(streamId);
    const channelName = `live-stream.${id}.chat`;
    // Public channel only — no auth. Own connection so presence/hub cannot disconnect us.
    const echo = createEcho();
    if (!echo) {
      return undefined;
    }

    let alive = true;

    const bindChannel = () => {
      if (!alive) return;
      const channel = echo.channel(channelName);
      channel.stopListening('.live-stream.chat.message');
      channel.stopListening('.live-stream.chat.heart');
      channel.listen('.live-stream.chat.message', (payload) => {
        const msg = normalizeComment(payload);
        if (msg) dispatch({ type: 'ADD', msg });
      });
      channel.listen('.live-stream.chat.heart', (payload) => {
        const heart = normalizeHeart(payload);
        if (heart) heartRef.current?.(heart);
      });
    };

    bindChannel();

    const connection = echo.connector?.pusher?.connection;
    const onConnected = () => bindChannel();
    connection?.bind?.('connected', onConnected);

    return () => {
      alive = false;
      connection?.unbind?.('connected', onConnected);
      try {
        echo.leave(channelName);
      } catch {
        // ignore
      }
      try {
        echo.disconnect();
      } catch {
        // ignore
      }
    };
  }, [streamId, enabled]);

  return { messages, addMessage };
}
