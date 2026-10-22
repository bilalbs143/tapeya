import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { toast } from '@/shared/ui/toast';

import { useGetVendorDashboardQuery, useGetVendorStoreQuery } from '../api/vendorShopApi';
import { needsVendorApply, sellerHubMetricItems, sellerHubNavItems, sellerHubStorePublicUrl } from '../lib/sellerHub';
import { shopPaths } from '../lib/shopPaths';
import type { VendorStore } from '../model/vendorSchemas';

/** Store + dashboard queries and copy-link for SellerHubPage. */
export function useSellerHub() {
  const navigate = useNavigate();
  const storeQuery = useGetVendorStoreQuery();
  const {
    data: store,
    isLoading: storeLoading,
    isError: storeError,
    error: storeErr,
    refetch: refetchStore,
  } = storeQuery;

  const dashQuery = useGetVendorDashboardQuery(undefined, { skip: !store });
  const { data: dash, isLoading: dashLoading, isError: dashError, refetch: refetchDash } = dashQuery;

  const [copied, setCopied] = useState(false);

  const pending = store?.status === 'pending';
  const locked = store != null && store.status !== 'approved';
  const metrics = dashLoading ? null : dashError ? null : (dash ?? null);

  const metricItems = useMemo(() => sellerHubMetricItems(Boolean(pending), metrics), [pending, metrics]);
  const navItems = useMemo(() => sellerHubNavItems(Boolean(pending), locked, metrics), [pending, locked, metrics]);

  async function copyStoreLink(current: VendorStore) {
    if (!current.slug) return;
    try {
      await navigator.clipboard.writeText(sellerHubStorePublicUrl(current.slug));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast({ title: 'Could Not Copy Link', tone: 'error' });
    }
  }

  function goHome() {
    navigate(shopPaths.home());
  }

  return {
    navigate,
    goHome,
    store,
    storeLoading,
    storeError,
    storeErr,
    needsApply: storeError && needsVendorApply(storeErr),
    refetchStore,
    dashLoading,
    dashError,
    refetchDash,
    pending: Boolean(pending),
    locked,
    metricItems,
    navItems,
    copied,
    copyStoreLink,
  };
}
