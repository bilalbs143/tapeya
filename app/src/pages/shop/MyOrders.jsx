import { memo, useCallback } from 'react';

import { useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { formatRelativeDate } from '@/lib/utils/dateUtils';
import { formatPrice } from '@/lib/format';
import { useGetOrdersQuery } from '@/store/api/shopApi';
import { Container } from '@/ui/Container';

const CURRENT_STATUSES = ['pending', 'processing'];

const STATUS_PILL_STYLES = {
  pending: 'border border-brand text-brand font-bold uppercase tracking-wide',
  processing: 'border border-white text-white font-bold uppercase tracking-wide',
  dispatched: 'border border-[#34C759] text-[#34C759] font-bold uppercase tracking-wide',
  delivered: 'border border-[#22C55E] text-[#22C55E] font-bold uppercase tracking-wide',
  cancelled: 'border border-[#FF3B30] text-[#FF3B30] font-bold uppercase tracking-wide',
  shipped: 'border border-[#34C759] text-[#34C759] font-bold uppercase tracking-wide',
};

function OrderStatusPill({ status, statusLabel }) {
  const value = (status ?? '').toLowerCase();
  const display = (statusLabel ?? value) !== '' ? (statusLabel ?? value).toUpperCase() : '—';
  const style =
    STATUS_PILL_STYLES[value] ?? 'border border-[#6B7280] bg-transparent text-[#6B7280] font-bold uppercase tracking-wide';

  return <span className={`inline-block rounded-full px-3 py-1 text-[11px] ${style}`}>{display}</span>;
}

const OrderCard = memo(function OrderCard({ order, onClick }) {
  const items = order.items ?? [];
  const firstItemName = items[0]?.product_snapshot?.name ?? 'Order items';
  const extraCount = items.length > 1 ? items.length - 1 : 0;
  const names = items
    .slice(0, 3)
    .map((i) => i.product_snapshot?.name ?? '')
    .filter(Boolean);
  const rawSummary = names.length ? names.join(' ') : firstItemName;
  const maxLen = 42;
  const displaySummary = rawSummary.length > maxLen ? `${rawSummary.slice(0, maxLen - 3).trim()}...` : rawSummary;
  const relativeTime = formatRelativeDate(order.created_at);

  return (
    <button
      type="button"
      onClick={() => onClick(order.id)}
      className="flex w-full flex-col gap-0 rounded-[17px] bg-surface p-4 text-left transition-opacity active:opacity-90"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="min-w-0 flex-1 text-base leading-tight font-bold text-white">{order.order_number ?? '—'}</p>
        {relativeTime && <span className="shrink-0 text-[12px] font-medium text-muted">{relativeTime}</span>}
      </div>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <p className="text-base text-[16px] leading-tight font-bold text-brand">{formatPrice(order.total)}</p>
          <p className="text-[16px] font-medium text-[#808080]">Total</p>
        </div>
        <OrderStatusPill status={order.status} statusLabel={order.status_label} />
      </div>
      <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-1">
        <span className="min-w-0 truncate text-[13px] font-normal text-[#CCCCCC]">{displaySummary}</span>
        {extraCount > 0 && <span className="shrink-0 font-normal text-brand">+{extraCount}</span>}
      </div>
    </button>
  );
});

export default function MyOrders() {
  const navigate = useNavigate();
  const {
    data: ordersResponse,
    isLoading,
    isError,
    refetch,
  } = useGetOrdersQuery({
    per_page: 50,
  });
  const orders = ordersResponse?.data ?? [];

  const currentOrders = orders.filter((o) => CURRENT_STATUSES.includes(o.status ?? ''));
  const previousOrders = orders.filter((o) => !CURRENT_STATUSES.includes(o.status ?? ''));

  const handleOrderClick = useCallback(
    (orderId) => {
      navigate(`/shop/orders/${orderId}`);
    },
    [navigate],
  );

  return (
    <div className="bg-black">
      <AppSubpageHeader title="MY ORDERS" />
      <Container>
        {isLoading && (
          <div className="flex min-h-[30vh] items-center justify-center py-12">
            <p className="text-[14px] text-muted">Loading orders…</p>
          </div>
        )}

        {isError && !isLoading && (
          <div className="flex min-h-[30vh] flex-col items-center justify-center gap-4 py-12">
            <p className="text-[14px] text-muted">Could not load orders. Please try again.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-full bg-brand px-6 py-2.5 text-[14px] font-bold text-black"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="flex flex-col gap-8">
            <section>
              <h2 className="mb-4 text-[13px] font-bold tracking-wide text-muted uppercase">CURRENT ORDERS</h2>
              <div className="flex flex-col gap-3">
                {currentOrders.length === 0 ? (
                  <p className="text-[13px] text-muted">No current orders.</p>
                ) : (
                  currentOrders.map((order) => <OrderCard key={order.id} order={order} onClick={handleOrderClick} />)
                )}
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-[13px] font-bold tracking-wide text-muted uppercase">PREVIOUS ORDERS</h2>
              <div className="flex flex-col gap-3">
                {previousOrders.length === 0 ? (
                  <p className="text-[13px] text-muted">No previous orders.</p>
                ) : (
                  previousOrders.map((order) => <OrderCard key={order.id} order={order} onClick={handleOrderClick} />)
                )}
              </div>
            </section>
          </div>
        )}
      </Container>
    </div>
  );
}
