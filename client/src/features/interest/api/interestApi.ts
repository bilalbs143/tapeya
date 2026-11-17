import { baseApi } from '@/shared/api/baseApi';
import type { MutationResult } from '@/shared/api/types';
import { unwrapMutation } from '@/shared/api/unwrap';

import {
  type InterestDialogPayload,
  type InterestShowPayload,
  type InterestSubmission,
  type InterestSubmitBody,
  parseInterestDialog,
  parseInterestShow,
  submissionToDomain,
  submissionWireSchema,
} from '../model/schemas';

type InterestTag = { type: 'InterestCampaign'; id: string };

function interestCampaignTags(slug: string): InterestTag[] {
  return [
    { type: 'InterestCampaign', id: slug },
    { type: 'InterestCampaign', id: 'DIALOG' },
    { type: 'InterestCampaign', id: 'SIDEBAR' },
  ];
}

export const interestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- RTK Query no-arg query
    getSidebarInterestCampaign: builder.query<InterestDialogPayload, void>({
      query: () => '/interest-campaigns/sidebar',
      transformResponse: (raw: unknown) => parseInterestDialog(raw),
      providesTags: () => [{ type: 'InterestCampaign', id: 'SIDEBAR' }],
    }),

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- RTK Query no-arg query
    getDialogInterestCampaign: builder.query<InterestDialogPayload, void>({
      query: () => '/interest-campaigns/dialog',
      transformResponse: (raw: unknown) => parseInterestDialog(raw),
      providesTags: () => [{ type: 'InterestCampaign', id: 'DIALOG' }],
    }),

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
      invalidatesTags: (_r, _e, { slug }) => interestCampaignTags(slug),
    }),
  }),
});

export const {
  useGetSidebarInterestCampaignQuery,
  useGetDialogInterestCampaignQuery,
  useGetInterestCampaignQuery,
  useSubmitInterestMutation,
} = interestApi;
