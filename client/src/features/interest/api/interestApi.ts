import { baseApi } from '@/shared/api/baseApi';
import type { MutationResult } from '@/shared/api/types';
import { unwrapMessage, unwrapMutation } from '@/shared/api/unwrap';

import {
  type InterestShowPayload,
  type InterestSubmission,
  type InterestSubmitBody,
  parseInterestShow,
  submissionToDomain,
  submissionWireSchema,
} from '../model/schemas';

export const interestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInterestCampaign: builder.query<InterestShowPayload, string>({
      query: (slug) => `/interest-campaigns/${slug}`,
      transformResponse: (raw: unknown) => parseInterestShow(raw),
      providesTags: (_r, _e, slug) => [{ type: 'InterestCampaign', id: slug }],
    }),

    submitInterest: builder.mutation<MutationResult<InterestSubmission>, { slug: string; body: InterestSubmitBody }>({
      query: ({ slug, body }) => ({
        url: `/interest-campaigns/${slug}/submissions`,
        method: 'POST',
        body,
      }),
      transformResponse: (raw: unknown) => {
        const result = unwrapMutation(submissionWireSchema)(raw);
        return {
          message: result.message,
          created: result.created,
          data: result.data ? submissionToDomain(result.data) : null,
        };
      },
      invalidatesTags: (_r, _e, { slug }) => [{ type: 'InterestCampaign', id: slug }],
    }),

    withdrawInterest: builder.mutation<string | undefined, string>({
      query: (slug) => ({
        url: `/interest-campaigns/${slug}/submissions/me`,
        method: 'DELETE',
      }),
      transformResponse: (raw: unknown) => unwrapMessage()(raw),
      invalidatesTags: (_r, _e, slug) => [{ type: 'InterestCampaign', id: slug }],
    }),
  }),
});

export const { useGetInterestCampaignQuery, useSubmitInterestMutation, useWithdrawInterestMutation } = interestApi;
