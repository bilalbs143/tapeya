import { baseApi } from '@/shared/api/baseApi';
import { unwrapList, unwrapPaginated } from '@/shared/api/unwrap';

import {
  heroSliderWireSchema,
  type HighlightWire,
  highlightWireSchema,
  type HomeHeroSlide,
  type HomeHighlight,
  type HomeLiveMatch,
  type HomeProduct,
  type HomeStream,
  type LiveScoreWire,
  liveScoreWireSchema,
  type LiveStreamWire,
  liveStreamWireSchema,
  type ShopProductWire,
  shopProductWireSchema,
  toHomeHeroSlide,
  toHomeHighlight,
  toHomeLiveMatch,
  toHomeProduct,
  toHomeStream,
} from '../model/homeSchemas';

function mapLiveScores(raw: unknown): HomeLiveMatch[] {
  return unwrapList(liveScoreWireSchema)(raw)
    .map(toHomeLiveMatch)
    .filter((m): m is HomeLiveMatch => m != null);
}

function mapLiveStreams(raw: unknown): HomeStream[] {
  return unwrapList(liveStreamWireSchema)(raw).map(toHomeStream);
}

function mapProducts(raw: unknown): HomeProduct[] {
  const page = unwrapPaginated(shopProductWireSchema)(raw);
  return page.items.map(toHomeProduct);
}

function mapHighlights(raw: unknown): HomeHighlight[] {
  return unwrapList(highlightWireSchema)(raw).map(toHomeHighlight);
}

function mapHeroSliders(raw: unknown): HomeHeroSlide[] {
  return unwrapList(heroSliderWireSchema)(raw)
    .map(toHomeHeroSlide)
    .filter((s): s is HomeHeroSlide => s != null);
}

type PerPageArg = { perPage?: number | undefined };

export const homeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Open-tournament live scores for home rails. */
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- RTK Query no-arg query
    getHomeLiveScores: builder.query<HomeLiveMatch[], void>({
      query: () => ({ url: '/live/scores' }),
      transformResponse: mapLiveScores,
      providesTags: (result) =>
        result?.length
          ? [...result.map((m) => ({ type: 'LiveScores' as const, id: m.id })), { type: 'LiveScores', id: 'LIST' }]
          : [{ type: 'LiveScores', id: 'LIST' }],
    }),

    /** Live streams for home “Streaming now” / “Live now”. */
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- RTK Query no-arg query
    getHomeLiveStreams: builder.query<HomeStream[], void>({
      query: () => ({ url: '/live/matches' }),
      transformResponse: mapLiveStreams,
      providesTags: (result) =>
        result?.length
          ? [...result.map((s) => ({ type: 'LiveStreams' as const, id: s.id })), { type: 'LiveStreams', id: 'LIST' }]
          : [{ type: 'LiveStreams', id: 'LIST' }],
    }),

    getHomePopularProducts: builder.query<HomeProduct[], PerPageArg | undefined>({
      query: (arg) => ({
        url: '/shop/products',
        params: {
          'filter[is_popular]': 1,
          per_page: arg?.perPage ?? 9,
        },
      }),
      transformResponse: mapProducts,
      providesTags: [{ type: 'Shop', id: 'POPULAR' }],
    }),

    getHomeHighlights: builder.query<HomeHighlight[], PerPageArg | undefined>({
      query: (arg) => ({
        url: '/highlights',
        params: {
          per_page: arg?.perPage ?? 12,
          sort: '-created_at',
        },
      }),
      transformResponse: mapHighlights,
      providesTags: (result) =>
        result?.length
          ? [...result.map((h) => ({ type: 'Highlight' as const, id: h.id })), { type: 'Highlight', id: 'LIST' }]
          : [{ type: 'Highlight', id: 'LIST' }],
    }),

    /** Public home hero banners. */
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- RTK Query no-arg query
    getHomeHeroSliders: builder.query<HomeHeroSlide[], void>({
      query: () => ({ url: '/hero-sliders' }),
      transformResponse: mapHeroSliders,
      providesTags: (result) =>
        result?.length
          ? [...result.map((s) => ({ type: 'HeroSlider' as const, id: s.id })), { type: 'HeroSlider', id: 'LIST' }]
          : [{ type: 'HeroSlider', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetHomeLiveScoresQuery,
  useGetHomeLiveStreamsQuery,
  useGetHomePopularProductsQuery,
  useGetHomeHighlightsQuery,
  useGetHomeHeroSlidersQuery,
} = homeApi;

export type { HighlightWire, LiveScoreWire, LiveStreamWire, ShopProductWire };
