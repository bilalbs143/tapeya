import { baseApi } from './baseApi';

/**
 * Live stream hub and viewer — stream-centric API.
 */
export const liveApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLiveStreams: builder.query({
      query: () => ({
        url: '/live/matches',
      }),
      transformResponse: (response) => response?.data ?? [],
      providesTags: (result) =>
        result?.length
          ? [...result.map((row) => ({ type: 'LiveStreams', id: row.id })), { type: 'LiveStreams', id: 'LIST' }]
          : [{ type: 'LiveStreams', id: 'LIST' }],
    }),
    getLiveScores: builder.query({
      query: () => ({
        url: '/live/scores',
      }),
      transformResponse: (response) => response?.data ?? [],
      providesTags: (result) =>
        result?.length
          ? [...result.map((row) => ({ type: 'LiveScores', id: row.id })), { type: 'LiveScores', id: 'LIST' }]
          : [{ type: 'LiveScores', id: 'LIST' }],
    }),
    getLiveStream: builder.query({
      query: (streamId) => ({
        url: `/live/streams/${streamId}`,
      }),
      transformResponse: (response) => response?.data ?? response,
      providesTags: (_result, _err, streamId) => [{ type: 'LiveStreams', id: streamId }],
    }),
    sendLiveComment: builder.mutation({
      query: ({ streamId, body }) => ({
        url: `/live/streams/${streamId}/live-comments`,
        method: 'POST',
        body: { body },
      }),
      transformResponse: (response) => response?.data ?? response,
    }),
    sendLiveHeart: builder.mutation({
      query: ({ streamId }) => ({
        url: `/live/streams/${streamId}/live-hearts`,
        method: 'POST',
      }),
      transformResponse: (response) => response?.data ?? response,
    }),
    // ── Self-serve mobile broadcast — LiveBroadcastController (owner-gated) ──────
    acceptBroadcastTerms: builder.mutation({
      query: () => ({
        url: '/live/broadcasts/accept-terms',
        method: 'POST',
      }),
      transformResponse: (response) => response?.data ?? response,
      invalidatesTags: ['User'],
    }),
    createBroadcast: builder.mutation({
      query: ({ title, description, orientation }) => {
        const body = { title, description };
        if (orientation) body.orientation = orientation;
        return {
          url: '/live/broadcasts',
          method: 'POST',
          body,
        };
      },
      transformResponse: (response) => response?.data ?? response,
    }),
    getBroadcast: builder.query({
      query: (streamId) => ({
        url: `/live/broadcasts/${streamId}`,
      }),
      transformResponse: (response) => response?.data ?? response,
      providesTags: (_result, _err, streamId) => [{ type: 'LiveStreams', id: `broadcast:${streamId}` }],
    }),
    startBroadcastSession: builder.mutation({
      query: (streamId) => ({
        url: `/live/broadcasts/${streamId}/start`,
        method: 'POST',
      }),
      transformResponse: (response) => response?.data ?? response,
      invalidatesTags: (_result, _err, streamId) => [
        { type: 'LiveStreams', id: streamId },
        { type: 'LiveStreams', id: `broadcast:${streamId}` },
        { type: 'LiveStreams', id: 'LIST' },
      ],
    }),
    endBroadcast: builder.mutation({
      query: (streamId) => ({
        url: `/live/broadcasts/${streamId}/end`,
        method: 'POST',
      }),
      transformResponse: (response) => response?.data ?? response,
      invalidatesTags: (_result, _err, streamId) => [
        { type: 'LiveStreams', id: streamId },
        { type: 'LiveStreams', id: `broadcast:${streamId}` },
        { type: 'LiveStreams', id: 'LIST' },
      ],
    }),
    uploadBroadcastThumbnail: builder.mutation({
      query: ({ streamId, file }) => {
        const body = new FormData();
        body.append('file', file);
        return { url: `/live/broadcasts/${streamId}/thumbnail`, method: 'POST', body };
      },
      transformResponse: (response) => response?.data ?? response,
      invalidatesTags: (_result, _err, { streamId }) => [{ type: 'LiveStreams', id: streamId }],
    }),
    deleteBroadcastThumbnail: builder.mutation({
      query: (streamId) => ({
        url: `/live/broadcasts/${streamId}/thumbnail`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _err, streamId) => [{ type: 'LiveStreams', id: streamId }],
    }),

    // ── User-owned watch-URL streams (YouTube / HLS) ───────────────
    getMyLiveStreams: builder.query({
      query: () => ({ url: '/live/my-streams' }),
      transformResponse: (response) => response?.data ?? [],
      providesTags: (result) =>
        result?.length
          ? [...result.map((row) => ({ type: 'LiveStreams', id: `mine:${row.id}` })), { type: 'LiveStreams', id: 'MINE' }]
          : [{ type: 'LiveStreams', id: 'MINE' }],
    }),
    createMyLiveStream: builder.mutation({
      query: ({ title, description, streaming_url }) => ({
        url: '/live/my-streams',
        method: 'POST',
        body: { title, description, streaming_url },
      }),
      transformResponse: (response) => response?.data ?? response,
      invalidatesTags: [
        { type: 'LiveStreams', id: 'MINE' },
        { type: 'LiveStreams', id: 'LIST' },
      ],
    }),
    getMyLiveStream: builder.query({
      query: (streamId) => ({ url: `/live/my-streams/${streamId}` }),
      transformResponse: (response) => response?.data ?? response,
      providesTags: (_result, _err, streamId) => [{ type: 'LiveStreams', id: `mine:${streamId}` }],
    }),
    updateMyLiveStream: builder.mutation({
      query: ({ streamId, ...body }) => ({
        url: `/live/my-streams/${streamId}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response) => response?.data ?? response,
      invalidatesTags: (_result, _err, { streamId }) => [
        { type: 'LiveStreams', id: `mine:${streamId}` },
        { type: 'LiveStreams', id: 'MINE' },
        { type: 'LiveStreams', id: streamId },
        { type: 'LiveStreams', id: 'LIST' },
      ],
    }),
    startMyLiveStream: builder.mutation({
      query: (streamId) => ({
        url: `/live/my-streams/${streamId}/start`,
        method: 'POST',
      }),
      transformResponse: (response) => response?.data ?? response,
      invalidatesTags: (_result, _err, streamId) => [
        { type: 'LiveStreams', id: `mine:${streamId}` },
        { type: 'LiveStreams', id: 'MINE' },
        { type: 'LiveStreams', id: streamId },
        { type: 'LiveStreams', id: 'LIST' },
      ],
    }),
    endMyLiveStream: builder.mutation({
      query: (streamId) => ({
        url: `/live/my-streams/${streamId}/end`,
        method: 'POST',
      }),
      transformResponse: (response) => response?.data ?? response,
      invalidatesTags: (_result, _err, streamId) => [
        { type: 'LiveStreams', id: `mine:${streamId}` },
        { type: 'LiveStreams', id: 'MINE' },
        { type: 'LiveStreams', id: streamId },
        { type: 'LiveStreams', id: 'LIST' },
      ],
    }),
    uploadMyLiveStreamThumbnail: builder.mutation({
      query: ({ streamId, file }) => {
        const body = new FormData();
        body.append('file', file);
        return { url: `/live/my-streams/${streamId}/thumbnail`, method: 'POST', body };
      },
      transformResponse: (response) => response?.data ?? response,
      invalidatesTags: (_result, _err, { streamId }) => [
        { type: 'LiveStreams', id: `mine:${streamId}` },
        { type: 'LiveStreams', id: streamId },
      ],
    }),
    deleteMyLiveStreamThumbnail: builder.mutation({
      query: (streamId) => ({
        url: `/live/my-streams/${streamId}/thumbnail`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _err, streamId) => [
        { type: 'LiveStreams', id: `mine:${streamId}` },
        { type: 'LiveStreams', id: streamId },
      ],
    }),
  }),
});

export const {
  useGetLiveStreamsQuery,
  useGetLiveScoresQuery,
  useGetLiveStreamQuery,
  useSendLiveCommentMutation,
  useSendLiveHeartMutation,
  useAcceptBroadcastTermsMutation,
  useCreateBroadcastMutation,
  useGetBroadcastQuery,
  useStartBroadcastSessionMutation,
  useEndBroadcastMutation,
  useUploadBroadcastThumbnailMutation,
  useDeleteBroadcastThumbnailMutation,
  useGetMyLiveStreamsQuery,
  useCreateMyLiveStreamMutation,
  useGetMyLiveStreamQuery,
  useUpdateMyLiveStreamMutation,
  useStartMyLiveStreamMutation,
  useEndMyLiveStreamMutation,
  useUploadMyLiveStreamThumbnailMutation,
  useDeleteMyLiveStreamThumbnailMutation,
} = liveApi;
