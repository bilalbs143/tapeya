import { createContext, type ReactNode, useContext } from 'react';

import { Button } from '@/shared/ui/Button';
import { Form } from '@/shared/ui/Form';
import { CommentIcon } from '@/shared/ui/icons';
import { Input } from '@/shared/ui/Input';
import { SelectField, SelectItem } from '@/shared/ui/Select';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { StickyActionBar } from '@/shared/ui/StickyActionBar';

import { formatPkr } from '../lib/money';
import { SELLER_ORDER_PAYMENT_OPTIONS, SELLER_ORDER_STATUS_OPTIONS } from '../lib/sellerOrderDetail';
import type { VendorOrder } from '../model/schemas';
import { MoneyRows } from './MoneyRows';
import { useSellerOrderDetail } from './useSellerOrderDetail';

type SellerOrderDetailFlow = ReturnType<typeof useSellerOrderDetail>;

type SellerOrderDetailFlowState = {
  order: VendorOrder;
  storeStatusLabel?: string | undefined;
  flow: SellerOrderDetailFlow;
};

const SellerOrderDetailFlowContext = createContext<SellerOrderDetailFlowState | null>(null);

function useSellerOrderDetailFlowState(): SellerOrderDetailFlowState {
  const state = useContext(SellerOrderDetailFlowContext);
  if (!state) {
    throw new Error('SellerOrderDetailFlowProvider is required');
  }
  return state;
}

type SellerOrderDetailFlowProviderProps = {
  order: VendorOrder;
  storeApproved: boolean;
  storeStatusLabel?: string | undefined;
  children: ReactNode;
};

/** Shares one fulfillment flow between DockScreen body and footer. */
export function SellerOrderDetailFlowProvider({
  order,
  storeApproved,
  storeStatusLabel,
  children,
}: SellerOrderDetailFlowProviderProps) {
  const flow = useSellerOrderDetail({ order, storeApproved });
  return (
    <SellerOrderDetailFlowContext value={{ order, storeStatusLabel, flow }}>{children}</SellerOrderDetailFlowContext>
  );
}

/** Sticky Save Order — page owns DockScreen. */
export function SellerOrderDetailFooter() {
  const { flow } = useSellerOrderDetailFlowState();
  const { writable, busy } = flow;
  if (!writable) return null;
  return (
    <StickyActionBar>
      <Button type="submit" form="seller-order-form" className="w-full font-bold" loading={busy}>
        Save Order
      </Button>
    </StickyActionBar>
  );
}

/** Fulfillment form + money / items — page owns DockScreen. */
export function SellerOrderDetailBody() {
  const { order, storeStatusLabel, flow } = useSellerOrderDetailFlowState();
  const {
    canEdit,
    status,
    setStatus,
    carrier,
    setCarrier,
    tracking,
    setTracking,
    paymentStatus,
    setPaymentStatus,
    amountReceived,
    setAmountReceived,
    showTracking,
    paymentRefunded,
    canEditPayment,
    canEditStatus,
    commissionPct,
    customer,
    wa,
    onSave,
  } = flow;

  return (
    <Form id="seller-order-form" density="compact" onSubmit={(ev) => void onSave(ev)} className="px-4 pt-4 pb-4">
      {!canEdit && storeStatusLabel ? (
        <p className="text-muted text-2xs leading-relaxed">
          Updates are disabled while your account is {storeStatusLabel}.
        </p>
      ) : null}

      <section className="border-border-subtle bg-surface rounded-card border p-4">
        <div className="flex items-start gap-2.5">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-4xs font-bold tracking-[.12em] text-muted uppercase">Ship To</p>
            {customer ? <p className="mt-1.5 text-xs font-bold text-ink">{customer.name}</p> : null}
            <p className="text-muted mt-1 text-2xs leading-relaxed">{order.shipToLabel}</p>
            {order.placedLabel ? (
              <p className="text-dim font-mono mt-2 text-4xs tracking-[.06em] uppercase">Placed {order.placedLabel}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <StatusBadge kind="order" status={status} />
            <StatusBadge
              kind="order"
              status={paymentStatus === 'paid' || paymentStatus === 'advance' ? 'delivered' : 'pending'}
              label={
                order.parent?.paymentStatusLabel ??
                (paymentStatus === 'paid' ? 'Paid' : paymentStatus === 'advance' ? 'Advance' : 'Unpaid')
              }
            />
          </div>
        </div>

        {customer?.phone || wa ? (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {customer?.phone ? (
              <a
                href={`tel:${customer.phone}`}
                className="bg-surface-raised border-border-subtle flex min-h-10 items-center justify-center gap-2 rounded-panel border text-2xs font-bold text-body"
              >
                Call
              </a>
            ) : null}
            {wa ? (
              <a
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noreferrer"
                className="border-positive/40 bg-positive/12 text-positive-2 flex min-h-10 items-center justify-center gap-2 rounded-panel border text-2xs font-bold"
              >
                <CommentIcon className="h-3.5 w-3.5" strokeWidth={2} />
                WhatsApp
              </a>
            ) : null}
          </div>
        ) : null}

        {order.parent?.notes ? (
          <p className="text-muted border-border-subtle mt-3 border-t pt-3 text-2xs leading-relaxed">
            <span className="font-bold text-ink">Buyer notes · </span>
            {order.parent.notes}
          </p>
        ) : null}
      </section>

      <section className="border-border-subtle bg-surface rounded-card border p-4">
        <h2 className="font-mono mb-3 text-2xs font-bold tracking-eyebrow text-ink uppercase">Money</h2>
        <MoneyRows
          rows={[
            ['Subtotal', formatPkr(order.subtotal)],
            ['Shipping', formatPkr(order.shippingAmount)],
            [
              commissionPct != null ? `Commission · ${commissionPct}% of goods` : 'Commission',
              `− ${formatPkr(order.commissionAmount)}`,
            ],
          ]}
        />
        <div className="border-border-subtle mt-2.5 flex items-baseline justify-between border-t pt-2.5">
          <span className="text-body-sm font-extrabold text-ink">Your Earnings</span>
          <span className="font-mono text-positive-2 text-body-lg leading-normal font-extrabold tabular-nums">
            {formatPkr(order.vendorEarnings)}
          </span>
        </div>
      </section>

      <section className="border-border-subtle bg-surface flex flex-col gap-3 rounded-card border p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-mono text-2xs font-bold tracking-eyebrow text-ink uppercase">Fulfilment</h2>
          {!canEditStatus ? (
            <span className="font-mono text-4xs font-bold tracking-widest text-dim uppercase">Locked</span>
          ) : null}
        </div>

        <SelectField
          label="Order Status"
          value={status}
          onValueChange={setStatus}
          disabled={!canEditStatus}
          triggerClassName="h-12 rounded-field text-body-sm font-semibold capitalize"
        >
          {SELLER_ORDER_STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="capitalize">
              {opt.label}
            </SelectItem>
          ))}
        </SelectField>
        <p className="text-dim text-3xs leading-relaxed">
          pending → processing → dispatched → delivered, or cancelled at any point.
        </p>

        {showTracking ? (
          <>
            <Input
              label="Carrier"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              disabled={!canEditStatus}
              placeholder="e.g. TCS, Leopards"
              className="h-12 rounded-field"
            />
            <Input
              label="Tracking Number"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              disabled={!canEditStatus}
              placeholder="Tracking #"
              hint="Shown to the buyer on their order."
              className="h-12 rounded-field font-mono"
            />
          </>
        ) : (
          <p className="text-dim border-border-subtle rounded-panel border border-dashed p-3 text-3xs leading-relaxed">
            Carrier and tracking appear once you move this to{' '}
            <strong className="font-bold text-body">dispatched</strong>.
          </p>
        )}
      </section>

      <section className="border-border-subtle bg-surface overflow-hidden rounded-card border">
        <h2 className="border-border-subtle font-mono border-b px-4 py-3 text-2xs font-bold tracking-eyebrow text-ink uppercase">
          {order.items.length} item{order.items.length === 1 ? '' : 's'} to pack
        </h2>
        {order.items.length === 0 ? (
          <p className="text-muted px-4 py-4 text-2xs">No products on this order.</p>
        ) : (
          <ul className="divide-border-subtle flex flex-col divide-y">
            {order.items.map((it) => (
              <li key={it.id} className="flex gap-3 p-3.5">
                <span className="bg-surface-raised h-14 w-14 shrink-0 overflow-hidden rounded-panel">
                  {it.imageUrl ? <img src={it.imageUrl} alt="" className="h-full w-full object-cover" /> : null}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="line-clamp-2 text-xs leading-snug font-bold text-ink">{it.name}</span>
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
        )}
      </section>

      <section className="border-border-subtle bg-surface flex flex-col gap-3 rounded-card border p-4">
        <h2 className="font-mono text-2xs font-bold tracking-eyebrow text-ink uppercase">Payment</h2>
        {paymentRefunded ? (
          <p className="text-muted text-2xs leading-relaxed">
            This order was refunded. Payment can no longer be changed.
          </p>
        ) : (
          <>
            <SelectField
              label="Payment Status"
              value={paymentStatus}
              onValueChange={setPaymentStatus}
              disabled={!canEditPayment}
              triggerClassName="h-12 rounded-field text-body-sm font-semibold"
            >
              {SELLER_ORDER_PAYMENT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectField>
            <Input
              label="Amount Received (PKR)"
              type="number"
              min={0}
              value={amountReceived}
              onChange={(e) => setAmountReceived(e.target.value)}
              disabled={!canEditPayment}
              placeholder={order.parent?.total != null ? String(order.parent.total) : '0'}
              className="h-12 rounded-field font-mono"
            />
          </>
        )}
      </section>
    </Form>
  );
}
