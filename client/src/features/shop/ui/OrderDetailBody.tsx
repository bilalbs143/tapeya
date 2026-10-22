import { Button } from '@/shared/ui/Button';
import { StatusBadge } from '@/shared/ui/StatusBadge';

import { formatPkr } from '../lib/money';
import { MoneyRows } from './MoneyRows';
import { SellerContactCard } from './SellerContactCard';
import type { useOrderDetail } from './useOrderDetail';

type OrderDetailFlow = ReturnType<typeof useOrderDetail>;

type OrderDetailBodyProps = {
  flow: OrderDetailFlow;
};

/** Status card, items, totals, cancel / contact footer. */
export function OrderDetailBody({ flow }: OrderDetailBodyProps) {
  const { order, vendor, itemsHeading, nonCancelNote, cancelling, onCancel } = flow;

  if (!order) return null;

  const moneyRows: Array<[string, string] | [string, string, 'positive']> = [
    ['Subtotal', formatPkr(order.subtotal)],
    ['Shipping', formatPkr(order.shippingAmount)],
  ];
  if (order.discountAmount) {
    moneyRows.push(['Discount', `− ${formatPkr(order.discountAmount)}`, 'positive']);
  }

  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-6">
      <section className="border-border-subtle bg-surface rounded-card border p-4">
        <div className="flex items-start gap-2.5">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-sm leading-normal font-extrabold tracking-[.06em] text-ink">
              {order.orderNumber}
            </p>
            {order.placedLabel ? (
              <p className="text-dim font-mono mt-1.5 text-4xs tracking-[.06em] uppercase">
                Placed {order.placedLabel}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <StatusBadge kind="order" status={order.status} />
            <StatusBadge
              kind="order"
              status={order.paid ? 'delivered' : 'pending'}
              label={order.paid ? 'Paid' : 'Unpaid'}
            />
          </div>
        </div>

        <div className="border-border-subtle mt-3.5 border-t pt-3">
          <p className="font-mono text-4xs font-bold tracking-[.12em] text-muted uppercase">Delivering To</p>
          <p className="mt-1.5 text-2xs leading-relaxed text-body">{order.deliveryLabel}</p>
        </div>
      </section>

      {!order.canCancel && order.status !== 'cancelled' ? <SellerContactCard vendor={vendor} /> : null}

      <section className="border-border-subtle bg-surface overflow-hidden rounded-card border">
        <h2 className="border-border-subtle font-mono border-b px-4 py-3 text-2xs font-bold tracking-eyebrow text-ink uppercase">
          {itemsHeading}
        </h2>
        <ul className="divide-border-subtle flex flex-col divide-y">
          {order.items.map((it) => (
            <li key={it.id} className="flex gap-3 p-3.5">
              <span className="bg-surface-raised h-14 w-14 shrink-0 overflow-hidden rounded-panel">
                {it.imageUrl ? <img src={it.imageUrl} alt="" className="h-full w-full object-cover" /> : null}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="line-clamp-2 text-xs leading-snug font-bold text-ink">{it.name}</span>
                {it.storeName ? <span className="text-dim text-3xs">{it.storeName}</span> : null}
                <span className="font-mono text-2xs font-semibold text-muted tabular-nums">
                  {formatPkr(it.unitPrice)} × {it.quantity}
                </span>
              </span>
              <span className="font-mono shrink-0 text-xs font-bold text-ink tabular-nums">
                {formatPkr(it.totalPrice)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-border-subtle bg-surface rounded-card border p-4">
        <h2 className="font-mono mb-3 text-2xs font-bold tracking-eyebrow text-ink uppercase">Totals</h2>
        <MoneyRows rows={moneyRows} total={formatPkr(order.total)} />
      </section>

      {order.canCancel ? (
        <Button
          variant="secondary"
          className="text-danger-soft border-danger/40 bg-surface-raised min-h-11 w-full rounded-panel text-body-sm font-bold"
          loading={cancelling}
          onClick={() => void onCancel()}
        >
          Cancel Order
        </Button>
      ) : order.status === 'cancelled' ? (
        <p className="text-dim px-1 text-center text-2xs leading-relaxed">
          This order was cancelled. Nothing was charged.
        </p>
      ) : (
        <p className="text-dim px-1 text-center text-2xs leading-relaxed">{nonCancelNote}</p>
      )}
    </div>
  );
}
