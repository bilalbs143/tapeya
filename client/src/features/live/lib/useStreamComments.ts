import { useCallback, useEffect, useReducer, useRef } from 'react';

import { useGetLiveCommentsQuery } from '../api/liveApi';
import type { LiveComment } from '../model/schemas';
import {
  mergeLiveCommentHistory,
  removeLiveComment,
  replaceOptimisticLiveComment,
  upsertLiveComment,
} from './mergeLiveComments';
import { type HeartEventPayload, useStreamChatChannel } from './useStreamChatChannel';

type State = LiveComment[];

type Action =
  | { type: 'RESET' }
  | { type: 'MERGE_HISTORY'; history: LiveComment[] }
  | { type: 'UPSERT'; comment: LiveComment }
  | { type: 'REPLACE_OPTIMISTIC'; optimisticId: string; comment: LiveComment }
  | { type: 'REMOVE'; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'RESET':
      return [];
    case 'MERGE_HISTORY':
      return mergeLiveCommentHistory(state, action.history);
    case 'UPSERT':
      return upsertLiveComment(state, action.comment);
    case 'REPLACE_OPTIMISTIC':
      return replaceOptimisticLiveComment(state, action.optimisticId, action.comment);
    case 'REMOVE':
      return removeLiveComment(state, action.id);
    default:
      return state;
  }
}

type Options = {
  enabled?: boolean | undefined;
  onHeart?: ((payload: HeartEventPayload) => void) | undefined;
};

/**
 * Local comment feed for a stream (legacy-style).
 * Seeds from REST with remount refetch, merges WS into local state, and refetches on reconnect.
 */
export function useStreamComments(streamId: number | null, { enabled = true, onHeart }: Options = {}) {
  const [messages, dispatch] = useReducer(reducer, []);

  useEffect(() => {
    dispatch({ type: 'RESET' });
  }, [streamId]);

  const commentsQuery = useGetLiveCommentsQuery(streamId ?? 0, {
    skip: !enabled || streamId == null,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (!commentsQuery.data) return;
    dispatch({ type: 'MERGE_HISTORY', history: commentsQuery.data });
  }, [commentsQuery.data]);

  const addMessage = useCallback((comment: LiveComment) => {
    if (!comment.id) return;
    dispatch({ type: 'UPSERT', comment });
  }, []);

  const replaceOptimistic = useCallback((optimisticId: string, comment: LiveComment) => {
    if (!comment.id) return;
    dispatch({ type: 'REPLACE_OPTIMISTIC', optimisticId, comment });
  }, []);

  const removeMessage = useCallback((id: string) => {
    if (!id) return;
    dispatch({ type: 'REMOVE', id });
  }, []);

  const refetchRef = useRef(commentsQuery.refetch);
  useEffect(() => {
    refetchRef.current = commentsQuery.refetch;
  }, [commentsQuery.refetch]);
  const onReconnect = useCallback(() => {
    void refetchRef.current();
  }, []);

  useStreamChatChannel(enabled && streamId != null ? streamId : null, {
    enabled: Boolean(enabled && streamId != null),
    onMessage: addMessage,
    onHeart,
    onReconnect,
  });

  return {
    messages,
    addMessage,
    replaceOptimistic,
    removeMessage,
    isLoading: commentsQuery.isLoading,
    isError: commentsQuery.isError,
    refetch: commentsQuery.refetch,
  };
}
