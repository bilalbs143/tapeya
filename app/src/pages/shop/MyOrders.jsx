import { useNavigate } from 'react-router-dom';

import { formatDate, formatPrice } from '@/lib/format';
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
  const firstItem = order.items?.[0];
  const name = firstItem?.product_snapshot?.name ?? 'Order items';
  const quantity = firstItem?.quantity ?? 0;
  const created = formatDate(order.created_at);

  return (
    <button
      type="button"
      onClick={() => onClick(order.id)}
      className="flex w-full gap-3 rounded-2xl bg-[#1A1A1A] p-4 text-left transition-opacity active:opacity-90"
    >
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white">
        <div
          className="flex h-full w-full items-center justify-center bg-[#141412] text-[24px] font-bold text-[#DA9811]"
          aria-hidden
        >
          #
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
        <p className="text-[13px] font-normal text-white">{name}</p>
        <p className="flex my-1 flex-wrap items-center justify-between gap-2 text-[13px] font-normal text-[#A2A6AB]">
          <span>{order.order_number}</span>
          <OrderStatusPill
            status={order.status}
            statusLabel={order.status_label}
          />
        </p>
        <p className="text-[16px] font-bold text-[#DA9811]">
          {formatPrice(order.total)}{' '}
          <span className="font-normal text-white">
            {order.items?.length > 1
              ? `· ${order.items.length} items`
              : quantity > 1
                ? `x ${quantity}`
                : ''}
          </span>
        </p>
        {created && (
          <p className="text-[12px] font-normal text-[#A2A6AB]">
            Ordered on {created}
          </p>
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
