import { useNavigate } from 'react-router-dom';

import { formatPrice } from '@/lib/format';
import { useGetOrdersQuery } from '@/store/api/shopApi';
import { Container } from '@/ui/Container';

const CURRENT_STATUSES = ['pending', 'processing'];

const STATUS_PILL_STYLES = {
  pending:
    'border border-[#DA9811] text-[#DA9811] font-bold uppercase tracking-wide',
  processing:
    'border border-white text-white font-bold uppercase tracking-wide',
  dispatched:
    'border border-[#34C759] text-[#34C759] font-bold uppercase tracking-wide',
  delivered:
    'border border-[#22c55e] text-[#22c55e] font-bold uppercase tracking-wide',
  cancelled:
    'border border-[#FF3B30] text-[#FF3B30] font-bold uppercase tracking-wide',
  shipped:
    'border border-[#34C759] text-[#34C759] font-bold uppercase tracking-wide',
};

function getRelativeTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

function OrderStatusPill({ status, statusLabel }) {
  const value = (status ?? '').toLowerCase();
  const display =
    (statusLabel ?? value) !== '' ? (statusLabel ?? value).toUpperCase() : '—';
  const style =
    STATUS_PILL_STYLES[value] ??
    'border border-[#6b7280] bg-transparent text-[#6b7280] font-bold uppercase tracking-wide';

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-[11px] ${style}`}
    >
      {display}
    </span>
  );
}

function OrderCard({ order, onClick }) {
  const items = order.items ?? [];
  const firstItemName = items[0]?.product_snapshot?.name ?? 'Order items';
  const extraCount = items.length > 1 ? items.length - 1 : 0;
  const names = items
    .slice(0, 3)
    .map((i) => i.product_snapshot?.name ?? '')
    .filter(Boolean);
  const rawSummary = names.length ? names.join(' ') : firstItemName;
  const maxLen = 42;
  const displaySummary =
    rawSummary.length > maxLen
      ? `${rawSummary.slice(0, maxLen - 3).trim()}...`
      : rawSummary;
  const relativeTime = getRelativeTime(order.created_at);

  return (
    <button
      type="button"
      onClick={() => onClick(order.id)}
      className="flex w-full flex-col gap-0 rounded-[17px] bg-[#141412] p-4 text-left transition-opacity active:opacity-90"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="min-w-0 flex-1 text-base font-bold leading-tight text-white">
          {order.order_number ?? '—'}
        </p>
        {relativeTime && (
          <span className="shrink-0 text-[12px] font-medium text-[#A2A6AB]">
            {relativeTime}
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1 flex items-center gap-2">
        <p className="text-base font-bold leading-tight text-[16px] text-[#DA9811]">
            {formatPrice(order.total)}
          </p>
          <p className="text-[16px] font-medium text-[#808080]">Total</p>
      
        </div>
        <OrderStatusPill
          status={order.status}
          statusLabel={order.status_label}
        />
      </div>
      <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-1">
        <span className="min-w-0 truncate text-[13px] font-normal text-[#CCCCCC]">
          {displaySummary}
        </span>
        {extraCount > 0 && (
          <span className="shrink-0 font-normal text-[#DA9811]">
            +{extraCount}
          </span>
        )}
      </div>
    </button>
  );
}

export default function MyOrders() {
  const navigate = useNavigate();
  const { data: ordersResponse, isLoading } = useGetOrdersQuery({
    per_page: 50,
  });
  const orders = ordersResponse?.data ?? [];

  const currentOrders = orders.filter((o) =>
    CURRENT_STATUSES.includes(o.status ?? ''),
  );
  const previousOrders = orders.filter(
    (o) => !CURRENT_STATUSES.includes(o.status ?? ''),
  );

  const handleOrderClick = (orderId) => {
    navigate(`/shop/orders/${orderId}`);
  };

  return (
    <div className="min-h-screen bg-black">
      <Container className="!px-4 !py-0">
        <header className="-mx-4 -mt-6 flex items-center gap-3 bg-black px-4 pt-6 pb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full bg-white text-[#4a4a4a] transition-opacity active:opacity-80"
            aria-label="Back"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="min-w-0 flex-1 pr-[27px] text-center text-[16px] font-bold tracking-wide text-white uppercase">
            MY ORDERS
          </h1>
        </header>

        {!isLoading && (
          <div className="flex flex-col gap-8 pt-2">
            <section>
              <h2 className="mb-4 text-[13px] font-bold tracking-wide text-[#A2A6AB] uppercase">
                CURRENT ORDERS
              </h2>
              <div className="flex flex-col gap-3">
                {currentOrders.length === 0 ? (
                  <p className="text-[13px] text-[#A2A6AB]">
                    No current orders.
                  </p>
                ) : (
                  currentOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onClick={handleOrderClick}
                    />
                  ))
                )}
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-[13px] font-bold tracking-wide text-[#A2A6AB] uppercase">
                PREVIOUS ORDERS
              </h2>
              <div className="flex flex-col gap-3">
                {previousOrders.length === 0 ? (
                  <p className="text-[13px] text-[#A2A6AB]">
                    No previous orders.
                  </p>
                ) : (
                  previousOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onClick={handleOrderClick}
                    />
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </Container>
    </div>
  );
}
