import { Link } from 'react-router-dom';

import { StatusBadge } from '@/shared/ui/StatusBadge';

import { formatPkr } from '../lib/money';
import { buyerOrderCardTitle, buyerOrderExtraItemsLabel } from '../lib/ordersPage';
import { shopPaths } from '../lib/shopPaths';
import type { ShopOrder } from '../model/schemas';
import type { useOrdersPage } from './useOrdersPage';

type OrdersFlow = ReturnType<typeof useOrdersPage>;

type OrdersPageBodyProps = {
  flow: OrdersFlow;
};

function OrderCard({ order }: { order: ShopOrder }) {
  const first = order.items[0];
  const extra = order.items.length - 1;
  const title = buyerOrderCardTitle(first?.name);
  const extraLabel = buyerOrderExtraItemsLabel(extra);

  return (
    <Link
      to={shopPaths.order(order.id)}
      className="border-border-subtle bg-surface hover:border-border focus-visible:outline-brand flex flex-col rounded-card border p-3.5 focus-visible:outline-2"
    >
      <div className="mb-2.5 flex items-center gap-2.5">
        <span className="font-mono min-w-0 flex-1 truncate text-xs font-bold tracking-[.06em] text-ink">
          {order.orderNumber}
        </span>
        <StatusBadge kind="order" status={order.status} />
      </div>

      <div className="flex items-center gap-3">
        <span className="bg-surface-raised h-11 w-11 shrink-0 overflow-hidden rounded-panel">
          {first?.imageUrl ? <img src={first.imageUrl} alt="" className="h-full w-full object-cover" /> : null}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-2xs leading-normal font-semibold text-body">{title}</span>
          {extraLabel ? <span className="text-dim mt-0.5 block text-3xs">{extraLabel}</span> : null}
        </span>
        <span className="shrink-0 text-right">
          <span className="font-mono block text-body-sm font-extrabold text-ink tabular-nums">
            {formatPkr(order.total)}
          </span>
          <span className="text-dim font-mono mt-0.5 block text-4xs leading-normal tracking-[.06em] uppercase">
            {order.placedLabel}
          </span>
        </span>
      </div>
    </Link>
  );
}

function OrderSection({ label, orders }: { label: string; orders: ShopOrder[] }) {
  return (
    <section>
      <h2 className="font-mono mb-2.5 text-2xs font-bold tracking-eyebrow text-muted uppercase">{label}</h2>
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

/** Current / previous buyer order sections — page owns DockScreen. */
export function OrdersPageBody({ flow }: OrdersPageBodyProps) {
  const { current, previous } = flow;

  return (
    <div className="flex flex-col gap-5 px-4 pt-4 pb-6">
      {current.length ? <OrderSection label="Current" orders={current} /> : null}
      {previous.length ? <OrderSection label="Previous" orders={previous} /> : null}
    </div>
  );
}
