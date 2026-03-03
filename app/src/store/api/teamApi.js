import { baseApi } from './baseApi';

/**
 * Build FormData for team create when logo is a File (API accepts multipart like other endpoints).
 */
function buildTeamFormData(payload) {
  const fd = new FormData();
  fd.append('name', payload.name);
  fd.append('code', payload.code);
  fd.append('country', payload.country);
  fd.append('city', payload.city);
  if (payload.sponsor_user_id != null && payload.sponsor_user_id !== '') {
    fd.append('sponsor_user_id', String(payload.sponsor_user_id));
  }
  const iconIds = payload.icon_player_ids ?? [];
  if (Array.isArray(iconIds) && iconIds.length > 0) {
    iconIds.forEach((id) => fd.append('icon_player_ids[]', String(id)));
  }
  if (payload.logo instanceof File) {
    fd.append('logo', payload.logo);
  }
  return fd;
}

/**
 * Team API – search teams, create team (auth required).
 * GET /teams?search=... — search by code or name.
 * POST /teams — create team (JSON or multipart).
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
        const hasFile = payload.logo instanceof File;
        const body = hasFile
          ? buildTeamFormData(payload)
          : {
              name: payload.name,
              code: payload.code,
              country: payload.country,
              city: payload.city,
              sponsor_user_id: payload.sponsor_user_id ?? null,
              icon_player_ids: payload.icon_player_ids ?? [],
            };

        return {
          url: '/teams',
          method: 'POST',
          body,
        };
      },
      invalidatesTags: ['Tournament'],
    }),
    getTeamSquad: builder.query({
      query: (teamId) => ({
        url: `/teams/${teamId}/squad`,
      }),
      transformResponse: (response) => response?.data ?? response ?? [],
      providesTags: (_result, _err, teamId) =>
        teamId ? [{ type: 'TeamSquad', id: teamId }] : [],
    }),
    updateTeamSquad: builder.mutation({
      query: ({ teamId, player_ids }) => ({
        url: `/teams/${teamId}/squad`,
        method: 'POST',
        body: { player_ids },
      }),
      invalidatesTags: (_result, _err, { teamId }) =>
        teamId ? [{ type: 'TeamSquad', id: teamId }] : [],
    }),
  }),
});

export const {
  useSearchTeamsQuery,
  useCreateTeamMutation,
  useGetTeamSquadQuery,
  useUpdateTeamSquadMutation,
} = teamApi;
