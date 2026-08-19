import { baseApi } from './baseApi';

/**
 * Hero sliders for app home. GET /hero-sliders is public.
 * Backend returns { data: [{ id, image_mobile, image_desktop, cta_type, cta_label, cta_url, cta_target_blank, cta_dialog_key, cta_dialog_param }, ...] }.
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
