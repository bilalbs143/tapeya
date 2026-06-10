import { baseApi } from './baseApi';

export const tournamentInterestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSidebarInterestCampaign: builder.query({
      query: () => '/interest-campaigns/sidebar',
      transformResponse: (response) => response?.data ?? response,
      providesTags: () => [{ type: 'InterestCampaign', id: 'SIDEBAR' }],
    }),
    getInterestCampaign: builder.query({
      query: ({ slug }) => `/interest-campaigns/${slug}`,
      transformResponse: (response) => response?.data ?? response,
      providesTags: (_result, _err, { slug }) => [{ type: 'InterestCampaign', id: slug }],
    }),
    submitInterest: builder.mutation({
      query: ({ slug, body }) => ({
        url: `/interest-campaigns/${slug}/submissions`,
        method: 'POST',
        body,
      }),
      transformResponse: (response) => response?.data ?? response,
      invalidatesTags: (_result, _err, { slug }) => [
        { type: 'InterestCampaign', id: slug },
        { type: 'InterestCampaign', id: 'SIDEBAR' },
      ],
    }),
    withdrawInterest: builder.mutation({
      query: ({ slug }) => ({
        url: `/interest-campaigns/${slug}/submissions/me`,
        method: 'DELETE',
      }),
      transformResponse: (response) => response?.data ?? response,
      invalidatesTags: (_result, _err, { slug }) => [
        { type: 'InterestCampaign', id: slug },
        { type: 'InterestCampaign', id: 'SIDEBAR' },
      ],
    }),
  }),
});

export const {
  useGetSidebarInterestCampaignQuery,
  useGetInterestCampaignQuery,
  useSubmitInterestMutation,
  useWithdrawInterestMutation,
} = tournamentInterestApi;
