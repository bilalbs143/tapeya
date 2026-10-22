export { SHOP_SEARCH_DEBOUNCE_MS } from './shopHome';

export function shopVendorCatalogFiltered(debounced: string, categoryId: number | null): boolean {
  return Boolean(debounced) || categoryId != null;
}

export function resolveShopVendorProducts<T>(opts: {
  filtered: boolean;
  fromQuery: T[];
  embedded: T[] | undefined;
}): T[] {
  if (opts.filtered || opts.fromQuery.length > 0) return opts.fromQuery;
  return opts.embedded ?? [];
}

export function shopVendorChipCategories<C extends { id: number }, P extends { categoryId: number | null }>(
  categories: C[],
  products: P[]
): C[] {
  const present = new Set(products.map((p) => p.categoryId).filter((id): id is number => id != null));
  const listed = categories.filter((c) => present.has(c.id));
  return listed.length ? listed : categories;
}

export function shopVendorGridStatus(
  loading: boolean,
  error: boolean,
  hasProducts: boolean
): 'loading' | 'error' | 'ready' {
  if (loading && !hasProducts) return 'loading';
  if (error && !hasProducts) return 'error';
  return 'ready';
}
