import { baseApi } from './baseApi';

/**
 * Tournament API – list and show tournaments (user app, auth required).
 * GET /tournaments, GET /tournaments/:id
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
          sort: params.sort,
        },
      }),
      transformResponse: (response) => ({
        data: response?.data ?? [],
        meta: response?.meta,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((t) => ({ type: 'Tournament', id: t.id })),
              { type: 'Tournament', id: 'LIST' },
            ]
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
      providesTags: (result) =>
        result ? [{ type: 'Tournament', id: result.id }] : [],
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
    attachTeamsToTournament: builder.mutation({
      query: ({ tournamentId, team_ids }) => ({
        url: `/tournaments/${tournamentId}/teams`,
        method: 'POST',
        body: { team_ids },
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
  }),
});

export const {
  useGetTournamentsQuery,
  useGetTournamentQuery,
  useLazyGetTournamentQuery,
  useGetTournamentTeamsQuery,
  useAttachTeamsToTournamentMutation,
  useRemoveTeamFromTournamentMutation,
} = tournamentApi;
