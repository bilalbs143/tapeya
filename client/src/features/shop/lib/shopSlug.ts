export function normalizeShopSlug(raw: string | undefined): string {
  return raw?.trim() ?? '';
}

export function resolveShopSlugBrand<T extends { id: number; slug: string | null }>(
  brands: T[],
  slug: string,
  vendorPresent: boolean
): T | null {
  if (vendorPresent || !slug) return null;
  return brands.find((b) => b.slug === slug || String(b.id) === slug) ?? null;
}

export const SHOP_SLUG_NOT_FOUND_DESCRIPTION = 'No store or brand matches that link.';
