import { baseApi } from './baseApi';

/**
 * Common API - inject into baseApi.
 * Use this for all non-auth endpoints (e.g. lists, items, settings).
 *
 * Add endpoints here and use providesTags / invalidatesTags for cache:
 * - 'List' – list endpoints
 * - 'Item' – single item endpoints (or add more tag types in baseApi)
 */
export const commonApi = baseApi.injectEndpoints({
  endpoints: (_builder) => ({
    // Example: add your endpoints here
    // getItems: builder.query({
    //   query: (params) => ({ url: '/items', params }),
    //   providesTags: (result) =>
    //     result
    //       ? [...result.map(({ id }) => ({ type: 'Item', id })), 'List']
    //       : ['List'],
    // }),
    // getItem: builder.query({
    //   query: (id) => `/items/${id}`,
    //   providesTags: (_result, _err, id) => [{ type: 'Item', id }],
    // }),
  }),
});

// Export hooks as you add endpoints, e.g.:
// export const { useGetItemsQuery, useGetItemQuery } = commonApi;
