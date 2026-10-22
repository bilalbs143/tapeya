import type { AppDispatch } from '@/shared/store/store';

import { liveApi } from '../api/liveApi';
import type { LiveComment } from '../model/schemas';

const MAX_COMMENTS = 80;

/** Strip/trim/clamp chat body (default 500; server may clamp further). */
export function sanitizeLiveCommentBody(raw: string, maxLen = 500): string {
  return raw
    .replace(/<[^>]*>/g, '')
    .trim()
    .slice(0, maxLen);
}

/** Upsert a chat row into the `getLiveComments` cache. Same id from WS replaces a local optimistic row (canonical server text wins). */
export function appendLiveComment(dispatch: AppDispatch, streamId: number, comment: LiveComment) {
  dispatch(
    liveApi.util.updateQueryData('getLiveComments', streamId, (draft) => {
      const idx = draft.findIndex((c) => c.id === comment.id);
      if (idx >= 0) {
        draft[idx] = comment;
        return;
      }
      draft.push(comment);
      if (draft.length > MAX_COMMENTS) draft.splice(0, draft.length - MAX_COMMENTS);
    })
  );
}
