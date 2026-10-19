import { baseApi } from './baseApi';

export function normalizeEntertainment(raw) {
  return {
    id: raw.id,
    title: raw.title ?? '',
    provider: raw.provider ?? null,
    description: raw.description ?? null,
    poster: raw.poster ?? null,
    episodesCount: raw.episodes_count ?? 0,
    firstEpisodeId: raw.first_episode_id ?? null,
    episodes: Array.isArray(raw.episodes) ? raw.episodes.map(normalizeEpisodeSummary) : [],
    createdAt: raw.created_at ?? null,
  };
}

export function normalizeEpisodeSummary(raw) {
  return {
    id: raw.id,
    entertainmentId: raw.serial_id ?? raw.drama_serial_id ?? null,
    episodeNumber: raw.episode_number ?? 0,
    title: raw.title ?? '',
    description: raw.description ?? null,
    thumbnail: raw.thumbnail ?? null,
    duration: raw.duration ?? null,
    viewsCount: raw.views_count ?? 0,
    likesCount: raw.likes_count ?? 0,
    dislikesCount: raw.dislikes_count ?? 0,
    commentsCount: raw.comments_count ?? 0,
    sharesCount: raw.shares_count ?? 0,
  };
}

function normalizeEntertainmentSummary(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    title: raw.title ?? '',
    provider: raw.provider ?? null,
    poster: raw.poster ?? null,
  };
}

export function normalizeEpisode(raw) {
  const summary = normalizeEpisodeSummary(raw);
  return {
    ...summary,
    videoSource: raw.video_source ?? 'youtube',
    videoUrl: raw.video_url ?? null,
    myReaction: raw.my_reaction ?? null,
    entertainment: normalizeEntertainmentSummary(raw.serial),
    prevEpisodeId: raw.prev_episode_id ?? null,
    nextEpisodeId: raw.next_episode_id ?? null,
  };
}

function normalizeComment(raw) {
  const user = raw.user ?? {};
  return {
    id: raw.id,
    episodeId: raw.episode_id ?? null,
    parentId: raw.parent_id ?? null,
    body: raw.body ?? '',
    likesCount: Number(raw.likes_count ?? 0),
    liked: Boolean(raw.liked),
    isPinned: Boolean(raw.is_pinned),
    repliesCount: raw.replies_count ?? 0,
    createdAt: raw.created_at ?? null,
    user: {
      id: user.id ?? null,
      name: user.name ?? 'Player',
      nickname: user.nickname ?? null,
      avatarUrl: user.avatar_url ?? null,
      isOfficial: Boolean(user.is_official),
    },
  };
}

function normalizeCommentPage(data) {
  return {
    items: (data?.items ?? []).map(normalizeComment),
    currentPage: data?.current_page ?? 1,
    lastPage: data?.last_page ?? 1,
    perPage: data?.per_page ?? 20,
    total: data?.total ?? 0,
  };
}

export const entertainmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEntertainments: builder.query({
      query: (params = {}) => ({
        url: '/drama-serials',
        params: {
          'filter[search]': params.search || undefined,
          per_page: params.per_page ?? 50,
          sort: params.sort ?? '-created_at',
        },
      }),
      transformResponse: (response) => (response?.data ?? []).map(normalizeEntertainment),
      providesTags: (result) =>
        result
          ? [...result.map((item) => ({ type: 'Entertainment', id: item.id })), { type: 'Entertainment', id: 'LIST' }]
          : [{ type: 'Entertainment', id: 'LIST' }],
    }),

    getEntertainment: builder.query({
      query: (id) => ({ url: `/drama-serials/${id}` }),
      transformResponse: (response) => normalizeEntertainment(response?.data ?? response),
      providesTags: (_r, _e, id) => [{ type: 'Entertainment', id }],
    }),

    getEntertainmentEpisode: builder.query({
      query: (id) => ({ url: `/drama-episodes/${id}` }),
      transformResponse: (response) => normalizeEpisode(response?.data ?? response),
      providesTags: (_r, _e, id) => [{ type: 'EntertainmentEpisode', id }],
    }),

    likeEntertainmentEpisode: builder.mutation({
      query: (id) => ({ url: `/drama-episodes/${id}/like`, method: 'POST' }),
      transformResponse: (response) => response?.data ?? response,
    }),

    dislikeEntertainmentEpisode: builder.mutation({
      query: (id) => ({ url: `/drama-episodes/${id}/dislike`, method: 'POST' }),
      transformResponse: (response) => response?.data ?? response,
    }),

    shareEntertainmentEpisode: builder.mutation({
      query: (id) => ({ url: `/drama-episodes/${id}/share`, method: 'POST' }),
      transformResponse: (response) => response?.data ?? response,
    }),

    getEntertainmentEpisodeComments: builder.query({
      query: ({ episodeId, page = 1, perPage = 20 }) => ({
        url: `/drama-episodes/${episodeId}/comments`,
        params: { page, per_page: perPage },
      }),
      transformResponse: (response) => normalizeCommentPage(response?.data ?? response),
      providesTags: (_r, _e, arg) => [{ type: 'EntertainmentEpisode', id: `COMMENTS-${arg.episodeId}` }],
    }),

    getEntertainmentEpisodeCommentReplies: builder.query({
      query: ({ episodeId, commentId, page = 1, perPage = 20 }) => ({
        url: `/drama-episodes/${episodeId}/comments/${commentId}/replies`,
        params: { page, per_page: perPage },
      }),
      transformResponse: (response) => normalizeCommentPage(response?.data ?? response),
      providesTags: (_r, _e, arg) => [{ type: 'EntertainmentEpisode', id: `COMMENTS-${arg.episodeId}` }],
    }),

    addEntertainmentEpisodeComment: builder.mutation({
      query: ({ episodeId, body, parentId }) => ({
        url: `/drama-episodes/${episodeId}/comments`,
        method: 'POST',
        body: { body, parent_id: parentId || undefined },
      }),
      transformResponse: (response) => normalizeComment(response?.data ?? response),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'EntertainmentEpisode', id: `COMMENTS-${arg.episodeId}` },
        { type: 'EntertainmentEpisode', id: arg.episodeId },
      ],
    }),

    deleteEntertainmentEpisodeComment: builder.mutation({
      query: ({ episodeId, commentId }) => ({
        url: `/drama-episodes/${episodeId}/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'EntertainmentEpisode', id: `COMMENTS-${arg.episodeId}` },
        { type: 'EntertainmentEpisode', id: arg.episodeId },
      ],
    }),

    likeEntertainmentEpisodeComment: builder.mutation({
      query: ({ episodeId, commentId }) => ({
        url: `/drama-episodes/${episodeId}/comments/${commentId}/like`,
        method: 'POST',
      }),
      transformResponse: (response) => response?.data ?? response,
    }),

    unlikeEntertainmentEpisodeComment: builder.mutation({
      query: ({ episodeId, commentId }) => ({
        url: `/drama-episodes/${episodeId}/comments/${commentId}/like`,
        method: 'DELETE',
      }),
      transformResponse: (response) => response?.data ?? response,
    }),
  }),
});

export const {
  useGetEntertainmentsQuery,
  useGetEntertainmentQuery,
  useGetEntertainmentEpisodeQuery,
  useLikeEntertainmentEpisodeMutation,
  useDislikeEntertainmentEpisodeMutation,
  useShareEntertainmentEpisodeMutation,
  useGetEntertainmentEpisodeCommentsQuery,
  useLazyGetEntertainmentEpisodeCommentsQuery,
  useGetEntertainmentEpisodeCommentRepliesQuery,
  useLazyGetEntertainmentEpisodeCommentRepliesQuery,
  useAddEntertainmentEpisodeCommentMutation,
  useDeleteEntertainmentEpisodeCommentMutation,
  useLikeEntertainmentEpisodeCommentMutation,
  useUnlikeEntertainmentEpisodeCommentMutation,
} = entertainmentApi;
