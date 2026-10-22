export function formatPkr(value: number | string | null | undefined): string {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return 'PKR —';
  return `PKR ${new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(n)}`;
}

/** Whole-number discount percent, or null when there is no valid sale. */

export function discountPct(price: number, salePrice: number | null | undefined): number | null {
  if (salePrice == null || !Number.isFinite(salePrice) || salePrice >= price || price <= 0) {
    return null;
  }
  return Math.round(((price - salePrice) / price) * 100);
}

export function unitPrice(price: number, salePrice: number | null | undefined): number {
  if (salePrice != null && Number.isFinite(salePrice) && salePrice < price) return salePrice;
  return price;
}
