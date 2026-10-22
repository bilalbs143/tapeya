import { z } from 'zod';

import { unwrapData, unwrapList, unwrapPaginated } from '@/shared/api/unwrap';

import { discountPct, formatPkr, unitPrice } from '../lib/money';
import type { ShopFilterKind } from '../lib/shopPaths';
import { asNumber } from './schemaHelpers';

// —— Wire schemas (catalog) ——

export const brandWireSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    slug: z.string().nullable().optional(),
    logo: z.string().nullable().optional(),
    sort_order: z.number().nullable().optional(),
  })
  .passthrough();

export const categoryWireSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    slug: z.string().nullable().optional(),
    parent_id: z.number().nullable().optional(),
    image: z.string().nullable().optional(),
    sort_order: z.number().nullable().optional(),
  })
  .passthrough();

export const vendorBriefWireSchema = z
  .object({
    id: z.number().optional(),
    store_name: z.string().nullable().optional(),
    slug: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    logo: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
  })
  .passthrough();

const productImageWireSchema = z
  .object({
    id: z.number().optional(),
    path: z.string().nullable().optional(),
    url: z.string().nullable().optional(),
    alt: z.string().nullable().optional(),
    sort_order: z.number().nullable().optional(),
  })
  .passthrough();

/** Full shop product wire (feed keeps its own subset schema). */

export const productWireSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    slug: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    sku: z.string().nullable().optional(),
    price: z.union([z.number(), z.string()]),
    sale_price: z.union([z.number(), z.string()]).nullable().optional(),
    brand_id: z.number().nullable().optional(),
    brand: brandWireSchema.nullable().optional(),
    category_id: z.number().nullable().optional(),
    category: categoryWireSchema.nullable().optional(),
    vendor_id: z.number().nullable().optional(),
    vendor: vendorBriefWireSchema.nullable().optional(),
    stock_quantity: z.number().nullable().optional(),
    low_stock_threshold: z.number().nullable().optional(),
    is_active: z.boolean().optional(),
    is_featured: z.boolean().optional(),
    is_popular: z.boolean().optional(),
    is_special_offer: z.boolean().optional(),
    discount_type: z.string().nullable().optional(),
    discount_value: z.union([z.number(), z.string()]).nullable().optional(),
    discount_starts_at: z.string().nullable().optional(),
    discount_ends_at: z.string().nullable().optional(),
    images: z.array(productImageWireSchema).optional(),
  })
  .passthrough();

export type ProductWire = z.infer<typeof productWireSchema>;

export const shopVendorPublicWireSchema = z
  .object({
    id: z.number(),
    store_name: z.string(),
    slug: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    logo: z.string().nullable().optional(),
    banner: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    products: z.array(productWireSchema).optional(),
  })
  .passthrough();

export type ShopVendorPublicWire = z.infer<typeof shopVendorPublicWireSchema>;

// —— Domain types ——

export type ShopBrand = {
  id: number;
  name: string;
  slug: string | null;
  logoUrl: string | null;
};

export type ShopCategory = {
  id: number;
  name: string;
  slug: string | null;
  parentId: number | null;
  imageUrl: string | null;
};

export type ShopVendorBrief = {
  id: number | null;
  storeName: string;
  slug: string | null;
  phone: string | null;
  logoUrl: string | null;
  city: string | null;
  country: string | null;
};

export type ShopProduct = {
  id: number;
  name: string;
  slug: string | null;
  description: string | null;
  price: number;
  salePrice: number | null;
  unitPrice: number;
  priceLabel: string;
  compareAtLabel: string | null;
  discountPercent: number | null;
  brandId: number | null;
  brandName: string | null;
  brandSlug: string | null;
  categoryId: number | null;
  categoryName: string | null;
  vendor: ShopVendorBrief | null;
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  isSpecialOffer: boolean;
  discountType: string | null;
  discountValue: number | null;
  discountStartsAt: string | null;
  discountEndsAt: string | null;
  imageUrls: string[];
  outOfStock: boolean;
  lowStock: boolean;
};

/** Public storefront — GET /shop/vendors/{slug}. */

export type ShopVendorPublic = {
  id: number;
  storeName: string;
  slug: string | null;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  city: string | null;
  country: string | null;
  phone: string | null;
  products: ShopProduct[];
  placeLabel: string | null;
};

/** POST/PATCH /shop/vendor/products */

export type VendorProductWriteBody = {
  name: string;
  description?: string | undefined;
  price: number;
  brand_id: number;
  category_id: number;
  stock_quantity: number;
  is_active: boolean;
  discount_type?: string | null | undefined;
  discount_value?: number | null | undefined;
  discount_starts_at?: string | null | undefined;
  discount_ends_at?: string | null | undefined;
};

export type ProductListParams = {
  search?: string | undefined;
  brandId?: number | undefined;
  categoryId?: number | undefined;
  vendorId?: number | undefined;
  isFeatured?: boolean | undefined;
  isPopular?: boolean | undefined;
  isSpecialOffer?: boolean | undefined;
  perPage?: number | undefined;
  page?: number | undefined;
  all?: boolean | undefined;
};

// —— Mappers / parsers ——

function imageUrl(img: z.infer<typeof productImageWireSchema> | undefined): string | null {
  if (!img) return null;
  return img.path ?? img.url ?? null;
}

export function toVendorBrief(wire: z.infer<typeof vendorBriefWireSchema> | null | undefined): ShopVendorBrief | null {
  if (!wire) return null;
  const storeName = wire.store_name?.trim();
  if (!storeName && wire.id == null) return null;
  return {
    id: wire.id ?? null,
    storeName: storeName || 'Store',
    slug: wire.slug ?? null,
    phone: wire.phone ?? null,
    logoUrl: wire.logo ?? null,
    city: wire.city ?? null,
    country: wire.country ?? null,
  };
}

export function toBrand(wire: z.infer<typeof brandWireSchema>): ShopBrand {
  return {
    id: wire.id,
    name: wire.name,
    slug: wire.slug ?? null,
    logoUrl: wire.logo ?? null,
  };
}

export function toCategory(wire: z.infer<typeof categoryWireSchema>): ShopCategory {
  return {
    id: wire.id,
    name: wire.name,
    slug: wire.slug ?? null,
    parentId: wire.parent_id ?? null,
    imageUrl: wire.image ?? null,
  };
}

export function toProduct(wire: ProductWire): ShopProduct {
  const price = asNumber(wire.price);
  const saleRaw = wire.sale_price != null ? asNumber(wire.sale_price) : null;
  const salePrice = saleRaw != null && saleRaw < price ? saleRaw : null;
  const unit = unitPrice(price, salePrice);
  const stock = wire.stock_quantity ?? 0;
  const lowThreshold = wire.low_stock_threshold ?? 5;
  const images = (wire.images ?? []).map(imageUrl).filter((u): u is string => Boolean(u));

  return {
    id: wire.id,
    name: wire.name.trim() || 'Product',
    slug: wire.slug ?? null,
    description: wire.description?.trim() || null,
    price,
    salePrice,
    unitPrice: unit,
    priceLabel: formatPkr(unit),
    compareAtLabel: salePrice != null ? formatPkr(price) : null,
    discountPercent: discountPct(price, salePrice),
    brandId: wire.brand_id ?? wire.brand?.id ?? null,
    brandName: wire.brand?.name ?? null,
    brandSlug: wire.brand?.slug ?? null,
    categoryId: wire.category_id ?? wire.category?.id ?? null,
    categoryName: wire.category?.name ?? null,
    vendor: toVendorBrief(wire.vendor),
    stock,
    lowStockThreshold: lowThreshold,
    isActive: wire.is_active !== false,
    isFeatured: Boolean(wire.is_featured),
    isPopular: Boolean(wire.is_popular),
    isSpecialOffer: Boolean(wire.is_special_offer),
    discountType: wire.discount_type ?? null,
    discountValue: wire.discount_value != null ? asNumber(wire.discount_value) : null,
    discountStartsAt: wire.discount_starts_at ?? null,
    discountEndsAt: wire.discount_ends_at ?? null,
    imageUrls: images,
    outOfStock: stock <= 0,
    lowStock: stock > 0 && stock <= lowThreshold,
  };
}

export function toShopVendorPublic(wire: ShopVendorPublicWire): ShopVendorPublic {
  const place = [wire.city, wire.country].filter(Boolean).join(', ');
  return {
    id: wire.id,
    storeName: wire.store_name.trim() || 'Store',
    slug: wire.slug ?? null,
    description: wire.description?.trim() || null,
    logoUrl: wire.logo ?? null,
    bannerUrl: wire.banner ?? null,
    city: wire.city ?? null,
    country: wire.country ?? null,
    phone: wire.phone ?? null,
    products: (wire.products ?? []).map(toProduct),
    placeLabel: place || null,
  };
}

export function parseProductList(raw: unknown): ShopProduct[] {
  const page = unwrapPaginated(productWireSchema)(raw);
  return page.items.map(toProduct);
}

export function parseProduct(raw: unknown): ShopProduct {
  return toProduct(unwrapData(productWireSchema)(raw));
}

export function parseBrandList(raw: unknown): ShopBrand[] {
  const page = unwrapPaginated(brandWireSchema)(raw);
  return page.items.map(toBrand);
}

export function parseBrand(raw: unknown): ShopBrand {
  return toBrand(unwrapData(brandWireSchema)(raw));
}

export function parseBrandArray(raw: unknown): ShopBrand[] {
  return unwrapList(brandWireSchema)(raw).map(toBrand);
}

export function parseShopVendorPublic(raw: unknown): ShopVendorPublic {
  return toShopVendorPublic(unwrapData(shopVendorPublicWireSchema)(raw));
}

export function parseCategoryArray(raw: unknown): ShopCategory[] {
  return unwrapList(categoryWireSchema)(raw).map(toCategory);
}

export function parseCategoryList(raw: unknown): ShopCategory[] {
  const page = unwrapPaginated(categoryWireSchema)(raw);
  return page.items.map(toCategory);
}

export function parseCategory(raw: unknown): ShopCategory {
  return toCategory(unwrapData(categoryWireSchema)(raw));
}

export function filterParamsForKind(kind: ShopFilterKind): ProductListParams {
  if (kind === 'popular') return { isPopular: true };
  if (kind === 'special-offer') return { isSpecialOffer: true };
  return { isFeatured: true };
}
