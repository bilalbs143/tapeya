import type { LiveComment } from '../model/schemas';

/** Match server `LiveChatRedisKeys::LOG_MAX_LENGTH` and legacy `MAX_MESSAGES`. */
export const LIVE_COMMENT_MAX = 100;

export function trimLiveComments(comments: LiveComment[]): LiveComment[] {
  if (comments.length <= LIVE_COMMENT_MAX) return comments;
  return comments.slice(comments.length - LIVE_COMMENT_MAX);
}

/** Upsert by id (WS / canonical replace). Append when new. */
export function upsertLiveComment(comments: LiveComment[], comment: LiveComment): LiveComment[] {
  if (!comment.id) return comments;
  const idx = comments.findIndex((c) => c.id === comment.id);
  if (idx >= 0) {
    const next = comments.slice();
    next[idx] = comment;
    return next;
  }
  return trimLiveComments([...comments, comment]);
}

/**
 * Re-sync from REST history (oldest-first).
 * Keep local-only rows (optimistic sends) that are not in history yet.
 */
export function mergeLiveCommentHistory(local: LiveComment[], history: LiveComment[]): LiveComment[] {
  const historyIds = new Set(history.map((c) => c.id));
  const localOnly = local.filter((c) => !historyIds.has(c.id));
  return trimLiveComments([...history, ...localOnly]);
}

/** Swap a `local-*` optimistic row for the server id after POST succeeds. */
export function replaceOptimisticLiveComment(
  comments: LiveComment[],
  optimisticId: string,
  comment: LiveComment
): LiveComment[] {
  const without = comments.filter((c) => c.id !== optimisticId && c.id !== comment.id);
  return trimLiveComments([...without, comment]);
}

/** Drop a local optimistic row when POST fails. */
export function removeLiveComment(comments: LiveComment[], id: string): LiveComment[] {
  if (!id) return comments;
  return comments.filter((c) => c.id !== id);
}
