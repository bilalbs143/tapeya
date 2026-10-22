import { sellerStoreCanEdit } from './sellerStore';

export { sellerStoreCanEdit as sellerCategoriesCanEdit };

export function sellerCategoriesIntro(canEdit: boolean, statusLabel: string | undefined): string {
  return !canEdit && statusLabel
    ? `Categories are read-only while your account is ${statusLabel}.`
    : 'Keep them broad — Bats, Balls, Apparel — not one per product.';
}

export function sellerCategoryNameById<T extends { id: number; name: string }>(categories: T[]): Map<number, string> {
  const map = new Map<number, string>();
  for (const c of categories) map.set(c.id, c.name);
  return map;
}

export function sellerCategoryRowMeta(parentName: string | null | undefined, slug: string | null | undefined): string {
  if (parentName) return `Under ${parentName}`;
  if (slug) return `/${slug}`;
  return 'Top Level';
}

export function sellerCategoryThumbInitials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}
