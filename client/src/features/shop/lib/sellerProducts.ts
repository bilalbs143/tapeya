import { sellerStoreCanEdit } from './sellerStore';

export { sellerStoreCanEdit as sellerProductsCanEdit };

export function sellerProductsIntro(canEdit: boolean, statusLabel: string | undefined): string {
  return !canEdit && statusLabel
    ? `Catalog is read-only while your account is ${statusLabel}.`
    : 'Manage your catalog. Active products are sellable in the shop.';
}

export function filterSellerProducts<T extends { name: string; brandName: string | null; categoryName: string | null }>(
  products: T[],
  query: string
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  return products.filter((p) => `${p.name} ${p.brandName ?? ''} ${p.categoryName ?? ''}`.toLowerCase().includes(q));
}

export function sellerProductsNoMatchDescription(query: string): string {
  return `Nothing in your listings matches “${query}”.`;
}

export function sellerProductThumbInitials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}
