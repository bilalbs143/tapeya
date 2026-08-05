import { baseApi } from './baseApi';

/** Hidden suggestion buffer; widgets reveal only three users at a time. */
export const SUGGESTED_USERS_ARG = { limit: 20 };

/**
 * @param {Record<string, unknown>} raw
 */
function normalizeUserSummary(raw) {
  return {
    id: raw.id,
    name: raw.name ?? '',
    nickname: raw.nickname ?? null,
    avatarUrl: raw.avatar_url ?? null,
    isOfficial: Boolean(raw.is_official),
  };
}

/**
 * @param {Record<string, unknown>} raw
 */
function normalizeSuggestedUser(raw) {
  return {
    id: raw.id,
    name: raw.name ?? '',
    nickname: raw.nickname ?? null,
    avatarUrl: raw.avatar_url ?? null,
    isOfficial: Boolean(raw.is_official),
    followersCount: Number(raw.followers_count ?? 0),
    playingRole: raw.playing_role ?? null,
    isFollowing: Boolean(raw.is_following),
    subtitle: typeof raw.subtitle === 'string' ? raw.subtitle : '',
  };
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updateActivePlatform: builder.mutation({
      query: (platform) => ({
        url: '/active-platform',
        method: 'PUT',
        body: { platform },
      }),
    }),

    // Users the requester follows are ranked first. Empty q returns a default browse list.
    // Only nickname-bearing active app users are returned (mention handles).
    searchUsers: builder.query({
      query: (q = '') => ({
        url: '/users/search',
        params: { q: q || undefined },
      }),
      transformResponse: (response) => (response?.data ?? []).map(normalizeUserSummary),
    }),

    /**
     * Team owner / squad / icon pickers — any non-blocked app user.
     * Distinct from searchUsers (mentions). GET /users/lookup?search=...
     */
    lookupUsers: builder.query({
      query: (search = '') => ({
        url: '/users/lookup',
        params: search != null && String(search).trim() !== '' ? { search: String(search).trim() } : {},
      }),
      transformResponse: (response) => response?.data ?? response ?? [],
    }),

    /**
     * Ranked who-to-follow for Explore feed widget.
     * @param {{ limit?: number }} [params]
     */
    getSuggestedUsers: builder.query({
      query: (params = SUGGESTED_USERS_ARG) => ({
        url: '/users/suggestions',
        params: {
          limit: params.limit ?? SUGGESTED_USERS_ARG.limit,
        },
      }),
      transformResponse: (response) => (response?.data ?? []).map(normalizeSuggestedUser),
      providesTags: [{ type: 'User', id: 'SUGGESTIONS' }],
    }),
  }),
});

export const { useUpdateActivePlatformMutation, useSearchUsersQuery, useLookupUsersQuery, useGetSuggestedUsersQuery } = userApi;
