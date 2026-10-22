import { z } from 'zod';

import { baseApi } from '@/shared/api/baseApi';
import { unwrapData, unwrapList, unwrapMessage } from '@/shared/api/unwrap';

import {
  acceptTermsResultWireSchema,
  type CreateBroadcastResult,
  createBroadcastResultWireSchema,
  type LiveComment,
  liveCommentWireSchema,
  type LiveStream,
  liveStreamWireSchema,
  type OwnerBroadcast,
  ownerBroadcastWireSchema,
  toCreateBroadcastResult,
  toLiveComment,
  toLiveStream,
  toOwnerBroadcast,
} from '../model/schemas';

const startBroadcastResultWireSchema = z.object({
  status: z.union([z.string(), z.literal('live')]),
  started_at: z.string().nullable().optional(),
});

const endBroadcastResultWireSchema = z.object({
  status: z.string(),
});

const thumbnailResultWireSchema = z.object({
  thumbnail_url: z.string().nullable().optional(),
});

const commentIdResultWireSchema = z.object({
  id: z.union([z.string(), z.number()]),
});

export const liveApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- RTK Query no-arg query
    getLiveStreams: builder.query<LiveStream[], void>({
      query: () => '/live/matches',
      transformResponse: (raw: unknown) => unwrapList(liveStreamWireSchema)(raw).map(toLiveStream),
      providesTags: (result) =>
        result?.length
          ? [
              ...result.map((row) => ({ type: 'LiveStreams' as const, id: row.id })),
              { type: 'LiveStreams', id: 'LIST' },
            ]
          : [{ type: 'LiveStreams', id: 'LIST' }],
    }),

    getLiveStream: builder.query<LiveStream, { streamId: number; authed?: boolean | undefined }>({
      query: ({ streamId }) => `/live/streams/${streamId}`,
      serializeQueryArgs: ({ queryArgs }) => `${queryArgs.streamId}:${queryArgs.authed ? 'auth' : 'guest'}`,
      transformResponse: (raw: unknown) => toLiveStream(unwrapData(liveStreamWireSchema)(raw)),
      providesTags: (_r, _e, { streamId }) => [{ type: 'LiveStreams', id: streamId }],
    }),

    getLiveComments: builder.query<LiveComment[], number>({
      query: (streamId) => `/live/streams/${streamId}/live-comments`,
      transformResponse: (raw: unknown) => unwrapList(liveCommentWireSchema)(raw).map(toLiveComment),
    }),

    sendLiveComment: builder.mutation<{ id: string }, { streamId: number; body: string }>({
      query: ({ streamId, body }) => ({
        url: `/live/streams/${streamId}/live-comments`,
        method: 'POST',
        body: { body },
      }),
      transformResponse: (raw: unknown) => {
        const data = unwrapData(commentIdResultWireSchema)(raw);
        return { id: String(data.id) };
      },
    }),

    sendLiveHeart: builder.mutation<{ ok: true }, { streamId: number }>({
      query: ({ streamId }) => ({
        url: `/live/streams/${streamId}/live-hearts`,
        method: 'POST',
      }),
      transformResponse: () => ({ ok: true as const }),
    }),

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- RTK Query no-arg mutation
    acceptBroadcastTerms: builder.mutation<{ acceptedAt: string | null }, void>({
      query: () => ({
        url: '/live/broadcasts/accept-terms',
        method: 'POST',
      }),
      transformResponse: (raw: unknown) => {
        const data = unwrapData(acceptTermsResultWireSchema)(raw);
        return { acceptedAt: data.broadcast_terms_accepted_at ?? null };
      },
      invalidatesTags: [{ type: 'User', id: 'ME' }],
    }),

    createBroadcast: builder.mutation<
      CreateBroadcastResult,
      { title: string; description?: string | null | undefined; orientation?: string | undefined }
    >({
      query: ({ title, description, orientation }) => {
        const body: Record<string, string> = { title };
        if (description) body.description = description;
        if (orientation) body.orientation = orientation;
        return { url: '/live/broadcasts', method: 'POST', body };
      },
      transformResponse: (raw: unknown) => toCreateBroadcastResult(unwrapData(createBroadcastResultWireSchema)(raw)),
    }),

    getBroadcast: builder.query<OwnerBroadcast, number>({
      query: (streamId) => `/live/broadcasts/${streamId}`,
      transformResponse: (raw: unknown) => toOwnerBroadcast(unwrapData(ownerBroadcastWireSchema)(raw)),
      providesTags: (_r, _e, streamId) => [{ type: 'LiveStreams', id: `broadcast:${streamId}` }],
    }),

    startBroadcastSession: builder.mutation<{ status: string; startedAt: string | null }, number>({
      query: (streamId) => ({
        url: `/live/broadcasts/${streamId}/start`,
        method: 'POST',
      }),
      transformResponse: (raw: unknown) => {
        const data = unwrapData(startBroadcastResultWireSchema)(raw);
        return { status: String(data.status), startedAt: data.started_at ?? null };
      },
      invalidatesTags: (_r, _e, streamId) => [
        { type: 'LiveStreams', id: streamId },
        { type: 'LiveStreams', id: `broadcast:${streamId}` },
        { type: 'LiveStreams', id: 'LIST' },
      ],
    }),

    endBroadcast: builder.mutation<{ status: string }, number>({
      query: (streamId) => ({
        url: `/live/broadcasts/${streamId}/end`,
        method: 'POST',
      }),
      transformResponse: (raw: unknown) => {
        const data = unwrapData(endBroadcastResultWireSchema)(raw);
        return { status: String(data.status) };
      },
      invalidatesTags: (_r, _e, streamId) => [
        { type: 'LiveStreams', id: streamId },
        { type: 'LiveStreams', id: `broadcast:${streamId}` },
        { type: 'LiveStreams', id: 'LIST' },
      ],
    }),

    uploadBroadcastThumbnail: builder.mutation<{ thumbnailUrl: string | null }, { streamId: number; file: File }>({
      query: ({ streamId, file }) => {
        const body = new FormData();
        body.append('file', file);
        return { url: `/live/broadcasts/${streamId}/thumbnail`, method: 'POST', body };
      },
      transformResponse: (raw: unknown) => {
        const data = unwrapData(thumbnailResultWireSchema)(raw);
        return { thumbnailUrl: data.thumbnail_url ?? null };
      },
      invalidatesTags: (_r, _e, { streamId }) => [{ type: 'LiveStreams', id: streamId }],
    }),

    deleteBroadcastThumbnail: builder.mutation<string | undefined, number>({
      query: (streamId) => ({
        url: `/live/broadcasts/${streamId}/thumbnail`,
        method: 'DELETE',
      }),
      transformResponse: unwrapMessage(),
      invalidatesTags: (_r, _e, streamId) => [{ type: 'LiveStreams', id: streamId }],
    }),
  }),
});

export const {
  useGetLiveStreamsQuery,
  useGetLiveStreamQuery,
  useGetLiveCommentsQuery,
  useSendLiveCommentMutation,
  useSendLiveHeartMutation,
  useAcceptBroadcastTermsMutation,
  useCreateBroadcastMutation,
  useGetBroadcastQuery,
  useStartBroadcastSessionMutation,
  useEndBroadcastMutation,
  useUploadBroadcastThumbnailMutation,
  useDeleteBroadcastThumbnailMutation,
} = liveApi;
