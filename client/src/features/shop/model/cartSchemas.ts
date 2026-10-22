import { z } from 'zod';

import { unwrapData } from '@/shared/api/unwrap';

import {
  productWireSchema,
  type ShopProduct,
  type ShopVendorBrief,
  toProduct,
  toVendorBrief,
  vendorBriefWireSchema,
} from './productSchemas';
import { asNumber, roundMoney } from './schemaHelpers';

// —— Wire schemas ——

const cartItemWireSchema = z
  .object({
    id: z.number(),
    product_id: z.number(),
    vendor_id: z.number().nullable().optional(),
    vendor: vendorBriefWireSchema.nullable().optional(),
    product: productWireSchema.nullable().optional(),
    quantity: z.number(),
    price_snapshot: z.union([z.number(), z.string()]),
    subtotal: z.union([z.number(), z.string()]).optional(),
  })
  .passthrough();

const cartVendorGroupWireSchema = z
  .object({
    vendor: vendorBriefWireSchema.nullable().optional(),
    items: z.array(cartItemWireSchema),
    subtotal: z.union([z.number(), z.string()]).optional(),
  })
  .passthrough();

export const cartWireSchema = z
  .object({
    id: z.number(),
    items: z.array(cartItemWireSchema).optional(),
    items_count: z.number().optional(),
    subtotal: z.union([z.number(), z.string()]).optional(),
    vendor_groups: z.array(cartVendorGroupWireSchema).optional(),
  })
  .passthrough();

export type CartWire = z.infer<typeof cartWireSchema>;

// —— Domain types ——

export type CartLine = {
  id: number;
  productId: number;
  quantity: number;
  priceSnapshot: number;
  lineTotal: number;
  product: ShopProduct | null;
  vendor: ShopVendorBrief | null;
};

export type CartVendorGroup = {
  vendor: ShopVendorBrief | null;
  items: CartLine[];
  subtotal: number;
};

export type ShopCart = {
  id: number;
  items: CartLine[];
  itemsCount: number;
  subtotal: number;
  vendorGroups: CartVendorGroup[];
};

export type CartTotals = {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
};

// —— Mappers / parsers ——

function toCartLine(wire: z.infer<typeof cartItemWireSchema>): CartLine {
  const priceSnapshot = asNumber(wire.price_snapshot);
  const quantity = wire.quantity;
  return {
    id: wire.id,
    productId: wire.product_id,
    quantity,
    priceSnapshot,
    lineTotal: asNumber(wire.subtotal, priceSnapshot * quantity),
    product: wire.product ? toProduct(wire.product) : null,
    vendor: toVendorBrief(wire.vendor) ?? (wire.product ? toVendorBrief(wire.product.vendor) : null),
  };
}

/** Fallback when API omits vendor_groups. */

export function groupCartByVendor(items: CartLine[]): CartVendorGroup[] {
  const map = new Map<string, CartVendorGroup>();
  for (const item of items) {
    const key = String(item.vendor?.id ?? item.vendor?.slug ?? 'unknown');
    const existing = map.get(key);
    if (existing) {
      existing.items.push(item);
      existing.subtotal += item.lineTotal;
    } else {
      map.set(key, {
        vendor: item.vendor,
        items: [item],
        subtotal: item.lineTotal,
      });
    }
  }
  return [...map.values()];
}

export function toCart(wire: CartWire): ShopCart {
  const items = (wire.items ?? []).map(toCartLine);
  const vendorGroups =
    wire.vendor_groups?.map((g) => ({
      vendor: toVendorBrief(g.vendor),
      items: g.items.map(toCartLine),
      subtotal: asNumber(
        g.subtotal,
        g.items.reduce((s, i) => s + asNumber(i.price_snapshot) * i.quantity, 0)
      ),
    })) ?? groupCartByVendor(items);

  const subtotal = asNumber(
    wire.subtotal,
    items.reduce((s, i) => s + i.lineTotal, 0)
  );

  return {
    id: wire.id,
    items,
    itemsCount: wire.items_count ?? items.reduce((s, i) => s + i.quantity, 0),
    subtotal,
    vendorGroups,
  };
}

export function cartTotals(subtotal: number, shipping = 0, discount = 0): CartTotals {
  return {
    subtotal,
    shipping,
    discount,
    total: Math.max(0, roundMoney(subtotal + shipping - discount)),
  };
}

export { roundMoney };

export function parseCart(raw: unknown): ShopCart {
  return toCart(unwrapData(cartWireSchema)(raw));
}
