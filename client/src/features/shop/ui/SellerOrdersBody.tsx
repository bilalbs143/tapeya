import { Link } from 'react-router-dom';

import { PageDock, ScreenBar } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { EmptyState, ErrorState, OrderCardSkeleton, Skeleton } from '@/shared/ui/states';
import { StatusBadge } from '@/shared/ui/StatusBadge';

import { formatPkr } from '../lib/money';
import {
  sellerOrderCardTitle,
  sellerOrderItemsMeta,
  sellerOrderThumbInitials,
  sellerOrderTrackingLine,
} from '../lib/sellerOrders';
import { shopPaths } from '../lib/shopPaths';
import type { VendorOrder } from '../model/schemas';
import type { useSellerOrders } from './useSellerOrders';

type SellerOrdersFlow = ReturnType<typeof useSellerOrders>;

type SellerOrdersBodyProps = {
  flow: SellerOrdersFlow;
};

function OrderCard({ order }: { order: VendorOrder }) {
  const first = order.items[0];
  const itemCount = order.items.length;
  const title = sellerOrderCardTitle({
    customerName: order.customer?.name,
    firstItemName: first?.name,
  });
  const meta = sellerOrderItemsMeta(itemCount, order.placedLabel);
  const tracking = sellerOrderTrackingLine(order.carrier, order.trackingNumber);
  const initials = sellerOrderThumbInitials(first?.name, order.vendorOrderNumber);

  return (
    <Link
      to={shopPaths.sellerOrder(order.id)}
      className="border-border-subtle bg-surface hover:border-border focus-visible:outline-brand flex flex-col gap-2.5 rounded-card border p-3.5 focus-visible:outline-2"
    >
      <div className="flex items-center gap-2">
        <span className="font-mono min-w-0 flex-1 truncate text-xs font-bold tracking-[.06em] text-ink">
          {order.vendorOrderNumber}
        </span>
        <StatusBadge
          kind="order"
          status={order.paid ? 'delivered' : 'pending'}
          label={order.paid ? 'Paid' : 'Unpaid'}
        />
        <StatusBadge kind="order" status={order.status} label={order.statusLabel} />
      </div>

      <div className="flex items-center gap-3">
        <span className="bg-surface-raised h-11 w-11 shrink-0 overflow-hidden rounded-panel">
          {first?.imageUrl ? (
            <img src={first.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-dim grid h-full w-full place-items-center font-mono text-4xs font-bold">
              {initials}
            </span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-2xs font-semibold text-body">{title}</span>
          <span className="text-dim mt-0.5 block truncate text-3xs">{meta}</span>
        </span>
        <span className="shrink-0 text-right">
          <span className="font-mono block text-sm font-extrabold text-ink tabular-nums">
            {formatPkr(order.vendorEarnings)}
          </span>
          <span className="text-dim font-mono block text-4xs tracking-[.08em] uppercase">Your Earnings</span>
        </span>
      </div>

      {tracking ? (
        <p className="text-dim font-mono border-border-subtle border-t pt-2.5 text-3xs tracking-[.06em]">{tracking}</p>
      ) : null}
    </Link>
  );
}

function OrderSection({ label, orders }: { label: string; orders: VendorOrder[] }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="font-mono text-2xs font-bold tracking-eyebrow text-muted uppercase">{label}</h2>
      <ul className="flex flex-col gap-2.5">
        {orders.map((o) => (
          <li key={o.id}>
            <OrderCard order={o} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Current / previous order sections with earnings cards. */
export function SellerOrdersBody({ flow }: SellerOrdersBodyProps) {
  const { readOnlyNote, current, previous, isLoading, isError, refetch, goSeller } = flow;

  return (
    <PageDock header={<ScreenBar title="Orders" subtitle="Orders for Your Store" onBack={goSeller} />}>
      <div className="flex flex-col gap-5 px-4 pt-4 pb-6">
        {readOnlyNote ? <p className="text-muted text-2xs leading-relaxed">{readOnlyNote}</p> : null}

        {isLoading ? (
          <section className="flex flex-col gap-2.5" aria-busy="true" aria-label="Loading Orders">
            <Skeleton className="h-2.5 w-16" />
            {[0, 1, 2].map((i) => (
              <OrderCardSkeleton key={i} />
            ))}
          </section>
        ) : null}

        {isError && !isLoading ? <ErrorState title="Couldn’t Load Orders" onRetry={() => void refetch()} /> : null}

        {!isLoading && !isError && !current.length && !previous.length ? (
          <EmptyState
            size="lg"
            title="No Orders Yet"
            description="Orders from your store will show up here the moment a buyer checks out."
            action={
              <Button asChild variant="secondary">
                <Link to={shopPaths.sellerProducts()}>Check Your Listings</Link>
              </Button>
            }
          />
        ) : null}

        {!isLoading && !isError && current.length ? <OrderSection label="Current" orders={current} /> : null}
        {!isLoading && !isError && previous.length ? <OrderSection label="Previous" orders={previous} /> : null}
      </div>
    </PageDock>
  );
}
