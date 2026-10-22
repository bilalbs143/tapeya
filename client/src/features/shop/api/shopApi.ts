import { baseApi } from '@/shared/api/baseApi';

import {
  type CreateOrderBody,
  parseBrandList,
  parseCart,
  parseCategoryList,
  parseOrder,
  parseOrderList,
  parseProduct,
  parseProductList,
  parseShippingQuote,
  parseShopVendorPublic,
  type ProductListParams,
  type ShippingQuote,
  type ShopBrand,
  type ShopCart,
  type ShopCategory,
  type ShopOrder,
  type ShopProduct,
  type ShopVendorPublic,
} from '../model/schemas';

function productQueryParams(params: ProductListParams = {}) {
  return {
    search: params.search,
    'filter[brand_id]': params.brandId,
    'filter[category_id]': params.categoryId,
    'filter[vendor_id]': params.vendorId,
    'filter[is_featured]': params.isFeatured === true ? 1 : params.isFeatured === false ? 0 : undefined,
    'filter[is_popular]': params.isPopular === true ? 1 : params.isPopular === false ? 0 : undefined,
    'filter[is_special_offer]': params.isSpecialOffer === true ? 1 : params.isSpecialOffer === false ? 0 : undefined,
    per_page: params.perPage ?? 15,
    page: params.page,
    all: params.all ? 1 : undefined,
  };
}

export const shopApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShopProducts: builder.query<ShopProduct[], ProductListParams | undefined>({
      query: (arg) => ({
        url: '/shop/products',
        params: productQueryParams(arg ?? {}),
      }),
      transformResponse: (raw: unknown) => parseProductList(raw),
      providesTags: (result) =>
        result
          ? [...result.map((p) => ({ type: 'Shop' as const, id: `P${p.id}` })), { type: 'Shop', id: 'PRODUCTS' }]
          : [{ type: 'Shop', id: 'PRODUCTS' }],
    }),

    getShopProduct: builder.query<ShopProduct, { slug: string; vendor?: string | undefined } | string>({
      query: (arg) => {
        const slug = typeof arg === 'string' ? arg : arg.slug;
        const vendor = typeof arg === 'string' ? undefined : arg.vendor?.trim();
        if (vendor) {
          return `/shop/vendors/${vendor}/products/${slug}`;
        }
        return `/shop/products/${slug}`;
      },
      transformResponse: (raw: unknown) => parseProduct(raw),
      providesTags: (result) => (result ? [{ type: 'Shop', id: `P${result.id}` }] : [{ type: 'Shop', id: 'PRODUCT' }]),
    }),

    getShopBrands: builder.query<ShopBrand[], { perPage?: number | undefined; all?: boolean | undefined } | undefined>({
      query: (arg) => ({
        url: '/shop/brands',
        params: {
          per_page: arg && 'perPage' in arg && arg.perPage != null ? arg.perPage : 30,
          all: arg && 'all' in arg && arg.all ? 1 : undefined,
          has_products: 1,
        },
      }),
      transformResponse: (raw: unknown) => parseBrandList(raw),
      providesTags: [{ type: 'Shop', id: 'BRANDS' }],
    }),

    getShopVendorBySlug: builder.query<ShopVendorPublic, string>({
      query: (slug) => `/shop/vendors/${slug}`,
      transformResponse: (raw: unknown) => parseShopVendorPublic(raw),
      providesTags: (_r, _e, slug) => [{ type: 'Shop', id: `V${slug}` }],
    }),

    getShopCategories: builder.query<
      ShopCategory[],
      { perPage?: number | undefined; all?: boolean | undefined } | undefined
    >({
      query: (arg) => ({
        url: '/shop/categories',
        params: {
          per_page: arg && 'perPage' in arg && arg.perPage != null ? arg.perPage : 50,
          all: arg && 'all' in arg && arg.all ? 1 : undefined,
        },
      }),
      transformResponse: (raw: unknown) => parseCategoryList(raw),
      providesTags: [{ type: 'Shop', id: 'CATEGORIES' }],
    }),

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- RTK Query void arg
    getShopCart: builder.query<ShopCart, void>({
      query: () => '/shop/cart',
      transformResponse: (raw: unknown) => parseCart(raw),
      providesTags: [{ type: 'Shop', id: 'CART' }],
    }),

    addShopCartItem: builder.mutation<ShopCart, { productId: number; quantity: number }>({
      query: ({ productId, quantity }) => ({
        url: '/shop/cart/items',
        method: 'POST',
        body: { product_id: productId, quantity },
      }),
      transformResponse: (raw: unknown) => parseCart(raw),
      invalidatesTags: [
        { type: 'Shop', id: 'CART' },
        { type: 'Shop', id: 'PRODUCTS' },
      ],
    }),

    updateShopCartItem: builder.mutation<ShopCart, { cartItemId: number; quantity: number }>({
      query: ({ cartItemId, quantity }) => ({
        url: `/shop/cart/items/${cartItemId}`,
        method: 'PATCH',
        body: { quantity },
      }),
      transformResponse: (raw: unknown) => parseCart(raw),
      invalidatesTags: [{ type: 'Shop', id: 'CART' }],
    }),

    removeShopCartItem: builder.mutation<ShopCart, number>({
      query: (cartItemId) => ({
        url: `/shop/cart/items/${cartItemId}`,
        method: 'DELETE',
      }),
      transformResponse: (raw: unknown) => parseCart(raw),
      invalidatesTags: [{ type: 'Shop', id: 'CART' }],
    }),

    getShopOrders: builder.query<ShopOrder[], { perPage?: number | undefined; page?: number | undefined } | undefined>({
      query: (arg) => ({
        url: '/shop/orders',
        params: {
          per_page: arg && 'perPage' in arg && arg.perPage != null ? arg.perPage : 30,
          page: arg && 'page' in arg ? arg.page : undefined,
        },
      }),
      transformResponse: (raw: unknown) => parseOrderList(raw),
      providesTags: (result) =>
        result
          ? [...result.map((o) => ({ type: 'Shop' as const, id: `O${o.id}` })), { type: 'Shop', id: 'ORDERS' }]
          : [{ type: 'Shop', id: 'ORDERS' }],
    }),

    getShopOrder: builder.query<ShopOrder, number>({
      query: (id) => `/shop/orders/${id}`,
      transformResponse: (raw: unknown) => parseOrder(raw),
      providesTags: (_r, _e, id) => [{ type: 'Shop', id: `O${id}` }],
    }),

    createShopOrder: builder.mutation<ShopOrder, CreateOrderBody>({
      query: (body) => ({
        url: '/shop/orders',
        method: 'POST',
        body,
      }),
      transformResponse: (raw: unknown) => parseOrder(raw),
      invalidatesTags: [
        { type: 'Shop', id: 'CART' },
        { type: 'Shop', id: 'ORDERS' },
      ],
    }),

    cancelShopOrder: builder.mutation<ShopOrder, number>({
      query: (id) => ({
        url: `/shop/orders/${id}/cancel`,
        method: 'POST',
      }),
      transformResponse: (raw: unknown) => parseOrder(raw),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Shop', id: `O${id}` },
        { type: 'Shop', id: 'ORDERS' },
      ],
    }),

    getShippingQuote: builder.query<
      ShippingQuote,
      { city?: string | undefined; country?: string | undefined } | undefined
    >({
      query: (arg) => ({
        url: '/shop/shipping/quote',
        params: {
          city: arg && 'city' in arg ? arg.city : undefined,
          country: arg && 'country' in arg ? arg.country : undefined,
        },
      }),
      transformResponse: (raw: unknown) => parseShippingQuote(raw),
      providesTags: [{ type: 'Shop', id: 'SHIPPING' }],
    }),
  }),
});

export const {
  useGetShopProductsQuery,
  useGetShopProductQuery,
  useGetShopBrandsQuery,
  useGetShopVendorBySlugQuery,
  useGetShopCategoriesQuery,
  useGetShopCartQuery,
  useAddShopCartItemMutation,
  useUpdateShopCartItemMutation,
  useRemoveShopCartItemMutation,
  useGetShopOrdersQuery,
  useGetShopOrderQuery,
  useCreateShopOrderMutation,
  useCancelShopOrderMutation,
  useGetShippingQuoteQuery,
  useLazyGetShippingQuoteQuery,
} = shopApi;
