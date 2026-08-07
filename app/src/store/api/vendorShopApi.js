import { baseApi } from './baseApi';

/**
 * Vendor (seller) shop API — separate VendorShop tag so mutations never
 * invalidate only the buyer Shop cache.
 */
export const vendorShopApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    applyAsVendor: builder.mutation({
      query: (body) => ({
        url: '/shop/vendor/apply',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User', 'VendorShop'],
    }),

    getVendorDashboard: builder.query({
      query: () => '/shop/vendor/dashboard',
      transformResponse: (response) => response?.data ?? response,
      providesTags: ['VendorShop'],
    }),

    getVendorStore: builder.query({
      query: () => '/shop/vendor/store',
      transformResponse: (response) => response?.data ?? response,
      providesTags: ['VendorShop'],
    }),
    updateVendorStore: builder.mutation({
      query: (body) => ({
        url: '/shop/vendor/store',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['VendorShop'],
    }),

    getVendorProducts: builder.query({
      query: (params = {}) => ({
        url: '/shop/vendor/products',
        params: {
          per_page: params.per_page ?? 15,
          page: params.page,
          all: params.all ? 1 : undefined,
          'filter[is_active]': params.is_active,
        },
      }),
      providesTags: ['VendorShop'],
    }),
    getVendorProduct: builder.query({
      query: (id) => `/shop/vendor/products/${id}`,
      transformResponse: (response) => response?.data ?? response,
      providesTags: ['VendorShop'],
    }),
    createVendorProduct: builder.mutation({
      query: (body) => ({
        url: '/shop/vendor/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['VendorShop'],
    }),
    updateVendorProduct: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/shop/vendor/products/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['VendorShop'],
    }),
    deleteVendorProduct: builder.mutation({
      query: (id) => ({
        url: `/shop/vendor/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['VendorShop'],
    }),

    /**
     * POST /media/product/{id}/images — multipart FormData with files[].
     * Do not set JSON Content-Type; baseApi skips it for FormData bodies.
     */
    uploadProductImages: builder.mutation({
      query: ({ productId, files }) => {
        const fd = new FormData();
        for (const file of files) {
          fd.append('files[]', file);
        }
        return {
          url: `/media/product/${productId}/images`,
          method: 'POST',
          body: fd,
        };
      },
      invalidatesTags: ['VendorShop'],
    }),

    getVendorOrders: builder.query({
      query: (params = {}) => ({
        url: '/shop/vendor/orders',
        params: {
          per_page: params.per_page ?? 15,
          page: params.page,
          all: params.all ? 1 : undefined,
          'filter[status]': params.status,
        },
      }),
      providesTags: ['VendorShop'],
    }),
    getVendorOrder: builder.query({
      query: (id) => `/shop/vendor/orders/${id}`,
      transformResponse: (response) => response?.data ?? response,
      providesTags: ['VendorShop'],
    }),
    updateVendorOrderStatus: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/shop/vendor/orders/${id}/status`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['VendorShop'],
    }),
    updateVendorOrderPayment: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/shop/vendor/orders/${id}/payment`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['VendorShop'],
    }),
  }),
});

export const {
  useApplyAsVendorMutation,
  useGetVendorDashboardQuery,
  useGetVendorStoreQuery,
  useUpdateVendorStoreMutation,
  useGetVendorProductsQuery,
  useGetVendorProductQuery,
  useCreateVendorProductMutation,
  useUpdateVendorProductMutation,
  useDeleteVendorProductMutation,
  useUploadProductImagesMutation,
  useGetVendorOrdersQuery,
  useGetVendorOrderQuery,
  useUpdateVendorOrderStatusMutation,
  useUpdateVendorOrderPaymentMutation,
} = vendorShopApi;
