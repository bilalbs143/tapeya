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
  }),
});

export const {
  useGetLiveStreamsQuery,
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
} = liveApi;
