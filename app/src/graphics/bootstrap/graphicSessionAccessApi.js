import { graphicsBootstrapBaseApi } from './bootstrapBaseApi';

/**
 * Graphics session bootstrap API.
 * GET /graphic-sessions/access/{accessToken}
 */
export const graphicSessionAccessApi = graphicsBootstrapBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGraphicSession: builder.query({
      query: (accessToken) => ({
        url: `/graphic-sessions/access/${encodeURIComponent(String(accessToken))}`,
      }),
      transformResponse: (response) => response?.data ?? response,
    }),
  }),
});

export const { useGetGraphicSessionQuery } = graphicSessionAccessApi;
