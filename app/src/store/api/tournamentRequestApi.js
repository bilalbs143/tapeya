import { baseApi } from './baseApi';

/**
 * Tournament request API – list and submit tournament requests (auth required).
 * GET /tournament-requests — current user's requests
 * POST /tournament-requests — submit new request
 */
export const tournamentRequestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyTournamentRequests: builder.query({
      query: (params = {}) => ({
        url: '/tournament-requests',
        params: params.status ? { status: params.status } : undefined,
      }),
      transformResponse: (response) => response?.data ?? [],
      providesTags: [{ type: 'TournamentRequest', id: 'MY_LIST' }],
    }),
    createTournamentRequest: builder.mutation({
      query: (body) => ({
        url: '/tournament-requests',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'TournamentRequest', id: 'MY_LIST' }, 'Tournament'],
    }),
  }),
});

export const { useGetMyTournamentRequestsQuery, useCreateTournamentRequestMutation } = tournamentRequestApi;
