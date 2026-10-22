import { z } from 'zod';

import { unwrapData, unwrapPaginated } from '@/shared/api/unwrap';

import { orderItemWireSchema, type OrderLine, toOrderLine } from './orderSchemas';
import { asNumber, CURRENT_ORDER_STATUSES, formatOrderDate } from './schemaHelpers';

// —— Wire schemas ——

const sellerOrderParentWireSchema = z
  .object({
    id: z.number(),
    order_number: z.string().nullable().optional(),
    total: z.union([z.number(), z.string()]).optional(),
    currency: z.string().nullable().optional(),
    payment_status: z.string().nullable().optional(),
    payment_status_label: z.string().nullable().optional(),
    amount_received: z.union([z.number(), z.string()]).nullable().optional(),
    payment_verified_at: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    placed_at: z.string().nullable().optional(),
  })
  .passthrough();

const sellerOrderCustomerWireSchema = z
  .object({
    id: z.number().nullable().optional(),
    name: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    avatar_url: z.string().nullable().optional(),
  })
  .passthrough();

/** Full seller vendor-order resource — GET /shop/vendor/orders[/:id]. */

export const sellerVendorOrderWireSchema = z
  .object({
    id: z.number(),
    order_id: z.number().nullable().optional(),
    vendor_id: z.number().nullable().optional(),
    vendor_order_number: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    status_label: z.string().nullable().optional(),
    subtotal: z.union([z.number(), z.string()]).optional(),
    shipping_amount: z.union([z.number(), z.string()]).optional(),
    discount_amount: z.union([z.number(), z.string()]).optional(),
    commission_rate_snapshot: z.union([z.number(), z.string()]).optional(),
    commission_amount: z.union([z.number(), z.string()]).optional(),
    vendor_earnings: z.union([z.number(), z.string()]).optional(),
    total: z.union([z.number(), z.string()]).optional(),
    tracking_number: z.string().nullable().optional(),
    carrier: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    items: z.union([z.array(orderItemWireSchema), z.object({ data: z.array(orderItemWireSchema) })]).optional(),
    order: sellerOrderParentWireSchema.nullable().optional(),
    customer: sellerOrderCustomerWireSchema.nullable().optional(),
    created_at: z.string().nullable().optional(),
    updated_at: z.string().nullable().optional(),
  })
  .passthrough();

export type SellerVendorOrderWire = z.infer<typeof sellerVendorOrderWireSchema>;

export const vendorDashboardWireSchema = z
  .object({
    total_products: z.number().optional(),
    active_products: z.number().optional(),
    products_count: z.number().optional(),
    published_count: z.number().optional(),
    total_orders: z.number().optional(),
    pending_orders: z.number().optional(),
    pending_orders_count: z.number().optional(),
    gross_revenue: z.union([z.number(), z.string()]).optional(),
    net_earnings: z.union([z.number(), z.string()]).optional(),
    low_stock_count: z.number().optional(),
  })
  .passthrough();

export const vendorStoreWireSchema = z
  .object({
    id: z.number(),
    store_name: z.string(),
    slug: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    logo: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    status_label: z.string().nullable().optional(),
    suspension_reason: z.string().nullable().optional(),
    default_shipping_amount: z.union([z.number(), z.string()]).optional(),
  })
  .passthrough();

// —— Domain types ——

export type VendorDashboard = {
  openOrders: number;
  activeProducts: number;
  outOfStock: number;
  earnings30d: number;
  totalProducts: number;
};

/** Seller-facing vendor order (GET /shop/vendor/orders). */

export type VendorOrderCustomer = {
  id: number | null;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
};

export type VendorOrderParent = {
  id: number;
  orderNumber: string | null;
  total: number;
  paymentStatus: string;
  paymentStatusLabel: string;
  amountReceived: number | null;
  address: string | null;
  city: string | null;
  country: string | null;
  notes: string | null;
  placedAt: string | null;
};

export type VendorOrder = {
  id: number;
  orderId: number | null;
  vendorOrderNumber: string;
  status: string;
  statusLabel: string;
  subtotal: number;
  shippingAmount: number;
  discountAmount: number;
  commissionAmount: number;
  commissionRate: number;
  vendorEarnings: number;
  total: number;
  trackingNumber: string | null;
  carrier: string | null;
  notes: string | null;
  items: OrderLine[];
  parent: VendorOrderParent | null;
  customer: VendorOrderCustomer | null;
  createdAt: string | null;
  placedLabel: string;
  isCurrent: boolean;
  isTerminal: boolean;
  paid: boolean;
  shipToLabel: string;
};

/** POST /shop/vendor/orders/{id}/status */

export type VendorOrderStatusBody = {
  status: string;
  tracking_number?: string | null | undefined;
  carrier?: string | null | undefined;
};

/** POST /shop/vendor/orders/{id}/payment */

export type VendorOrderPaymentBody = {
  payment_status: string;
  amount_received?: number | null | undefined;
};

export type VendorStore = {
  id: number;
  storeName: string;
  slug: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  status: string;
  statusLabel: string;
  suspensionReason: string | null;
  defaultShippingAmount: number;
};

export type VendorApplyBody = {
  store_name: string;
  description?: string | undefined;
  phone?: string | undefined;
  email?: string | undefined;
  address?: string | undefined;
  city?: string | undefined;
  country?: string | undefined;
  default_shipping_amount?: number | undefined;
};

/** PATCH /shop/vendor/store — approved vendors only. */

export type VendorUpdateStoreBody = {
  store_name: string;
  description?: string | null | undefined;
  phone?: string | null | undefined;
  email?: string | null | undefined;
  address?: string | null | undefined;
  city?: string | null | undefined;
  country?: string | null | undefined;
  default_shipping_amount?: number | undefined;
};

// —— Mappers / parsers ——

function sellerOrderItems(raw: SellerVendorOrderWire['items']): z.infer<typeof orderItemWireSchema>[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'object' && raw != null && 'data' in raw && Array.isArray(raw.data)) {
    return raw.data;
  }
  return [];
}

export function toVendorOrder(wire: SellerVendorOrderWire): VendorOrder {
  const status = wire.status ?? 'pending';
  const items = sellerOrderItems(wire.items).map(toOrderLine);
  const parentWire = wire.order ?? null;
  const paymentStatus = parentWire?.payment_status ?? 'unpaid';
  const parent: VendorOrderParent | null = parentWire
    ? {
        id: parentWire.id,
        orderNumber: parentWire.order_number ?? null,
        total: asNumber(parentWire.total),
        paymentStatus,
        paymentStatusLabel: parentWire.payment_status_label?.trim() || paymentStatus,
        amountReceived: parentWire.amount_received != null ? asNumber(parentWire.amount_received) : null,
        address: parentWire.address ?? null,
        city: parentWire.city ?? null,
        country: parentWire.country ?? null,
        notes: parentWire.notes ?? null,
        placedAt: parentWire.placed_at ?? null,
      }
    : null;

  const customerWire = wire.customer;
  const customerName = customerWire?.name?.trim();
  const customer: VendorOrderCustomer | null =
    customerWire && (customerName || customerWire.phone)
      ? {
          id: customerWire.id ?? null,
          name: customerName || 'Customer',
          phone: customerWire.phone ?? null,
          avatarUrl: customerWire.avatar_url ?? null,
        }
      : null;

  const shipParts = [parent?.address, parent?.city, parent?.country].filter(Boolean);

  return {
    id: wire.id,
    orderId: wire.order_id ?? parent?.id ?? null,
    vendorOrderNumber: wire.vendor_order_number?.trim() || `#${wire.id}`,
    status,
    statusLabel: wire.status_label?.trim() || status,
    subtotal: asNumber(wire.subtotal),
    shippingAmount: asNumber(wire.shipping_amount),
    discountAmount: asNumber(wire.discount_amount),
    commissionAmount: asNumber(wire.commission_amount),
    commissionRate: asNumber(wire.commission_rate_snapshot),
    vendorEarnings: asNumber(wire.vendor_earnings),
    total: asNumber(wire.total),
    trackingNumber: wire.tracking_number ?? null,
    carrier: wire.carrier ?? null,
    notes: wire.notes ?? null,
    items,
    parent,
    customer,
    createdAt: wire.created_at ?? null,
    placedLabel: formatOrderDate(parent?.placedAt ?? wire.created_at),
    isCurrent: CURRENT_ORDER_STATUSES.has(status),
    isTerminal: status === 'cancelled' || status === 'delivered',
    paid: paymentStatus === 'paid' || paymentStatus === 'advance',
    shipToLabel: shipParts.join(', ') || '—',
  };
}

export function toVendorDashboard(wire: z.infer<typeof vendorDashboardWireSchema>): VendorDashboard {
  return {
    openOrders: wire.pending_orders ?? wire.pending_orders_count ?? 0,
    activeProducts: wire.active_products ?? wire.published_count ?? 0,
    outOfStock: wire.low_stock_count ?? 0,
    earnings30d: asNumber(wire.net_earnings ?? wire.gross_revenue),
    totalProducts: wire.total_products ?? wire.products_count ?? 0,
  };
}

export function toVendorStore(wire: z.infer<typeof vendorStoreWireSchema>): VendorStore {
  return {
    id: wire.id,
    storeName: wire.store_name.trim() || 'Store',
    slug: wire.slug ?? null,
    description: wire.description ?? null,
    phone: wire.phone ?? null,
    email: wire.email ?? null,
    address: wire.address ?? null,
    city: wire.city ?? null,
    country: wire.country ?? null,
    status: wire.status ?? 'pending',
    statusLabel: wire.status_label?.trim() || wire.status || 'Pending',
    suspensionReason: wire.suspension_reason ?? null,
    defaultShippingAmount: asNumber(wire.default_shipping_amount),
  };
}

export function parseVendorDashboard(raw: unknown): VendorDashboard {
  return toVendorDashboard(unwrapData(vendorDashboardWireSchema)(raw));
}

export function parseVendorStore(raw: unknown): VendorStore {
  return toVendorStore(unwrapData(vendorStoreWireSchema)(raw));
}

export function parseVendorOrderList(raw: unknown): VendorOrder[] {
  const page = unwrapPaginated(sellerVendorOrderWireSchema)(raw);
  return page.items.map(toVendorOrder);
}

export function parseVendorOrder(raw: unknown): VendorOrder {
  return toVendorOrder(unwrapData(sellerVendorOrderWireSchema)(raw));
}

export function splitVendorOrders(orders: VendorOrder[]): {
  current: VendorOrder[];
  previous: VendorOrder[];
} {
  const current: VendorOrder[] = [];
  const previous: VendorOrder[] = [];
  for (const o of orders) {
    if (o.isCurrent) current.push(o);
    else previous.push(o);
  }
  return { current, previous };
}
