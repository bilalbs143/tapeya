export { SHOP_SEARCH_DEBOUNCE_MS, shopVendorChipCategories as shopBrandChipCategories } from './shopVendor';

export function resolveShopBrand<T extends { id: number; slug: string | null }>(
  brands: T[],
  brandSlug: string
): T | null {
  return brands.find((b) => b.slug === brandSlug || String(b.id) === brandSlug) ?? null;
}

/** Brand grid — loading/error take priority even when prior products remain. */
export function shopBrandGridStatus(loading: boolean, error: boolean): 'loading' | 'error' | 'ready' {
  if (loading) return 'loading';
  if (error) return 'error';
  return 'ready';
}
