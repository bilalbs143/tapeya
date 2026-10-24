import { z } from 'zod';

import { baseApi } from '@/shared/api/baseApi';
import { mergeCursorPages } from '@/shared/api/mergeCursorPages';
import type { CursorPage } from '@/shared/api/types';
import { unwrapCursorPage, unwrapData } from '@/shared/api/unwrap';

import { type Reel, REEL_TAB_PATH, type ReelTab, reelWireSchema, toDomain } from '../model/schemas';

const likeResultSchema = z.object({
  liked: z.boolean(),
  likes_count: z.number(),
});

const saveResultSchema = z.object({
  saved: z.boolean(),
  saves_count: z.number(),
});

const shareResultSchema = z.object({
  shares_count: z.number(),
});

function mapReelPage(raw: unknown): CursorPage<Reel> {
  return unwrapCursorPage(reelWireSchema, toDomain)(raw);
}

function mapReel(raw: unknown): Reel {
  return toDomain(unwrapData(reelWireSchema)(raw));
}

export const reelsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReels: builder.query<CursorPage<Reel>, { tab: ReelTab; cursor?: string }>({
      query: ({ tab, cursor }) => ({
        url: REEL_TAB_PATH[tab],
        params: {
          per_page: 10,
          ...(cursor ? { cursor } : {}),
        },
      }),
      transformResponse: mapReelPage,
      serializeQueryArgs: ({ endpointName, queryArgs }) => `${endpointName}(${queryArgs.tab})`,
      merge: mergeCursorPages,
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.tab !== previousArg?.tab || currentArg?.cursor !== previousArg?.cursor,
      providesTags: (result, _err, arg) =>
        result
          ? [...result.items.map((r) => ({ type: 'Reel' as const, id: r.id })), { type: 'Reel', id: `LIST-${arg.tab}` }]
          : [{ type: 'Reel', id: `LIST-${arg.tab}` }],
    }),

    getReel: builder.query<Reel, number>({
      query: (id) => `/reels/${id}`,
      transformResponse: mapReel,
      providesTags: (_r, _e, id) => [{ type: 'Reel', id }],
    }),

    getUserReels: builder.query<
      CursorPage<Reel>,
      { userId: number; cursor?: string | undefined; perPage?: number | undefined }
    >({
      query: ({ userId, cursor, perPage = 18 }) => ({
        url: `/users/${userId}/reels`,
        params: { cursor: cursor ?? undefined, per_page: perPage },
      }),
      transformResponse: mapReelPage,
      serializeQueryArgs: ({ endpointName, queryArgs }) => `${endpointName}(${queryArgs.userId})`,
      merge: mergeCursorPages,
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.userId !== previousArg?.userId || currentArg?.cursor !== previousArg?.cursor,
      providesTags: (result, _e, arg) =>
        result
          ? [
              ...result.items.map((r) => ({ type: 'Reel' as const, id: r.id })),
              { type: 'Reel', id: `USER-${arg.userId}` },
            ]
          : [{ type: 'Reel', id: `USER-${arg.userId}` }],
    }),

    createReel: builder.mutation<Reel, { caption?: string | undefined; client_duration_ms?: number | undefined }>({
      query: (body) => ({ url: '/reels', method: 'POST', body }),
      transformResponse: mapReel,
      // Do not invalidate LIST-mine here — shell is status=uploading with no playback yet.
    }),

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- delete has no payload
    deleteReel: builder.mutation<void, number>({
      query: (id) => ({ url: `/reels/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Reel', id },
        { type: 'Reel', id: 'LIST-mine' },
        { type: 'Reel', id: 'LIST-explore' },
      ],
    }),

    initReelMultipart: builder.mutation<{ upload_id: string; part_size?: number | undefined }, number>({
      query: (id) => ({ url: `/reels/${id}/upload/init`, method: 'POST' }),
      transformResponse: (raw) =>
        unwrapData(z.object({ upload_id: z.string(), part_size: z.number().optional() }))(raw),
    }),

    completeReelMultipart: builder.mutation<
      Reel,
      {
        id: number;
        uploadId: string;
        totalParts: number;
        filename?: string | undefined;
        contentType?: string | undefined;
      }
    >({
      query: ({ id, uploadId, totalParts, filename, contentType }) => ({
        url: `/reels/${id}/upload/complete`,
        method: 'POST',
        body: {
          upload_id: uploadId,
          total_parts: totalParts,
          filename: filename || undefined,
          content_type: contentType || undefined,
        },
      }),
      transformResponse: mapReel,
      invalidatesTags: [{ type: 'Reel', id: 'LIST-mine' }],
    }),

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- abort has no payload
    abortReelMultipart: builder.mutation<void, { id: number; uploadId: string }>({
      query: ({ id, uploadId }) => ({
        url: `/reels/${id}/upload/abort`,
        method: 'POST',
        body: { upload_id: uploadId },
      }),
    }),

    likeReel: builder.mutation<{ liked: boolean; likesCount: number }, number>({
      query: (id) => ({ url: `/posts/${id}/like`, method: 'POST' }),
      transformResponse: (raw) => {
        const data = unwrapData(likeResultSchema)(raw);
        return { liked: data.liked, likesCount: data.likes_count };
      },
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patches = patchReelEngagement(dispatch, id, (r) => ({
          ...r,
          liked: true,
          likes: r.liked ? r.likes : r.likes + 1,
        }));
        try {
          const { data } = await queryFulfilled;
          patchReelEngagement(dispatch, id, (r) => ({ ...r, liked: data.liked, likes: data.likesCount }));
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),

    unlikeReel: builder.mutation<{ liked: boolean; likesCount: number }, number>({
      query: (id) => ({ url: `/posts/${id}/like`, method: 'DELETE' }),
      transformResponse: (raw) => {
        const data = unwrapData(likeResultSchema)(raw);
        return { liked: data.liked, likesCount: data.likes_count };
      },
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patches = patchReelEngagement(dispatch, id, (r) => ({
          ...r,
          liked: false,
          likes: r.liked ? Math.max(0, r.likes - 1) : r.likes,
        }));
        try {
          const { data } = await queryFulfilled;
          patchReelEngagement(dispatch, id, (r) => ({ ...r, liked: data.liked, likes: data.likesCount }));
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),

    saveReel: builder.mutation<{ saved: boolean; savesCount: number }, number>({
      query: (id) => ({ url: `/posts/${id}/save`, method: 'POST' }),
      transformResponse: (raw) => {
        const data = unwrapData(saveResultSchema)(raw);
        return { saved: data.saved, savesCount: data.saves_count };
      },
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patches = patchReelEngagement(dispatch, id, (r) => ({
          ...r,
          saved: true,
          saves: r.saved ? r.saves : r.saves + 1,
        }));
        try {
          const { data } = await queryFulfilled;
          patchReelEngagement(dispatch, id, (r) => ({ ...r, saved: data.saved, saves: data.savesCount }));
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),

    unsaveReel: builder.mutation<{ saved: boolean; savesCount: number }, number>({
      query: (id) => ({ url: `/posts/${id}/save`, method: 'DELETE' }),
      transformResponse: (raw) => {
        const data = unwrapData(saveResultSchema)(raw);
        return { saved: data.saved, savesCount: data.saves_count };
      },
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patches = patchReelEngagement(dispatch, id, (r) => ({
          ...r,
          saved: false,
          saves: r.saved ? Math.max(0, r.saves - 1) : r.saves,
        }));
        try {
          const { data } = await queryFulfilled;
          patchReelEngagement(dispatch, id, (r) => ({ ...r, saved: data.saved, saves: data.savesCount }));
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),

    shareReel: builder.mutation<{ sharesCount: number }, { id: number; channel: string }>({
      query: ({ id, channel }) => ({
        url: `/posts/${id}/share`,
        method: 'POST',
        body: { channel },
      }),
      transformResponse: (raw) => {
        const data = unwrapData(shareResultSchema)(raw);
        return { sharesCount: data.shares_count };
      },
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        const patches = patchReelEngagement(dispatch, id, (r) => ({
          ...r,
          shares: r.shares + 1,
        }));
        try {
          const { data } = await queryFulfilled;
          patchReelEngagement(dispatch, id, (r) => ({ ...r, shares: data.sharesCount }));
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),
  }),
});

function patchReelEngagement(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- RTK dispatch
  dispatch: any,
  id: number,
  updater: (reel: Reel) => Reel
) {
  const tabs: ReelTab[] = ['explore', 'following', 'mine', 'saved'];
  return [
    ...tabs.map((tab) =>
      dispatch(
        reelsApi.util.updateQueryData('getReels', { tab }, (draft) => {
          const hit = draft.items.find((r) => r.id === id);
          if (hit) Object.assign(hit, updater(hit));
        })
      )
    ),
    dispatch(
      reelsApi.util.updateQueryData('getReel', id, (draft) => {
        Object.assign(draft, updater(draft));
      })
    ),
  ];
}

export const {
  useGetReelsQuery,
  useGetReelQuery,
  useGetUserReelsQuery,
  useCreateReelMutation,
  useDeleteReelMutation,
  useInitReelMultipartMutation,
  useCompleteReelMultipartMutation,
  useAbortReelMultipartMutation,
  useLikeReelMutation,
  useUnlikeReelMutation,
  useSaveReelMutation,
  useUnsaveReelMutation,
  useShareReelMutation,
} = reelsApi;
