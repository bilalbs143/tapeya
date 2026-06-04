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
      invalidatesTags: ['Tournament'],
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

export const { useSearchTeamsQuery, useCreateTeamMutation, useGetTeamSquadQuery, useUpdateTeamSquadMutation } = teamApi;
