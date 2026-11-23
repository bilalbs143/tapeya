import type { AppDispatch, RootState } from '@/shared/store/store';

import { liveApi } from '../api/liveApi';
import type { LiveComment } from '../model/schemas';
import { upsertLiveComment } from './mergeLiveComments';

/** Strip/trim/clamp chat body (default 500; server may clamp further). */
export function sanitizeLiveCommentBody(raw: string, maxLen = 500): string {
  return raw
    .replace(/<[^>]*>/g, '')
    .trim()
    .slice(0, maxLen);
}

/**
 * Upsert a chat row into the `getLiveComments` cache.
 * Uses upsert when the query entry is missing so early WS events are not dropped.
 */
export function appendLiveComment(dispatch: AppDispatch, streamId: number, comment: LiveComment) {
  dispatch((innerDispatch, getState) => {
    const cached = liveApi.endpoints.getLiveComments.select(streamId)(getState() as RootState);
    if (cached.data == null) {
      innerDispatch(liveApi.util.upsertQueryData('getLiveComments', streamId, [comment]));
      return;
    }
    innerDispatch(
      liveApi.util.updateQueryData('getLiveComments', streamId, (draft) => {
        const next = upsertLiveComment(draft, comment);
        draft.splice(0, draft.length, ...next);
      })
    );
  });
}
