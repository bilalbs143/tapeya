import { baseApi } from './baseApi';

/**
 * Admin graphic session API.
 *
 * GET  /admin/matches/:matchId/graphic-session
 *   → { data: { active_command: { command_key, command_type, payload, ... }, ... } }
 *
 * Primary consumer: GraphicOverlay — real-time updates arrive via Reverb
 * (useGraphicChannel) which patches this cache directly.  Polling every 30 s
 * acts as a fallback in case the WebSocket connection is interrupted.
 * Auth: requires Bearer token (standard admin session).
 */
export const graphicSessionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGraphicSession: builder.query({
      query: (matchId) => ({
        url: `/admin/matches/${matchId}/graphic-session`,
      }),
      transformResponse: (response) => response?.data ?? response,
    }),
  }),
});

export const { useGetGraphicSessionQuery } = graphicSessionApi;
