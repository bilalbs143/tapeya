import { sellerStoreCanEdit } from './sellerStore';

export { sellerStoreCanEdit as sellerBrandsCanEdit };

export function sellerBrandsIntro(canEdit: boolean, statusLabel: string | undefined): string {
  return !canEdit && statusLabel
    ? `Brands are read-only while your account is ${statusLabel}.`
    : 'Add missing brands so they appear when you create products.';
}

export function sellerBrandSlugLine(slug: string | null | undefined): string | null {
  return slug ? `/${slug}` : null;
}

export function sellerBrandThumbInitials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}
