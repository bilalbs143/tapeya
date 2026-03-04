import { baseApi } from './baseApi';

/**
 * Hero sliders for app home. GET /hero-sliders is public.
 * Backend returns { data: [{ id, image }, ...] }.
 */
export const heroSliderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHeroSliders: builder.query({
      query: () => ({ url: '/hero-sliders' }),
      transformResponse: (response) => response?.data ?? [],
    }),
  }),
});

export const { useGetHeroSlidersQuery } = heroSliderApi;
