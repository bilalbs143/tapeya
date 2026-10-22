import { Link } from 'react-router-dom';

import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { ChevronRightIcon } from '@/shared/ui/icons';
import { ErrorState } from '@/shared/ui/states';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { toast } from '@/shared/ui/toast';

import { shopPaths } from '../lib/shopPaths';
import type { VendorStore } from '../model/vendorSchemas';
import type { useSellerHub } from './useSellerHub';

type SellerHubFlow = ReturnType<typeof useSellerHub>;

type SellerHubBodyProps = {
  flow: SellerHubFlow;
  store: VendorStore;
};

function VendorStatusBanner({
  status,
  statusLabel,
  reason,
}: {
  status: string;
  statusLabel: string;
  reason: string | null;
}) {
  if (status === 'approved') return null;

  if (status === 'pending') {
    return (
      <div className="border-brand/40 bg-brand/10 rounded-card border p-4">
        <p className="text-brand-text text-2xs font-bold tracking-wide uppercase">Pending Approval</p>
        <p className="text-muted mt-1 text-2xs leading-snug">
          Your seller account is under review. You can browse your hub, but products and store settings are read-only
          until approved.
        </p>
      </div>
    );
  }

  return (
    <div className="border-danger/40 bg-danger/10 rounded-card border p-4">
      <p className="text-danger-soft text-2xs font-bold tracking-wide uppercase">{statusLabel}</p>
      <p className="text-muted mt-1 text-2xs leading-snug">
        {reason?.trim() ||
          (status === 'rejected'
            ? 'Your seller application was not approved. Contact support if you need help.'
            : 'Your seller account is suspended. Products and store settings are read-only.')}
      </p>
    </div>
  );
}

/** Store card, metrics, and seller tool nav — under ScreenBar. */
export function SellerHubBody({ flow, store }: SellerHubBodyProps) {
  const { pending, locked, metricItems, navItems, dashLoading, dashError, refetchDash, copied, copyStoreLink } = flow;

  return (
    <div className="flex flex-col gap-5 px-4 pt-4 pb-6">
      <VendorStatusBanner status={store.status} statusLabel={store.statusLabel} reason={store.suspensionReason} />

      <section className={cn('border-border-subtle bg-surface rounded-card border p-4', locked && 'opacity-50')}>
        <div className="flex items-start gap-3">
          <span className="bg-brand/16 text-brand-text grid h-11 w-11 shrink-0 place-items-center rounded-panel text-sm font-extrabold">
            {store.storeName.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm leading-normal font-extrabold text-ink">{store.storeName}</p>
            {store.slug ? (
              <p className="text-dim font-mono mt-0.5 truncate text-4xs tracking-[.06em]">
                tapeya.com/shop/{store.slug}
              </p>
            ) : null}
            <div className="mt-2">
              <StatusBadge kind="vendor" status={store.status} />
            </div>
          </div>
        </div>

        {!pending ? (
          <div className="mt-3 flex gap-2">
            <Button
              variant="secondary"
              className="h-10 flex-1 rounded-panel text-2xs font-bold"
              onClick={() => void copyStoreLink(store)}
              disabled={!store.slug}
            >
              {copied ? 'Copied' : 'Copy Store Link'}
            </Button>
            <Button asChild variant="secondary" className="h-10 flex-1 rounded-panel text-2xs font-bold">
              <Link to={store.slug ? shopPaths.vendor(store.slug) : shopPaths.home()}>View as Buyer</Link>
            </Button>
          </div>
        ) : null}
      </section>

      {dashError ? (
        <ErrorState title="Couldn't Load Metrics" onRetry={() => void refetchDash()} className="rounded-card" />
      ) : (
        <div className={cn('grid grid-cols-2 gap-2.5', locked && 'opacity-50')}>
          {metricItems.map((m) => (
            <div key={m.label} className="border-border-subtle bg-surface rounded-card border p-3.5">
              <p className="font-mono text-4xs font-bold tracking-[.12em] text-muted uppercase">{m.label}</p>
              <p
                className={cn(
                  'font-mono mt-1.5 text-title leading-normal font-extrabold tabular-nums',
                  m.tone === 'positive' ? 'text-positive-2' : m.tone === 'danger' ? 'text-danger-soft' : 'text-ink'
                )}
              >
                {dashLoading ? '—' : m.value}
              </p>
            </div>
          ))}
        </div>
      )}

      <nav
        className={cn(
          'border-border-subtle bg-surface divide-border-subtle flex flex-col divide-y overflow-hidden rounded-card border',
          locked && 'opacity-50'
        )}
        aria-label="Seller Tools"
      >
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.comingSoon ? shopPaths.seller() : item.to}
            onClick={
              item.comingSoon
                ? (e) => {
                    e.preventDefault();
                    toast({ title: 'Seller Tools Are Coming Soon', tone: 'info' });
                  }
                : undefined
            }
            className="hover:bg-surface-raised flex items-center gap-3 p-3.5"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-body-sm font-bold text-ink">{item.label}</span>
              <span className="text-dim mt-0.5 block truncate text-3xs leading-normal">{item.note}</span>
            </span>
            {item.count != null ? (
              <span className="font-mono shrink-0 text-xs font-bold text-muted tabular-nums">{item.count}</span>
            ) : null}
            <ChevronRightIcon className="text-dim h-3.5 w-3.5 shrink-0" strokeWidth={2.4} />
          </Link>
        ))}
      </nav>

      <p className="text-dim text-center text-3xs leading-relaxed">
        Seller hub tools are live — store, products, orders, brands, and categories.
      </p>
    </div>
  );
}
