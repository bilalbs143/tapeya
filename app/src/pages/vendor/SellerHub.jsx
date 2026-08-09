import { useCallback } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { useToast } from '@/hooks/useToast';
import { buildHttpsDeepLink } from '@/lib/deepLinks/deepLinkUtils';
import { formatPrice } from '@/lib/format';
import { useGetVendorDashboardQuery, useGetVendorStoreQuery } from '@/store/api/vendorShopApi';
import { Container } from '@/ui/Container';

function StatusBanner({ status, statusLabel, suspensionReason }) {
  if (status === 'pending') {
    return (
      <div className="border-brand/40 bg-brand/10 rounded-[17px] border p-4">
        <p className="text-brand text-[13px] font-bold tracking-wide uppercase">Pending Approval</p>
        <p className="text-muted mt-1 text-[13px] leading-snug">
          Your seller account is under review. You can browse your hub, but products and store settings are read-only until
          approved.
        </p>
      </div>
    );
  }

  if (status === 'suspended' || status === 'rejected') {
    return (
      <div className="rounded-[17px] border border-red-500/40 bg-red-950/30 p-4">
        <p className="text-[13px] font-bold tracking-wide text-red-300 uppercase">{statusLabel ?? status}</p>
        <p className="text-muted mt-1 text-[13px] leading-snug">
          {suspensionReason?.trim() ||
            (status === 'rejected'
              ? 'Your seller application was not approved. Contact support if you need help.'
              : 'Your seller account is suspended. Products and store settings are read-only.')}
        </p>
      </div>
    );
  }

  return null;
}

function MetricCard({ label, value }) {
  return (
    <div className="bg-surface flex flex-col rounded-[17px] p-4">
      <span className="text-brand text-[18px] leading-tight font-bold sm:text-2xl">{value ?? '—'}</span>
      <span className="text-muted mt-1 text-[11px] font-bold tracking-wide uppercase sm:text-[12px]">{label}</span>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export default function SellerHub() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: dashboard, isLoading: dashLoading } = useGetVendorDashboardQuery();
  const { data: store, isLoading: storeLoading } = useGetVendorStoreQuery();
  const isLoading = dashLoading || storeLoading;
  const canEdit = store?.status === 'approved';

  const handleCopyStoreLink = useCallback(async () => {
    if (!store?.slug) return;
    const url = buildHttpsDeepLink(`/shop/${store.slug}`);
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Store link copied');
    } catch {
      toast.error('Could not copy link');
    }
  }, [store?.slug, toast]);

  const productsCount = dashboard?.total_products ?? dashboard?.products_count;
  const activeCount = dashboard?.active_products ?? dashboard?.published_count;
  const pendingOrders = dashboard?.pending_orders ?? dashboard?.pending_orders_count;
  const grossRevenue = dashboard?.gross_revenue;
  const netEarnings = dashboard?.net_earnings;
  const lowStock = dashboard?.low_stock_count;

  return (
    <div className="bg-black">
      <AppSubpageHeader sticky title="SELLER HUB" onBack={() => navigate(-1)} />
      <Container className="pb-8">
        <div className="flex flex-col gap-6 pb-8">
          {store && (
            <StatusBanner status={store.status} statusLabel={store.status_label} suspensionReason={store.suspension_reason} />
          )}

          {store?.store_name && (
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-[16px] font-bold text-white">{store.store_name}</h2>
                {store.slug && <p className="text-muted mt-0.5 text-[12px]">/{store.slug}</p>}
              </div>
              {store.slug ? (
                <button
                  type="button"
                  onClick={handleCopyStoreLink}
                  aria-label="Copy Store Link"
                  className="text-muted hover:text-brand flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 transition-colors active:opacity-80"
                >
                  <CopyIcon />
                </button>
              ) : null}
            </div>
          )}

          {isLoading ? (
            <div className="flex min-h-[20vh] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white/70" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <MetricCard label="Products" value={productsCount} />
              <MetricCard label="Active" value={activeCount} />
              <MetricCard label="Pending Orders" value={pendingOrders} />
              <MetricCard label="Gross Revenue" value={grossRevenue != null ? formatPrice(grossRevenue) : '—'} />
              <MetricCard label="Net Earnings" value={netEarnings != null ? formatPrice(netEarnings) : '—'} />
              <MetricCard label="Low Stock" value={lowStock} />
            </div>
          )}

          <nav className="flex flex-col gap-3">
            <Link
              to="/seller/orders"
              className="bg-surface flex items-center justify-between rounded-[17px] px-4 py-4 transition-opacity active:opacity-90"
            >
              <div>
                <p className="text-[14px] font-bold text-white">Orders</p>
                <p className="text-muted mt-0.5 text-[12px]">
                  {canEdit ? 'Fulfill and track vendor orders' : 'View vendor orders (read-only)'}
                </p>
              </div>
              <span className="text-brand text-[18px]" aria-hidden>
                →
              </span>
            </Link>
            <Link
              to="/seller/products"
              className="bg-surface flex items-center justify-between rounded-[17px] px-4 py-4 transition-opacity active:opacity-90"
            >
              <div>
                <p className="text-[14px] font-bold text-white">Products</p>
                <p className="text-muted mt-0.5 text-[12px]">
                  {canEdit ? 'Manage your catalog' : 'View your catalog (read-only)'}
                </p>
              </div>
              <span className="text-brand text-[18px]" aria-hidden>
                →
              </span>
            </Link>
            <Link
              to="/seller/brands"
              className="bg-surface flex items-center justify-between rounded-[17px] px-4 py-4 transition-opacity active:opacity-90"
            >
              <div>
                <p className="text-[14px] font-bold text-white">Brands</p>
                <p className="text-muted mt-0.5 text-[12px]">
                  {canEdit ? 'Add missing brands for your catalog' : 'View brands (read-only)'}
                </p>
              </div>
              <span className="text-brand text-[18px]" aria-hidden>
                →
              </span>
            </Link>
            <Link
              to="/seller/categories"
              className="bg-surface flex items-center justify-between rounded-[17px] px-4 py-4 transition-opacity active:opacity-90"
            >
              <div>
                <p className="text-[14px] font-bold text-white">Categories</p>
                <p className="text-muted mt-0.5 text-[12px]">
                  {canEdit ? 'Add missing categories for your catalog' : 'View categories (read-only)'}
                </p>
              </div>
              <span className="text-brand text-[18px]" aria-hidden>
                →
              </span>
            </Link>
            <Link
              to="/seller/store"
              className="bg-surface flex items-center justify-between rounded-[17px] px-4 py-4 transition-opacity active:opacity-90"
            >
              <div>
                <p className="text-[14px] font-bold text-white">Store Settings</p>
                <p className="text-muted mt-0.5 text-[12px]">
                  {canEdit ? 'Profile and shipping defaults' : 'View store profile (read-only)'}
                </p>
              </div>
              <span className="text-brand text-[18px]" aria-hidden>
                →
              </span>
            </Link>
          </nav>
        </div>
      </Container>
    </div>
  );
}
