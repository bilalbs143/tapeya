import { sellerStoreCanEdit } from './sellerStore';

export { sellerStoreCanEdit as sellerOrdersCanEdit };

export function sellerOrdersReadOnlyNote(statusLabel: string): string {
  return `Order updates are disabled while your account is ${statusLabel}.`;
}

export function sellerOrderItemsMeta(itemCount: number, placedLabel: string | null | undefined): string {
  const items = `${itemCount} item${itemCount === 1 ? '' : 's'}`;
  return placedLabel ? `${items} · ${placedLabel}` : items;
}

export function sellerOrderTrackingLine(
  carrier: string | null | undefined,
  trackingNumber: string | null | undefined
): string | null {
  const line = [carrier, trackingNumber].filter(Boolean).join(' · ');
  return line || null;
}

export function sellerOrderCardTitle(opts: {
  customerName: string | null | undefined;
  firstItemName: string | null | undefined;
}): string {
  return opts.customerName ?? opts.firstItemName ?? 'Order';
}

export function sellerOrderThumbInitials(firstItemName: string | null | undefined, orderNumber: string): string {
  return (firstItemName ?? orderNumber).slice(0, 2).toUpperCase();
}
