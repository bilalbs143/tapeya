import { z } from 'zod';

import { unwrapData, unwrapPaginated } from '@/shared/api/unwrap';

import { vendorBriefWireSchema } from './productSchemas';
import { asNumber, CURRENT_ORDER_STATUSES, formatOrderDate } from './schemaHelpers';

// —— Wire schemas ——

const productSnapshotWireSchema = z
  .object({
    name: z.string().nullable().optional(),
    sku: z.string().nullable().optional(),
    slug: z.string().nullable().optional(),
    image_url: z.string().nullable().optional(),
    vendor_id: z.number().nullable().optional(),
    store_name: z.string().nullable().optional(),
  })
  .passthrough();

export const orderItemWireSchema = z
  .object({
    id: z.number(),
    product_id: z.number().nullable().optional(),
    vendor_id: z.number().nullable().optional(),
    vendor_order_id: z.number().nullable().optional(),
    product_snapshot: productSnapshotWireSchema.nullable().optional(),
    quantity: z.number(),
    unit_price: z.union([z.number(), z.string()]),
    total_price: z.union([z.number(), z.string()]),
  })
  .passthrough();

const vendorOrderWireSchema = z
  .object({
    id: z.number(),
    vendor_id: z.number().nullable().optional(),
    vendor: vendorBriefWireSchema.nullable().optional(),
    vendor_order_number: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    status_label: z.string().nullable().optional(),
    subtotal: z.union([z.number(), z.string()]).optional(),
    shipping_amount: z.union([z.number(), z.string()]).optional(),
    discount_amount: z.union([z.number(), z.string()]).optional(),
    total: z.union([z.number(), z.string()]).optional(),
    tracking_number: z.string().nullable().optional(),
    carrier: z.string().nullable().optional(),
  })
  .passthrough();

export const orderWireSchema = z
  .object({
    id: z.number(),
    order_number: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    status_label: z.string().nullable().optional(),
    payment_status: z.string().nullable().optional(),
    payment_status_label: z.string().nullable().optional(),
    payment_method: z.string().nullable().optional(),
    payment_method_label: z.string().nullable().optional(),
    subtotal: z.union([z.number(), z.string()]),
    shipping_amount: z.union([z.number(), z.string()]),
    discount_amount: z.union([z.number(), z.string()]).optional(),
    total: z.union([z.number(), z.string()]),
    currency: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    items: z.array(orderItemWireSchema).optional(),
    vendor_orders: z.array(vendorOrderWireSchema).optional(),
    created_at: z.string().nullable().optional(),
    updated_at: z.string().nullable().optional(),
  })
  .passthrough();

export type OrderWire = z.infer<typeof orderWireSchema>;

export const shippingQuoteWireSchema = z
  .object({
    amount: z.union([z.number(), z.string()]),
  })
  .passthrough();

// —— Domain types ——

export type OrderLine = {
  id: number;
  name: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  storeName: string | null;
};

export type ShopOrder = {
  id: number;
  orderNumber: string;
  status: string;
  statusLabel: string;
  paymentStatus: string;
  paymentStatusLabel: string;
  paid: boolean;
  subtotal: number;
  shippingAmount: number;
  discountAmount: number;
  total: number;
  address: string | null;
  city: string | null;
  country: string | null;
  deliveryLabel: string;
  items: OrderLine[];
  vendorPhone: string | null;
  vendorName: string | null;
  createdAt: string | null;
  placedLabel: string;
  canCancel: boolean;
  isCurrent: boolean;
};

export type ShippingQuote = { amount: number };

export type CreateOrderBody = {
  address: string;
  city: string;
  country: string;
  notes?: string | undefined;
};

// —— Mappers / parsers ——

export function toOrderLine(wire: z.infer<typeof orderItemWireSchema>): OrderLine {
  const snap = wire.product_snapshot;
  return {
    id: wire.id,
    name: snap?.name?.trim() || 'Product',
    imageUrl: snap?.image_url ?? null,
    quantity: wire.quantity,
    unitPrice: asNumber(wire.unit_price),
    totalPrice: asNumber(wire.total_price),
    storeName: snap?.store_name ?? null,
  };
}

export function toOrder(wire: OrderWire): ShopOrder {
  const status = wire.status ?? 'pending';
  const paymentStatus = wire.payment_status ?? 'unpaid';
  const paid = paymentStatus === 'paid' || paymentStatus === 'advance';
  const items = (wire.items ?? []).map(toOrderLine);
  const firstVendor = wire.vendor_orders?.[0]?.vendor;

  const addressParts = [wire.address, wire.city, wire.country].filter(Boolean);
  return {
    id: wire.id,
    orderNumber: wire.order_number?.trim() || `#${wire.id}`,
    status,
    statusLabel: wire.status_label?.trim() || status,
    paymentStatus,
    paymentStatusLabel: wire.payment_status_label?.trim() || paymentStatus,
    paid,
    subtotal: asNumber(wire.subtotal),
    shippingAmount: asNumber(wire.shipping_amount),
    discountAmount: asNumber(wire.discount_amount),
    total: asNumber(wire.total),
    address: wire.address ?? null,
    city: wire.city ?? null,
    country: wire.country ?? null,
    deliveryLabel: addressParts.join(', ') || '—',
    items,
    vendorPhone: firstVendor?.phone ?? null,
    vendorName: firstVendor?.store_name ?? null,
    createdAt: wire.created_at ?? null,
    placedLabel: formatOrderDate(wire.created_at),
    canCancel: !paid && status === 'pending',
    isCurrent: CURRENT_ORDER_STATUSES.has(status),
  };
}

export function toShippingQuote(wire: z.infer<typeof shippingQuoteWireSchema>): ShippingQuote {
  return { amount: asNumber(wire.amount) };
}

export function parseOrderList(raw: unknown): ShopOrder[] {
  const page = unwrapPaginated(orderWireSchema)(raw);
  return page.items.map(toOrder);
}

export function parseOrder(raw: unknown): ShopOrder {
  return toOrder(unwrapData(orderWireSchema)(raw));
}

export function parseShippingQuote(raw: unknown): ShippingQuote {
  return toShippingQuote(unwrapData(shippingQuoteWireSchema)(raw));
}

export function splitOrders(orders: ShopOrder[]): { current: ShopOrder[]; previous: ShopOrder[] } {
  const current: ShopOrder[] = [];
  const previous: ShopOrder[] = [];
  for (const o of orders) {
    if (o.isCurrent) current.push(o);
    else previous.push(o);
  }
  return { current, previous };
}

export { formatOrderDate };
