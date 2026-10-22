import { z } from 'zod';

import { baseApi } from '@/shared/api/baseApi';
import { unwrapData, unwrapList } from '@/shared/api/unwrap';

import type { GraphicSession, GraphicTheme } from '../lib/broadcastGraphics';
import { graphicSessionWireSchema, graphicThemeWireSchema, toGraphicSession, toGraphicTheme } from './matchesApiShared';

export const matchGraphicsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** GET /graphic-themes */
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- RTK Query no-arg query
    getGraphicThemes: builder.query<GraphicTheme[], void>({
      query: () => ({ url: '/graphic-themes' }),
      transformResponse: (raw: unknown) => {
        const rows = unwrapList(graphicThemeWireSchema)(raw);
        return rows.map(toGraphicTheme).filter((t) => t.isActive);
      },
      providesTags: [{ type: 'GraphicTheme', id: 'LIST' }],
    }),

    /** GET /matches/:id/graphic-session */
    getGraphicSession: builder.query<GraphicSession, number>({
      query: (matchId) => ({ url: `/matches/${matchId}/graphic-session` }),
      transformResponse: (raw: unknown) => toGraphicSession(unwrapData(graphicSessionWireSchema)(raw)),
      providesTags: (_r, _e, matchId) => [{ type: 'GraphicSession', id: matchId }],
    }),

    /** PUT /matches/:id/graphic-session */
    upsertGraphicSession: builder.mutation<
      GraphicSession,
      { matchId: number; graphicThemeId: number; config: Record<string, unknown> }
    >({
      query: ({ matchId, graphicThemeId, config }) => ({
        url: `/matches/${matchId}/graphic-session`,
        method: 'PUT',
        body: { graphic_theme_id: graphicThemeId, config },
      }),
      transformResponse: (raw: unknown) => toGraphicSession(unwrapData(graphicSessionWireSchema)(raw)),
      invalidatesTags: (_r, _e, { matchId }) => [{ type: 'GraphicSession', id: matchId }],
    }),

    /** GET /matches/:id/graphic-session/signed-url */
    refreshGraphicSignedUrl: builder.mutation<{ url: string; expiresAt: string | null }, number>({
      query: (matchId) => ({ url: `/matches/${matchId}/graphic-session/signed-url`, method: 'GET' }),
      transformResponse: (raw: unknown) => {
        const data = unwrapData(
          z.object({
            url: z.string(),
            expires_at: z.string().nullable().optional(),
          })
        )(raw);
        return { url: data.url, expiresAt: data.expires_at ?? null };
      },
      async onQueryStarted(matchId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            matchGraphicsApi.util.updateQueryData('getGraphicSession', matchId, (draft) => {
              draft.signedOverlayUrl = data.url;
              draft.signedOverlayExpiresAt = data.expiresAt;
            })
          );
        } catch {
          /* ignore */
        }
      },
    }),
  }),
});

export const {
  useGetGraphicThemesQuery,
  useGetGraphicSessionQuery,
  useUpsertGraphicSessionMutation,
  useRefreshGraphicSignedUrlMutation,
} = matchGraphicsApi;
