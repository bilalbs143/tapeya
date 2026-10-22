import type { ShopVendorBrief } from '../model/schemas';

export function parseOrderIdParam(id: string | undefined): number | null {
  const n = Number(id);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function orderItemsHeading(count: number): string {
  return `${count} item${count === 1 ? '' : 's'}`;
}

export function orderBuyerVendorBrief(
  vendorName: string | null | undefined,
  vendorPhone: string | null | undefined
): ShopVendorBrief | null {
  if (!vendorName && !vendorPhone) return null;
  return {
    id: null,
    storeName: vendorName ?? 'Seller',
    slug: null,
    phone: vendorPhone ?? null,
    logoUrl: null,
    city: null,
    country: null,
  };
}

export function orderCancelConfirmTitle(orderNumber: string): string {
  return `Cancel ${orderNumber}?`;
}

export const ORDER_CANCEL_CONFIRM_MESSAGE =
  "Nothing has been paid, so there's nothing to refund. The seller is told immediately and the items go back on sale.";

export function orderNonCancelNote(paid: boolean): string {
  return paid
    ? "Paid orders can't be cancelled here — contact the seller above."
    : 'Already being packed — contact the seller to stop it.';
}
