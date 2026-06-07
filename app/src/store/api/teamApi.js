import { baseApi } from './baseApi';
import { stripDeferredMediaFields } from './mediaApi';

/**
 * Team API – search teams, create team (auth required).
 * GET /teams?search=... — search by code or name.
 * POST /teams — create team (JSON). Logo via POST /media/team/{id}/logo after create.
 */
export const teamApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchTeams: builder.query({
      query: (search = '') => ({
        url: '/teams',
        params: search.trim() ? { search: search.trim() } : {},
      }),
      transformResponse: (response) => response?.data ?? response ?? [],
      providesTags: (result) =>
        Array.isArray(result) && result.length > 0
          ? [...result.map((team) => ({ type: 'Team', id: team.id })), { type: 'Team', id: 'LIST' }]
          : [{ type: 'Team', id: 'LIST' }],
    }),
    createTeam: builder.mutation({
      query: (payload) => {
        const body = stripDeferredMediaFields(payload);
        return {
          url: '/teams',
          method: 'POST',
          body: {
            name: body.name,
            code: body.code,
            country: body.country,
            city: body.city,
            sponsor_user_id: body.sponsor_user_id ?? null,
            icon_player_ids: body.icon_player_ids ?? [],
          },
        };
      },
      invalidatesTags: [{ type: 'Team', id: 'LIST' }, 'Tournament'],
    }),
    updateTeam: builder.mutation({
      query: ({ teamId, ...payload }) => ({
        url: `/teams/${teamId}`,
        method: 'PUT',
        body: {
          name: payload.name,
          code: payload.code,
          country: payload.country,
          city: payload.city,
          sponsor_user_id: payload.sponsor_user_id ?? null,
          icon_player_ids: payload.icon_player_ids ?? [],
        },
      }),
      invalidatesTags: (_result, _error, { teamId }) => [
        { type: 'Team', id: teamId },
        { type: 'Team', id: 'LIST' },
        'Tournament',
      ],
    }),
    getTeamSquad: builder.query({
      query: (teamId) => ({
        url: `/teams/${teamId}/squad`,
      }),
      transformResponse: (response) => response?.data ?? response ?? [],
      providesTags: (_result, _err, teamId) => (teamId ? [{ type: 'TeamSquad', id: teamId }] : []),
    }),
    updateTeamSquad: builder.mutation({
      query: ({ teamId, player_ids }) => ({
        url: `/teams/${teamId}/squad`,
        method: 'POST',
        body: { player_ids },
      }),
      invalidatesTags: (_result, _err, { teamId, tournamentId }) => {
        const tags = teamId ? [{ type: 'TeamSquad', id: teamId }] : [];
        if (tournamentId) {
          tags.push({ type: 'TournamentSquadOccupancy', id: tournamentId });
        }
        return tags;
      },
    }),
  }),
});

export const {
  useSearchTeamsQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useGetTeamSquadQuery,
  useUpdateTeamSquadMutation,
} = teamApi;
