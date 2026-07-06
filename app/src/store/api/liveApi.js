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
  }),
});

export const { useGetLiveStreamsQuery, useGetLiveStreamQuery, useSendLiveCommentMutation, useSendLiveHeartMutation } = liveApi;
