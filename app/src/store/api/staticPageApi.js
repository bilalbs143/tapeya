import { baseApi } from './baseApi';

export const staticPageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStaticPageBySlug: builder.query({
      query: (slug) => ({
        url: `/static-pages/${encodeURIComponent(slug)}`,
      }),
      transformResponse: (response) => response?.data ?? null,
    }),
  }),
});

export const { useGetStaticPageBySlugQuery } = staticPageApi;
