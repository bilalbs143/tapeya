import { baseApi } from './baseApi';

// ── Normalizer ──────────────────────────────────────────────────────────────

/**
 * Parse a duration string like "20 min" → 20.
 * Returns null if the string can't be parsed.
 * @param {string|null|undefined} raw
 * @returns {number|null}
 */
function parseDurationMinutes(raw) {
  if (!raw) return null;
  const match = String(raw).match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Normalize a raw API highlight object to the shape used throughout the app.
 * Keeps snake_case API fields and adds camelCase aliases so existing
 * components work without modification.
 *
 * @param {Record<string, unknown>} raw
 * @returns {NormalizedHighlight}
 */
export function normalizeHighlight(raw) {
  return {
    // Raw fields
    id: raw.id,
    title: raw.title ?? '',
    description: raw.description ?? null,
    thumbnail: raw.thumbnail ?? null,
    video_source: raw.video_source ?? 'youtube',
    video_url: raw.video_url ?? null,
    duration: raw.duration ?? null,
    tournament_id: raw.tournament_id ?? null,
    tournament: raw.tournament ?? null,
    is_active: raw.is_active ?? true,
    views_count: raw.views_count ?? 0,
    likes_count: raw.likes_count ?? 0,
    dislikes_count: raw.dislikes_count ?? 0,
    shares_count: raw.shares_count ?? 0,
    my_reaction: raw.my_reaction ?? null,
    created_at: raw.created_at ?? null,

    // camelCase aliases used by existing components
    thumbnailUrl: raw.thumbnail ?? null,
    videoUrl: raw.video_url ?? null,
    videoSource: raw.video_source ?? 'youtube',
    publishedAt: raw.created_at ?? null,
    viewsCount: raw.views_count ?? 0,
    likesCount: raw.likes_count ?? 0,
    dislikesCount: raw.dislikes_count ?? 0,
    sharesCount: raw.shares_count ?? 0,
    myReaction: raw.my_reaction ?? null,
    durationMinutes: parseDurationMinutes(raw.duration),
    // detailTitle: same as title (no separate field in API)
    detailTitle: raw.title ?? '',
  };
}

// ── API slice ────────────────────────────────────────────────────────────────

export const highlightApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * List active highlights.
     * Fetches up to 50 at a time (CMS content, small dataset).
     * The page handles client-side search and sort-by-views/date.
     *
     * @param {{ sort?: string, per_page?: number }} [params]
     */
    getHighlights: builder.query({
      query: (params = {}) => ({
        url: '/highlights',
        params: {
          'filter[search]': params.search || undefined,
          per_page: params.per_page ?? 50,
          sort: params.sort ?? '-created_at',
        },
      }),
      transformResponse: (response) => (response?.data ?? []).map(normalizeHighlight),
      providesTags: (result) =>
        result
          ? [...result.map((h) => ({ type: 'Highlight', id: h.id })), { type: 'Highlight', id: 'LIST' }]
          : [{ type: 'Highlight', id: 'LIST' }],
    }),

    /**
     * Fetch a single highlight by ID (also increments views_count on the server).
     * Returns `my_reaction` if the user is authenticated.
     *
     * @param {number|string} id
     */
    getHighlight: builder.query({
      query: (id) => ({ url: `/highlights/${id}` }),
      transformResponse: (response) => normalizeHighlight(response?.data ?? response),
      providesTags: (result) => (result ? [{ type: 'Highlight', id: result.id }] : []),
    }),

    /**
     * Like a highlight. Returns updated counts + my_reaction.
     * @param {number} id
     */
    likeHighlight: builder.mutation({
      query: (id) => ({ url: `/highlights/${id}/like`, method: 'POST' }),
      transformResponse: (response) => response?.data ?? response,
      // No invalidatesTags — counts are updated manually from the mutation response.
      // Invalidating would trigger a getHighlight refetch that overwrites the optimistic state.
    }),

    /**
     * Dislike a highlight. Returns updated counts + my_reaction.
     * @param {number} id
     */
    dislikeHighlight: builder.mutation({
      query: (id) => ({ url: `/highlights/${id}/dislike`, method: 'POST' }),
      transformResponse: (response) => response?.data ?? response,
    }),

    /**
     * Share a highlight. Returns updated counts.
     * @param {number} id
     */
    shareHighlight: builder.mutation({
      query: (id) => ({ url: `/highlights/${id}/share`, method: 'POST' }),
      transformResponse: (response) => response?.data ?? response,
    }),
  }),
});

export const {
  useGetHighlightsQuery,
  useGetHighlightQuery,
  useLikeHighlightMutation,
  useDislikeHighlightMutation,
  useShareHighlightMutation,
} = highlightApi;
