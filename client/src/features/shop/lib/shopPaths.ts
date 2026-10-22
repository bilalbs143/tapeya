import { APP_PATHS } from '@/shared/config/paths';

export type ShopFilterKind = 'popular' | 'special-offer' | 'featured';

/** Public catalog detail is slug-keyed (API `GET /shop/products/{slug}`). */

export type ShopProductPathArg = {
  slug: string | null | undefined;
  vendor?: { slug?: string | null | undefined } | null | undefined;
  vendorSlug?: string | null | undefined;
};

/** First segments under `/shop` that are never a vendor/brand slug. */

export const SHOP_RESERVED_SLUGS = new Set([
  'filter',
  'products',
  'cart',
  'checkout',
  'orders',
  'order-success',
  'brands',
  'vendors',
  'product',
]);

export function isShopFilterKind(value: string | undefined): value is ShopFilterKind {
  return value === 'popular' || value === 'special-offer' || value === 'featured';
}

export function isShopReservedSlug(value: string | undefined): boolean {
  if (!value) return true;
  return SHOP_RESERVED_SLUGS.has(value.trim().toLowerCase());
}

export function shopProductPath(arg: ShopProductPathArg): string {
  const slug = arg.slug?.trim();
  if (!slug) return APP_PATHS.shop;
  const vendor = arg.vendorSlug?.trim() || arg.vendor?.slug?.trim();
  if (vendor) {
    return `${APP_PATHS.shopProduct}/${slug}?vendor=${encodeURIComponent(vendor)}`;
  }
  return `${APP_PATHS.shopProduct}/${slug}`;
}

export const shopPaths = {
  home: () => APP_PATHS.shop,
  filter: (kind: ShopFilterKind) => `${APP_PATHS.shop}/filter/${kind}`,
  product: (arg: ShopProductPathArg) => shopProductPath(arg),
  brand: (slug: string) => `${APP_PATHS.shopBrand}/${encodeURIComponent(slug)}`,
  /** Prefer short `/shop/:slug` for vendors (matches production + seller store link). */
  vendor: (slug: string) => `${APP_PATHS.shopSlug}/${encodeURIComponent(slug)}`,
  cart: () => APP_PATHS.shopCart,
  checkout: () => APP_PATHS.shopCheckout,
  orders: () => APP_PATHS.shopOrders,
  order: (id: number | string) => `${APP_PATHS.shopOrders}/${id}`,
  orderSuccess: () => APP_PATHS.shopOrderSuccess,
  seller: () => APP_PATHS.seller,
  sellerApply: () => APP_PATHS.sellerApply,
  sellerStore: () => APP_PATHS.sellerStore,
  sellerBrands: () => APP_PATHS.sellerBrands,
  sellerCategories: () => APP_PATHS.sellerCategories,
  sellerProducts: () => APP_PATHS.sellerProducts,
  sellerProductNew: () => APP_PATHS.sellerProductNew,
  sellerProductEdit: (id: number | string) => `${APP_PATHS.sellerProductEdit}/${id}/edit`,
  sellerOrders: () => APP_PATHS.sellerOrders,
  sellerOrder: (id: number | string) => `${APP_PATHS.sellerOrder}/${id}`,
} as const;

export const FILTER_TITLES: Record<ShopFilterKind, string> = {
  popular: 'Most Popular',
  'special-offer': 'Special Offer',
  featured: 'Featured',
};
