export function sellerStoreCanEdit(status: string): boolean {
  return status === 'approved';
}

export function sellerStoreIntro(canEdit: boolean, statusLabel: string): string {
  return !canEdit
    ? `Store settings are read-only while your account is ${statusLabel}.`
    : 'Update your public store profile and flat shipping amount.';
}

export function sellerStoreSlugLine(slug: string | null | undefined): string | null {
  return slug ? `tapeya.com/shop/${slug}` : null;
}

export type SellerStoreFieldErrors = { storeName?: string };

export function validateSellerStoreName(storeName: string): SellerStoreFieldErrors {
  if (!storeName.trim()) return { storeName: 'Store name is required.' };
  return {};
}

export function parseSellerShippingAmount(shipping: string): number {
  const n = Number(shipping);
  return Number.isFinite(n) ? n : 0;
}
