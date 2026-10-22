import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import type { VendorDashboard } from '../model/vendorSchemas';
import { formatPkr } from './money';
import { shopPaths } from './shopPaths';

export type SellerHubMetric = {
  label: string;
  value: string | number;
  tone?: 'danger' | 'positive' | undefined;
};

export type SellerHubNavItem = {
  to: string;
  label: string;
  note: string;
  count?: number | undefined;
  comingSoon?: boolean | undefined;
};

/** 404 or VENDOR_PROFILE_REQUIRED → show apply CTA instead of hard error. */
export function needsVendorApply(error: unknown): boolean {
  if (typeof error !== 'object' || error == null || !('status' in error)) return false;
  const err = error as FetchBaseQueryError;
  if (err.status === 404) return true;
  if (err.status !== 403) return false;
  const data = err.data;
  if (typeof data !== 'object' || data == null || !('type' in data)) return false;
  return (data as { type?: string }).type === 'VENDOR_PROFILE_REQUIRED';
}

export function sellerHubStorePublicUrl(slug: string): string {
  return `https://tapeya.com/shop/${slug}`;
}

export function sellerHubMetricItems(pending: boolean, metrics: VendorDashboard | null | undefined): SellerHubMetric[] {
  if (pending) {
    return [
      { label: 'Open Orders', value: metrics?.openOrders ?? 0 },
      { label: 'Active Products', value: metrics?.activeProducts ?? 0 },
    ];
  }
  return [
    { label: 'Open Orders', value: metrics?.openOrders ?? 0 },
    { label: 'Active Products', value: metrics?.activeProducts ?? 0 },
    {
      label: 'Out of Stock',
      value: metrics?.outOfStock ?? 0,
      tone: metrics?.outOfStock ? 'danger' : undefined,
    },
    {
      label: 'Earnings · 30d',
      value: formatPkr(metrics?.earnings30d ?? 0),
      tone: 'positive',
    },
  ];
}

export function sellerHubNavItems(
  pending: boolean,
  locked: boolean,
  metrics: VendorDashboard | null | undefined
): SellerHubNavItem[] {
  if (pending) {
    return [
      {
        to: shopPaths.sellerOrders(),
        label: 'Orders',
        note: 'Read-only while under review',
      },
      {
        to: shopPaths.sellerProducts(),
        label: 'Products',
        note: 'Read-only while under review',
      },
      {
        to: shopPaths.sellerStore(),
        label: 'Store Settings',
        note: 'Read-only while under review',
      },
    ];
  }
  return [
    {
      to: shopPaths.sellerOrders(),
      label: 'Orders',
      note: 'Fulfil, dispatch and mark payment',
      count: metrics?.openOrders,
    },
    {
      to: shopPaths.sellerProducts(),
      label: 'Products',
      note: 'Listings, stock and pricing',
      count: metrics?.totalProducts,
    },
    { to: shopPaths.sellerBrands(), label: 'Brands', note: 'Group products by maker' },
    {
      to: shopPaths.sellerCategories(),
      label: 'Categories',
      note: 'What buyers filter by',
    },
    {
      to: shopPaths.sellerStore(),
      label: 'Store Settings',
      note: locked ? 'Read-only while under review' : 'Name, link, description, contact',
    },
  ];
}
