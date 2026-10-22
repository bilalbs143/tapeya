import { z } from 'zod';

import { baseApi } from '@/shared/api/baseApi';
import { unwrapData } from '@/shared/api/unwrap';

export const staticPageWireSchema = z.object({
  title: z.string(),
  slug: z.string(),
  content: z.string().nullable().optional(),
});

export type StaticPage = {
  title: string;
  slug: string;
  content: string;
};

export function toStaticPage(wire: z.infer<typeof staticPageWireSchema>): StaticPage {
  return {
    title: wire.title,
    slug: wire.slug,
    content: wire.content?.trim() ? wire.content : '',
  };
}

export const staticPagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStaticPageBySlug: builder.query<StaticPage, string>({
      query: (slug) => `/static-pages/${encodeURIComponent(slug)}`,
      transformResponse: (raw: unknown) => toStaticPage(unwrapData(staticPageWireSchema)(raw)),
    }),
  }),
});

export const { useGetStaticPageBySlugQuery } = staticPagesApi;
