import { baseApi } from './baseApi';

/**
 * Event request API – submit tournament/event requests (auth required).
 * POST /event-requests; backend returns { data, message }.
 */
export const eventRequestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createEventRequest: builder.mutation({
      query: (body) => ({
        url: '/event-requests',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['List'],
    }),
  }),
});

export const { useCreateEventRequestMutation } = eventRequestApi;
