import { baseApi } from './baseApi';

/**
 * Tournament request API – submit tournament requests (auth required).
 * POST /tournament-requests; backend returns { data, message }.
 */
export const tournamentRequestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createTournamentRequest: builder.mutation({
      query: (body) => ({
        url: '/tournament-requests',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['List'],
    }),
  }),
});

export const { useCreateTournamentRequestMutation } = tournamentRequestApi;
