import { baseApi } from './baseApi';

/**
 * User graphic session API (broadcast overlay).
 *
 * Authenticated: GET /matches/:matchId/graphic-session
 * Signed (OBS): GET /matches/:matchId/graphic-session/overlay?expires=&signature=
 *
 * Primary consumer: GraphicOverlay — loads initial session over HTTP; live
 * updates arrive via Reverb (useGraphicChannel) which patches this cache.
 */
export const graphicSessionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGraphicSession: builder.query({
      query: (arg) => {
        const signed =
          typeof arg === 'object' &&
          arg !== null &&
          'expires' in arg &&
          'signature' in arg &&
          arg.expires != null &&
          arg.signature != null;

        if (signed) {
          const { matchId, expires, signature } = arg;
          const qs = new URLSearchParams({
            expires: String(expires),
            signature: String(signature),
          });
          return { url: `/matches/${matchId}/graphic-session/overlay?${qs}` };
        }

        return { url: `/matches/${arg}/graphic-session` };
      },
      transformResponse: (response) => response?.data ?? response,
    }),
  }),
});

export const { useGetGraphicSessionQuery } = graphicSessionApi;
