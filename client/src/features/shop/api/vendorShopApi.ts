import { baseApi } from '@/shared/api/baseApi';

import {
  parseBrand,
  parseBrandList,
  parseCategory,
  parseCategoryList,
  parseProduct,
  parseProductList,
  parseVendorDashboard,
  parseVendorOrder,
  parseVendorOrderList,
  parseVendorStore,
  type ShopBrand,
  type ShopCategory,
  type ShopProduct,
  type VendorApplyBody,
  type VendorDashboard,
  type VendorOrder,
  type VendorOrderPaymentBody,
  type VendorOrderStatusBody,
  type VendorProductWriteBody,
  type VendorStore,
  type VendorUpdateStoreBody,
} from '../model/schemas';

export const vendorShopApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    applyAsVendor: builder.mutation<VendorStore, VendorApplyBody>({
      query: (body) => ({
        url: '/shop/vendor/apply',
        method: 'POST',
        body,
      }),
      transformResponse: (raw: unknown) => parseVendorStore(raw),
      invalidatesTags: ['User', 'VendorShop'],
    }),

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- RTK Query void arg
    getVendorDashboard: builder.query<VendorDashboard, void>({
      query: () => '/shop/vendor/dashboard',
      transformResponse: (raw: unknown) => parseVendorDashboard(raw),
      providesTags: [{ type: 'VendorShop', id: 'DASH' }],
    }),

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- RTK Query void arg
    getVendorStore: builder.query<VendorStore, void>({
      query: () => '/shop/vendor/store',
      transformResponse: (raw: unknown) => parseVendorStore(raw),
      providesTags: [{ type: 'VendorShop', id: 'STORE' }],
    }),

    updateVendorStore: builder.mutation<VendorStore, VendorUpdateStoreBody>({
      query: (body) => ({
        url: '/shop/vendor/store',
        method: 'PATCH',
        body,
      }),
      transformResponse: (raw: unknown) => parseVendorStore(raw),
      invalidatesTags: [{ type: 'VendorShop', id: 'STORE' }, { type: 'VendorShop', id: 'DASH' }, 'User'],
    }),

    getVendorBrands: builder.query<ShopBrand[], { all?: boolean | undefined } | undefined>({
      query: (arg) => ({
        url: '/shop/vendor/brands',
        params: {
          all: arg && 'all' in arg && arg.all ? 1 : undefined,
          per_page: 50,
        },
      }),
      transformResponse: (raw: unknown) => parseBrandList(raw),
      providesTags: (result) =>
        result
          ? [
              ...result.map((b) => ({ type: 'VendorShop' as const, id: `B${b.id}` })),
              { type: 'VendorShop', id: 'BRANDS' },
            ]
          : [{ type: 'VendorShop', id: 'BRANDS' }],
    }),

    createVendorBrand: builder.mutation<ShopBrand, { name: string } | FormData>({
      query: (body) => ({
        url: '/shop/vendor/brands',
        method: 'POST',
        body,
      }),
      transformResponse: (raw: unknown) => parseBrand(raw),
      invalidatesTags: [
        { type: 'VendorShop', id: 'BRANDS' },
        { type: 'Shop', id: 'BRANDS' },
      ],
    }),

    updateVendorBrand: builder.mutation<ShopBrand, { id: number; body: { name: string } | FormData }>({
      query: ({ id, body }) => {
        if (body instanceof FormData) {
          body.append('_method', 'PATCH');
          return { url: `/shop/vendor/brands/${id}`, method: 'POST', body };
        }
        return { url: `/shop/vendor/brands/${id}`, method: 'PATCH', body };
      },
      transformResponse: (raw: unknown) => parseBrand(raw),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'VendorShop', id: 'BRANDS' },
        { type: 'VendorShop', id: `B${arg.id}` },
        { type: 'Shop', id: 'BRANDS' },
      ],
    }),

    getVendorCategories: builder.query<ShopCategory[], { all?: boolean | undefined } | undefined>({
      query: (arg) => ({
        url: '/shop/vendor/categories',
        params: {
          all: arg && 'all' in arg && arg.all ? 1 : undefined,
          per_page: 50,
        },
      }),
      transformResponse: (raw: unknown) => parseCategoryList(raw),
      providesTags: (result) =>
        result
          ? [
              ...result.map((c) => ({ type: 'VendorShop' as const, id: `C${c.id}` })),
              { type: 'VendorShop', id: 'CATEGORIES' },
            ]
          : [{ type: 'VendorShop', id: 'CATEGORIES' }],
    }),

    createVendorCategory: builder.mutation<
      ShopCategory,
      { name: string; parent_id?: number | null | undefined } | FormData
    >({
      query: (body) => ({
        url: '/shop/vendor/categories',
        method: 'POST',
        body,
      }),
      transformResponse: (raw: unknown) => parseCategory(raw),
      invalidatesTags: [{ type: 'VendorShop', id: 'CATEGORIES' }],
    }),

    updateVendorCategory: builder.mutation<
      ShopCategory,
      { id: number; body: { name: string; parent_id?: number | null | undefined } | FormData }
    >({
      query: ({ id, body }) => {
        if (body instanceof FormData) {
          body.append('_method', 'PATCH');
          return { url: `/shop/vendor/categories/${id}`, method: 'POST', body };
        }
        return { url: `/shop/vendor/categories/${id}`, method: 'PATCH', body };
      },
      transformResponse: (raw: unknown) => parseCategory(raw),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'VendorShop', id: 'CATEGORIES' },
        { type: 'VendorShop', id: `C${arg.id}` },
      ],
    }),

    getVendorProducts: builder.query<ShopProduct[], { all?: boolean | undefined } | undefined>({
      query: (arg) => ({
        url: '/shop/vendor/products',
        params: {
          all: arg && 'all' in arg && arg.all ? 1 : undefined,
          per_page: 50,
        },
      }),
      transformResponse: (raw: unknown) => parseProductList(raw),
      providesTags: (result) =>
        result
          ? [
              ...result.map((p) => ({ type: 'VendorShop' as const, id: `VP${p.id}` })),
              { type: 'VendorShop', id: 'PRODUCTS' },
            ]
          : [{ type: 'VendorShop', id: 'PRODUCTS' }],
    }),

    getVendorProduct: builder.query<ShopProduct, number>({
      query: (id) => `/shop/vendor/products/${id}`,
      transformResponse: (raw: unknown) => parseProduct(raw),
      providesTags: (_r, _e, id) => [{ type: 'VendorShop', id: `VP${id}` }],
    }),

    createVendorProduct: builder.mutation<ShopProduct, VendorProductWriteBody>({
      query: (body) => ({
        url: '/shop/vendor/products',
        method: 'POST',
        body,
      }),
      transformResponse: (raw: unknown) => parseProduct(raw),
      invalidatesTags: [
        { type: 'VendorShop', id: 'PRODUCTS' },
        { type: 'VendorShop', id: 'DASH' },
        { type: 'Shop', id: 'PRODUCTS' },
      ],
    }),

    updateVendorProduct: builder.mutation<ShopProduct, { id: number } & VendorProductWriteBody>({
      query: ({ id, ...body }) => ({
        url: `/shop/vendor/products/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (raw: unknown) => parseProduct(raw),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'VendorShop', id: 'PRODUCTS' },
        { type: 'VendorShop', id: `VP${arg.id}` },
        { type: 'VendorShop', id: 'DASH' },
        { type: 'Shop', id: 'PRODUCTS' },
        { type: 'Shop', id: `P${arg.id}` },
      ],
    }),

    uploadVendorProductImages: builder.mutation<unknown, { productId: number; files: File[] }>({
      query: ({ productId, files }) => {
        const fd = new FormData();
        for (const file of files) fd.append('files[]', file);
        return {
          url: `/media/product/${productId}/images`,
          method: 'POST',
          body: fd,
        };
      },
      invalidatesTags: (_r, _e, arg) => [
        { type: 'VendorShop', id: 'PRODUCTS' },
        { type: 'VendorShop', id: `VP${arg.productId}` },
        { type: 'Shop', id: 'PRODUCTS' },
      ],
    }),

    getVendorOrders: builder.query<VendorOrder[], { all?: boolean | undefined } | undefined>({
      query: (arg) => ({
        url: '/shop/vendor/orders',
        params: {
          all: arg && 'all' in arg && arg.all ? 1 : undefined,
          per_page: 50,
        },
      }),
      transformResponse: (raw: unknown) => parseVendorOrderList(raw),
      providesTags: (result) =>
        result
          ? [
              ...result.map((o) => ({ type: 'VendorShop' as const, id: `VO${o.id}` })),
              { type: 'VendorShop', id: 'ORDERS' },
            ]
          : [{ type: 'VendorShop', id: 'ORDERS' }],
    }),

    getVendorOrder: builder.query<VendorOrder, number>({
      query: (id) => `/shop/vendor/orders/${id}`,
      transformResponse: (raw: unknown) => parseVendorOrder(raw),
      providesTags: (_r, _e, id) => [{ type: 'VendorShop', id: `VO${id}` }],
    }),

    updateVendorOrderStatus: builder.mutation<VendorOrder, { id: number } & VendorOrderStatusBody>({
      query: ({ id, ...body }) => ({
        url: `/shop/vendor/orders/${id}/status`,
        method: 'POST',
        body,
      }),
      transformResponse: (raw: unknown) => parseVendorOrder(raw),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'VendorShop', id: 'ORDERS' },
        { type: 'VendorShop', id: `VO${arg.id}` },
        { type: 'VendorShop', id: 'DASH' },
      ],
    }),

    updateVendorOrderPayment: builder.mutation<VendorOrder, { id: number } & VendorOrderPaymentBody>({
      query: ({ id, ...body }) => ({
        url: `/shop/vendor/orders/${id}/payment`,
        method: 'POST',
        body,
      }),
      transformResponse: (raw: unknown) => parseVendorOrder(raw),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'VendorShop', id: 'ORDERS' },
        { type: 'VendorShop', id: `VO${arg.id}` },
        { type: 'VendorShop', id: 'DASH' },
      ],
    }),
  }),
});

export const {
  useApplyAsVendorMutation,
  useGetVendorDashboardQuery,
  useGetVendorStoreQuery,
  useUpdateVendorStoreMutation,
  useGetVendorBrandsQuery,
  useCreateVendorBrandMutation,
  useUpdateVendorBrandMutation,
  useGetVendorCategoriesQuery,
  useCreateVendorCategoryMutation,
  useUpdateVendorCategoryMutation,
  useGetVendorProductsQuery,
  useGetVendorProductQuery,
  useCreateVendorProductMutation,
  useUpdateVendorProductMutation,
  useUploadVendorProductImagesMutation,
  useGetVendorOrdersQuery,
  useGetVendorOrderQuery,
  useUpdateVendorOrderStatusMutation,
  useUpdateVendorOrderPaymentMutation,
} = vendorShopApi;
