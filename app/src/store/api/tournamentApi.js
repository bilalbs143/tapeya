import { baseApi } from './baseApi';

/**
 * Tournament API – list and show tournaments (user app, auth required).
 * GET /tournaments, GET /tournaments/:id
 * Use organizer_tournaments=1 to list only tournaments where the user is organizer.
 * Backend returns { data } for single, { data: [...], meta? } for list.
 */
export const tournamentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTournaments: builder.query({
      query: (params = {}) => ({
        url: '/tournaments',
        params: {
          all: params.all ? 1 : undefined,
          per_page: params.all ? undefined : (params.per_page ?? 15),
          page: params.all ? undefined : params.page,
          'filter[status]': params.status,
          organizer_tournaments: params.organizer_tournaments ? 1 : undefined,
          with_matches: params.with_matches ? 1 : undefined,
          sort: params.sort,
        },
      }),
      transformResponse: (response) => ({
        data: response?.data ?? [],
        meta: response?.meta,
      }),
      providesTags: (result) =>
        result?.data
          ? [...result.data.map((t) => ({ type: 'Tournament', id: t.id })), { type: 'Tournament', id: 'LIST' }]
          : [{ type: 'Tournament', id: 'LIST' }],
    }),
    getTournament: builder.query({
      query: ({ id, with_matches }) => ({
        url: `/tournaments/${id}`,
        params: {
          with_matches: with_matches ? 1 : undefined,
        },
      }),
      transformResponse: (response) => response?.data ?? response,
      providesTags: (result) => (result ? [{ type: 'Tournament', id: result.id }] : []),
    }),
    getTournamentTeams: builder.query({
      query: (tournamentId) => ({
        url: `/tournaments/${tournamentId}/teams`,
      }),
      transformResponse: (response) => response?.data ?? response ?? [],
      providesTags: (result, _err, tournamentId) =>
        tournamentId
          ? [
              { type: 'TournamentTeams', id: tournamentId },
              { type: 'Tournament', id: tournamentId },
            ]
          : [],
    }),
    getTournamentStandings: builder.query({
      query: (tournamentId) => ({
        url: `/tournaments/${tournamentId}/standings`,
      }),
      transformResponse: (response) => {
        const data = response?.data ?? {};
        if (Array.isArray(data.groups) && data.groups.length > 0) {
          return { groups: data.groups };
        }
        return {
          standings: Array.isArray(data.standings) ? data.standings : [],
        };
      },
      providesTags: (result, _err, tournamentId) => (tournamentId ? [{ type: 'TournamentStandings', id: tournamentId }] : []),
    }),
    getTournamentSeasonStats: builder.query({
      query: (tournamentId) => ({
        url: `/tournaments/${tournamentId}/season-stats`,
      }),
      transformResponse: (response) => response?.data ?? response ?? null,
      providesTags: (result, _err, tournamentId) => (tournamentId ? [{ type: 'TournamentSeasonStats', id: tournamentId }] : []),
    }),
    attachTeamsToTournament: builder.mutation({
      query: ({ tournamentId, team_ids, group_index }) => ({
        url: `/tournaments/${tournamentId}/teams`,
        method: 'POST',
        body: { team_ids, ...(group_index != null ? { group_index } : {}) },
      }),
      invalidatesTags: (_result, _err, { tournamentId }) => [
        { type: 'TournamentTeams', id: tournamentId },
        { type: 'Tournament', id: tournamentId },
        { type: 'Tournament', id: 'LIST' },
      ],
    }),
    updateTournamentTeamGroup: builder.mutation({
      query: ({ tournamentId, teamId, group_index }) => ({
        url: `/tournaments/${tournamentId}/teams/${teamId}`,
        method: 'PATCH',
        body: { group_index },
      }),
      invalidatesTags: (_result, _err, { tournamentId }) => [
        { type: 'TournamentTeams', id: tournamentId },
        { type: 'Tournament', id: tournamentId },
        { type: 'Tournament', id: 'LIST' },
      ],
    }),
    removeTeamFromTournament: builder.mutation({
      query: ({ tournamentId, teamId }) => ({
        url: `/tournaments/${tournamentId}/teams/${teamId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _err, { tournamentId }) => [
        { type: 'TournamentTeams', id: tournamentId },
        { type: 'Tournament', id: tournamentId },
        { type: 'Tournament', id: 'LIST' },
      ],
    }),
    getTournamentMatches: builder.query({
      query: ({ tournamentId, all, per_page } = {}) => ({
        url: `/tournaments/${tournamentId}/matches`,
        params: all ? { all: 1 } : { per_page: per_page ?? 15 },
      }),
      transformResponse: (response) => response?.data ?? response ?? [],
      providesTags: (result, _err, args) =>
        args?.tournamentId
          ? [
              { type: 'TournamentMatches', id: args.tournamentId },
              { type: 'Tournament', id: args.tournamentId },
            ]
          : [],
    }),
    createTournamentMatch: builder.mutation({
      query: ({ tournamentId, ...body }) => ({
        url: `/tournaments/${tournamentId}/matches`,
        method: 'POST',
        body,
      }),
      transformResponse: (response) => response?.data ?? response,
      invalidatesTags: (_result, _err, { tournamentId }) =>
        tournamentId
          ? [
              { type: 'TournamentMatches', id: tournamentId },
              { type: 'Tournament', id: tournamentId },
            ]
          : [],
    }),
    likeTournament: builder.mutation({
      query: (tournamentId) => ({
        url: `/tournaments/${tournamentId}/like`,
        method: 'POST',
      }),
      transformResponse: (response) => response?.data ?? response,
      invalidatesTags: (_result, _err, tournamentId) => (tournamentId ? [{ type: 'Tournament', id: tournamentId }] : []),
    }),
    dislikeTournament: builder.mutation({
      query: (tournamentId) => ({
        url: `/tournaments/${tournamentId}/dislike`,
        method: 'POST',
      }),
      transformResponse: (response) => response?.data ?? response,
      invalidatesTags: (_result, _err, tournamentId) => (tournamentId ? [{ type: 'Tournament', id: tournamentId }] : []),
    }),
    shareTournament: builder.mutation({
      query: (tournamentId) => ({
        url: `/tournaments/${tournamentId}/share`,
        method: 'POST',
      }),
      transformResponse: (response) => response?.data ?? response,
      invalidatesTags: (_result, _err, tournamentId) => (tournamentId ? [{ type: 'Tournament', id: tournamentId }] : []),
    }),
  }),
});

export const {
  useGetTournamentsQuery,
  useGetTournamentQuery,
  useLazyGetTournamentQuery,
  useGetTournamentTeamsQuery,
  useGetTournamentMatchesQuery,
  useGetTournamentStandingsQuery,
  useGetTournamentSeasonStatsQuery,
  useCreateTournamentMatchMutation,
  useAttachTeamsToTournamentMutation,
  useUpdateTournamentTeamGroupMutation,
  useRemoveTeamFromTournamentMutation,
  useLikeTournamentMutation,
  useDislikeTournamentMutation,
  useShareTournamentMutation,
} = tournamentApi;
