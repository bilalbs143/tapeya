import { SHOP_SEARCH_DEBOUNCE_MS } from './shopHome';
import { FILTER_TITLES, isShopFilterKind, type ShopFilterKind } from './shopPaths';

export { SHOP_SEARCH_DEBOUNCE_MS };
export type { ShopFilterKind };

export function resolveShopFilterKind(raw: string | undefined): ShopFilterKind | null {
  return isShopFilterKind(raw) ? raw : null;
}

export function shopFilterTitle(kind: ShopFilterKind): string {
  return FILTER_TITLES[kind];
}

export function shopFilterShowsFeatured(kind: ShopFilterKind): boolean {
  return kind === 'featured';
}

export function shopFilterGridStatus(loading: boolean, error: boolean): 'loading' | 'error' | 'ready' {
  if (loading) return 'loading';
  if (error) return 'error';
  return 'ready';
}
