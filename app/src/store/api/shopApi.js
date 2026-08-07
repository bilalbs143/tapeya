import { baseApi } from './baseApi';

/**
 * Shop API – single place for all shop-related endpoints (user-facing).
 * Injects into baseApi; routes live under /shop.
 * Catalog GETs are public; cart/checkout/orders require auth.
 * Backend wraps single resources in { data }; list responses are { data: [...] }.
 */
export const shopApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // —— Products ——
    getProducts: builder.query({
      query: (params = {}) => ({
        url: '/shop/products',
        params: {
          search: params.search,
          'filter[brand_id]': params.brand_id,
          'filter[category_id]': params.category_id,
          'filter[vendor_id]': params.vendor_id,
          'filter[is_featured]': params.is_featured,
          'filter[is_popular]': params.is_popular,
          'filter[is_special_offer]': params.is_special_offer,
          per_page: params.per_page ?? 15,
          page: params.page,
          all: params.all ? 1 : undefined,
        },
      }),
      providesTags: ['Shop'],
    }),
    getProduct: builder.query({
      query: (arg) => {
        if (arg && typeof arg === 'object') {
          const slug = arg.slug ?? arg.id;
          const vendor = arg.vendor;
          if (vendor) {
            return `/shop/vendors/${vendor}/products/${slug}`;
          }
          return {
            url: `/shop/products/${slug}`,
            params: arg.vendor_slug ? { vendor: arg.vendor_slug } : undefined,
          };
        }
        return `/shop/products/${arg}`;
      },
      transformResponse: (response) => response?.data ?? response,
      providesTags: ['Shop'],
    }),

    // —— Vendors (buyer store pages) ——
    getVendors: builder.query({
      query: (params = {}) => ({
        url: '/shop/vendors',
        params: {
          per_page: params.per_page ?? 15,
          page: params.page,
          all: params.all ? 1 : undefined,
        },
      }),
      providesTags: ['Shop'],
    }),
    getVendorBySlug: builder.query({
      query: (slug) => `/shop/vendors/${slug}`,
      transformResponse: (response) => response?.data ?? response,
      providesTags: ['Shop'],
    }),

    // —— Brands ——
    getBrands: builder.query({
      query: (params = {}) => ({
        url: '/shop/brands',
        params: {
          per_page: params.per_page ?? 15,
          page: params.page,
          all: params.all ? 1 : undefined,
        },
      }),
      providesTags: ['Shop'],
    }),
    getBrand: builder.query({
      query: (id) => `/shop/brands/${id}`,
      transformResponse: (response) => response?.data ?? response,
      providesTags: ['Shop'],
    }),

    // —— Categories ——
    getCategories: builder.query({
      query: (params = {}) => ({
        url: '/shop/categories',
        params: {
          per_page: params.per_page ?? 15,
          page: params.page,
          all: params.all ? 1 : undefined,
        },
      }),
      providesTags: ['Shop'],
    }),
    getCategory: builder.query({
      query: (id) => `/shop/categories/${id}`,
      transformResponse: (response) => response?.data ?? response,
      providesTags: ['Shop'],
    }),

    // —— Cart ——
    getCart: builder.query({
      query: () => '/shop/cart',
      transformResponse: (response) => response?.data ?? response,
      providesTags: ['Shop'],
    }),
    addCartItem: builder.mutation({
      query: (body) => ({
        url: '/shop/cart/items',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Shop'],
    }),
    updateCartItem: builder.mutation({
      query: ({ cartItemId, quantity }) => ({
        url: `/shop/cart/items/${cartItemId}`,
        method: 'PATCH',
        body: { quantity },
      }),
      invalidatesTags: ['Shop'],
    }),
    removeCartItem: builder.mutation({
      query: (cartItemId) => ({
        url: `/shop/cart/items/${cartItemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Shop'],
    }),

    // —— Orders ——
    getOrders: builder.query({
      query: (params = {}) => ({
        url: '/shop/orders',
        params: { per_page: params.per_page ?? 15, page: params.page },
      }),
      providesTags: ['Shop'],
    }),
    getOrder: builder.query({
      query: (id) => `/shop/orders/${id}`,
      transformResponse: (response) => response?.data ?? response,
      providesTags: ['Shop'],
    }),
    createOrder: builder.mutation({
      query: (body) => ({
        url: '/shop/orders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Shop'],
    }),
    cancelOrder: builder.mutation({
      query: (id) => ({
        url: `/shop/orders/${id}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['Shop'],
    }),

    // —— Shipping quote ——
    getShippingQuote: builder.query({
      query: ({ city, country } = {}) => ({
        url: '/shop/shipping/quote',
        params: { city, country },
      }),
      transformResponse: (response) => response?.data ?? response,
      providesTags: ['Shop'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useGetVendorsQuery,
  useGetVendorBySlugQuery,
  useGetBrandsQuery,
  useGetBrandQuery,
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useGetCartQuery,
  useAddCartItemMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useCancelOrderMutation,
  useGetShippingQuoteQuery,
  useLazyGetShippingQuoteQuery,
} = shopApi;
