export const SELLER_ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'dispatched', label: 'Dispatched' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

export const SELLER_ORDER_PAYMENT_OPTIONS = [
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'advance', label: 'Advance' },
  { value: 'paid', label: 'Paid' },
] as const;

export type SellerOrderStatusValue = (typeof SELLER_ORDER_STATUS_OPTIONS)[number]['value'];
export type SellerOrderPaymentValue = (typeof SELLER_ORDER_PAYMENT_OPTIONS)[number]['value'];

/** Commission rate may be a fraction (0–1) or whole percent (>1). */
export function sellerOrderCommissionPct(commissionRate: number): number | null {
  if (commissionRate > 0 && commissionRate <= 1) return Math.round(commissionRate * 100);
  if (commissionRate > 1) return Math.round(commissionRate);
  return null;
}

export function sellerOrderWhatsAppDigits(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  return digits || null;
}

export function sellerOrderShowsTracking(
  status: string,
  trackingNumber?: string | null | undefined,
  carrier?: string | null | undefined
): boolean {
  const shipped = status === 'dispatched' || status === 'delivered';
  return shipped || Boolean(trackingNumber || carrier);
}
