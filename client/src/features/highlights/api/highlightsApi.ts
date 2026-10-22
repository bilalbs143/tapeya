import { baseApi } from '@/shared/api/baseApi';

import {
  type Highlight,
  type HighlightReactionCounts,
  parseHighlight,
  parseHighlightList,
  parseReactionCounts,
} from '../model/schemas';

type ListArg = { search?: string | undefined; perPage?: number | undefined; sort?: string | undefined };

export const highlightsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** CMS highlight catalog — single list sorted by newest. */
    getHighlights: builder.query<Highlight[], ListArg | undefined>({
      query: (arg) => ({
        url: '/highlights',
        params: {
          per_page: arg && 'perPage' in arg && arg.perPage != null ? arg.perPage : 50,
          sort: arg && 'sort' in arg && arg.sort ? arg.sort : '-created_at',
          ...(arg && 'search' in arg && arg.search?.trim() ? { 'filter[search]': arg.search.trim() } : {}),
        },
      }),
      transformResponse: (raw: unknown) => parseHighlightList(raw),
      providesTags: (result) =>
        result
          ? [...result.map((h) => ({ type: 'Highlight' as const, id: h.id })), { type: 'Highlight', id: 'LIST' }]
          : [{ type: 'Highlight', id: 'LIST' }],
    }),

    getHighlight: builder.query<Highlight, number>({
      query: (id) => `/highlights/${id}`,
      transformResponse: (raw: unknown) => parseHighlight(raw),
      providesTags: (_r, _e, id) => [{ type: 'Highlight', id }],
    }),

    likeHighlight: builder.mutation<HighlightReactionCounts, number>({
      query: (id) => ({ url: `/highlights/${id}/like`, method: 'POST' }),
      transformResponse: (raw: unknown) => parseReactionCounts(raw),
    }),

    dislikeHighlight: builder.mutation<HighlightReactionCounts, number>({
      query: (id) => ({ url: `/highlights/${id}/dislike`, method: 'POST' }),
      transformResponse: (raw: unknown) => parseReactionCounts(raw),
    }),

    shareHighlight: builder.mutation<HighlightReactionCounts, number>({
      query: (id) => ({ url: `/highlights/${id}/share`, method: 'POST' }),
      transformResponse: (raw: unknown) => parseReactionCounts(raw),
    }),
  }),
});

export const {
  useGetHighlightsQuery,
  useGetHighlightQuery,
  useLikeHighlightMutation,
  useDislikeHighlightMutation,
  useShareHighlightMutation,
} = highlightsApi;
