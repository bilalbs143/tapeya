import { baseApi } from './baseApi';

/**
 * Shop API – single place for all shop-related endpoints (user-facing).
 * Injects into baseApi; all routes live under /shop and require auth.
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
      query: (id) => `/shop/products/${id}`,
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
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
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
} = shopApi;
