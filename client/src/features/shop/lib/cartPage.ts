export const CART_QTY_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export function cartVendorGroupKey(vendor: { id: number | null; slug: string | null } | null | undefined): string {
  return String(vendor?.id ?? vendor?.slug ?? 'vendor');
}

export function cartCheckoutLabel(totalFormatted: string): string {
  return `Checkout · ${totalFormatted}`;
}
