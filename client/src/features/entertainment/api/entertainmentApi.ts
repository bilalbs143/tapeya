import { z } from 'zod';

import { type Comment, type CommentPage, commentPageWireSchema, commentWireSchema, toComment } from '@/features/feed';

import { baseApi } from '@/shared/api/baseApi';
import { unwrapData, unwrapVoid } from '@/shared/api/unwrap';

import {
  type DramaEpisode,
  type DramaSerial,
  type EpisodeReactionCounts,
  parseEpisode,
  parseReactionCounts,
  parseSerial,
  parseSerialList,
} from '../model/schemas';

const commentLikeResultSchema = z.object({
  liked: z.boolean(),
  likes_count: z.number(),
});

type CommentLikeResult = { liked: boolean; likesCount: number };

function mapCommentPage(raw: unknown): CommentPage {
  const page = unwrapData(commentPageWireSchema)(raw);
  return {
    items: page.items.map(toComment),
    currentPage: page.current_page,
    lastPage: page.last_page,
    total: page.total ?? page.items.length,
  };
}

function mapComment(raw: unknown): Comment {
  return toComment(unwrapData(commentWireSchema)(raw));
}

function patchEpisodeCommentInCaches(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- RTK dispatch
  dispatch: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- getState
  getState: any,
  episodeId: number,
  commentId: number,
  updater: (comment: Comment) => Comment
) {
  const patches: { undo: () => void }[] = [];
  const queries = getState()?.api?.queries ?? {};

  Object.values(queries).forEach((entry) => {
    const e = entry as {
      endpointName?: string;
      originalArgs?: { episodeId?: number };
      data?: { items?: Comment[] };
    } | null;
    if (!e?.data?.items || !Array.isArray(e.data.items)) return;
    if (e.endpointName !== 'getDramaEpisodeComments' && e.endpointName !== 'getDramaEpisodeCommentReplies') {
      return;
    }
    if (e.originalArgs?.episodeId !== episodeId) return;

    patches.push(
      dispatch(
        entertainmentApi.util.updateQueryData(
          e.endpointName as 'getDramaEpisodeComments' | 'getDramaEpisodeCommentReplies',
          e.originalArgs as never,
          (draft: CommentPage) => {
            const idx = draft.items.findIndex((c) => c.id === commentId);
            if (idx >= 0) {
              const current = draft.items[idx];
              if (current) draft.items[idx] = updater(current);
            }
          }
        )
      )
    );
  });

  return patches;
}

export const entertainmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDramaSerials: builder.query<DramaSerial[], { perPage?: number | undefined } | undefined>({
      query: (arg) => ({
        url: '/drama-serials',
        params: {
          per_page: arg && 'perPage' in arg && arg.perPage != null ? arg.perPage : 50,
          sort: '-created_at',
        },
      }),
      transformResponse: (raw: unknown) => parseSerialList(raw),
      providesTags: (result) =>
        result
          ? [...result.map((s) => ({ type: 'DramaSerial' as const, id: s.id })), { type: 'DramaSerial', id: 'LIST' }]
          : [{ type: 'DramaSerial', id: 'LIST' }],
    }),

    getDramaSerial: builder.query<DramaSerial, number>({
      query: (id) => `/drama-serials/${id}`,
      transformResponse: (raw: unknown) => parseSerial(raw),
      providesTags: (_r, _e, id) => [{ type: 'DramaSerial', id }],
    }),

    getDramaEpisode: builder.query<DramaEpisode, number>({
      query: (id) => `/drama-episodes/${id}`,
      transformResponse: (raw: unknown) => parseEpisode(raw),
      providesTags: (_r, _e, id) => [{ type: 'DramaEpisode', id }],
    }),

    likeDramaEpisode: builder.mutation<EpisodeReactionCounts, number>({
      query: (id) => ({ url: `/drama-episodes/${id}/like`, method: 'POST' }),
      transformResponse: (raw: unknown) => parseReactionCounts(raw),
      invalidatesTags: (_r, _e, id) => [{ type: 'DramaEpisode', id }],
    }),

    dislikeDramaEpisode: builder.mutation<EpisodeReactionCounts, number>({
      query: (id) => ({ url: `/drama-episodes/${id}/dislike`, method: 'POST' }),
      transformResponse: (raw: unknown) => parseReactionCounts(raw),
      invalidatesTags: (_r, _e, id) => [{ type: 'DramaEpisode', id }],
    }),

    shareDramaEpisode: builder.mutation<EpisodeReactionCounts, number>({
      query: (id) => ({ url: `/drama-episodes/${id}/share`, method: 'POST' }),
      transformResponse: (raw: unknown) => parseReactionCounts(raw),
      invalidatesTags: (_r, _e, id) => [{ type: 'DramaEpisode', id }],
    }),

    getDramaEpisodeComments: builder.query<
      CommentPage,
      { episodeId: number; page?: number | undefined; perPage?: number | undefined }
    >({
      query: ({ episodeId, page = 1, perPage = 20 }) => ({
        url: `/drama-episodes/${episodeId}/comments`,
        params: { page, per_page: perPage },
      }),
      transformResponse: mapCommentPage,
      providesTags: (_r, _e, arg) => [{ type: 'DramaEpisode', id: `COMMENTS-${arg.episodeId}` }],
    }),

    getDramaEpisodeCommentReplies: builder.query<
      CommentPage,
      {
        episodeId: number;
        commentId: number;
        page?: number | undefined;
        perPage?: number | undefined;
      }
    >({
      query: ({ episodeId, commentId, page = 1, perPage = 20 }) => ({
        url: `/drama-episodes/${episodeId}/comments/${commentId}/replies`,
        params: { page, per_page: perPage },
      }),
      transformResponse: mapCommentPage,
      providesTags: (_r, _e, arg) => [{ type: 'DramaEpisode', id: `COMMENTS-${arg.episodeId}` }],
    }),

    addDramaEpisodeComment: builder.mutation<
      Comment,
      { episodeId: number; body: string; parentId?: number | undefined }
    >({
      query: ({ episodeId, body, parentId }) => ({
        url: `/drama-episodes/${episodeId}/comments`,
        method: 'POST',
        body: { body, parent_id: parentId || undefined },
      }),
      transformResponse: mapComment,
      invalidatesTags: (_r, _e, arg) => [
        { type: 'DramaEpisode', id: `COMMENTS-${arg.episodeId}` },
        { type: 'DramaEpisode', id: arg.episodeId },
      ],
    }),

    deleteDramaEpisodeComment: builder.mutation<
      // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- delete has no payload
      void,
      { episodeId: number; commentId: number }
    >({
      query: ({ episodeId, commentId }) => ({
        url: `/drama-episodes/${episodeId}/comments/${commentId}`,
        method: 'DELETE',
      }),
      transformResponse: (raw) => {
        unwrapVoid()(raw);
      },
      invalidatesTags: (_r, _e, arg) => [
        { type: 'DramaEpisode', id: `COMMENTS-${arg.episodeId}` },
        { type: 'DramaEpisode', id: arg.episodeId },
      ],
    }),

    likeDramaEpisodeComment: builder.mutation<CommentLikeResult, { episodeId: number; commentId: number }>({
      query: ({ episodeId, commentId }) => ({
        url: `/drama-episodes/${episodeId}/comments/${commentId}/like`,
        method: 'POST',
      }),
      transformResponse: (raw): CommentLikeResult => {
        const data = unwrapData(commentLikeResultSchema)(raw);
        return { liked: data.liked, likesCount: data.likes_count };
      },
      async onQueryStarted({ episodeId, commentId }, { dispatch, getState, queryFulfilled }) {
        const patches = patchEpisodeCommentInCaches(dispatch, getState, episodeId, commentId, (c) => ({
          ...c,
          liked: true,
          likes: c.liked ? c.likes : c.likes + 1,
        }));
        try {
          const { data } = await queryFulfilled;
          patchEpisodeCommentInCaches(dispatch, getState, episodeId, commentId, (c) => ({
            ...c,
            liked: data.liked,
            likes: data.likesCount,
          }));
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),

    unlikeDramaEpisodeComment: builder.mutation<CommentLikeResult, { episodeId: number; commentId: number }>({
      query: ({ episodeId, commentId }) => ({
        url: `/drama-episodes/${episodeId}/comments/${commentId}/like`,
        method: 'DELETE',
      }),
      transformResponse: (raw): CommentLikeResult => {
        const data = unwrapData(commentLikeResultSchema)(raw);
        return { liked: data.liked, likesCount: data.likes_count };
      },
      async onQueryStarted({ episodeId, commentId }, { dispatch, getState, queryFulfilled }) {
        const patches = patchEpisodeCommentInCaches(dispatch, getState, episodeId, commentId, (c) => ({
          ...c,
          liked: false,
          likes: c.liked ? Math.max(0, c.likes - 1) : c.likes,
        }));
        try {
          const { data } = await queryFulfilled;
          patchEpisodeCommentInCaches(dispatch, getState, episodeId, commentId, (c) => ({
            ...c,
            liked: data.liked,
            likes: data.likesCount,
          }));
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),
  }),
});

export const {
  useGetDramaSerialsQuery,
  useGetDramaSerialQuery,
  useGetDramaEpisodeQuery,
  useLikeDramaEpisodeMutation,
  useDislikeDramaEpisodeMutation,
  useShareDramaEpisodeMutation,
  useGetDramaEpisodeCommentsQuery,
  useLazyGetDramaEpisodeCommentRepliesQuery,
  useAddDramaEpisodeCommentMutation,
  useDeleteDramaEpisodeCommentMutation,
  useLikeDramaEpisodeCommentMutation,
  useUnlikeDramaEpisodeCommentMutation,
} = entertainmentApi;
