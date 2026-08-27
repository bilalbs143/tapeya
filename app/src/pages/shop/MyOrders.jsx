import { memo, useCallback } from 'react';

import { useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { formatPrice } from '@/lib/format';
import { formatRelativeDate } from '@/lib/utils/dateUtils';
import { OrderStatusPill } from '@/pages/vendor/OrderStatusPill';
import { useGetOrdersQuery } from '@/store/api/shopApi';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { ListEmpty, ListError } from '@/ui/ListState';
import { PageLoader } from '@/ui/Loader';

const CURRENT_STATUSES = ['pending', 'processing'];

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
      className="bg-surface flex w-full flex-col gap-0 rounded-[17px] p-4 text-left transition-opacity active:opacity-90"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="min-w-0 flex-1 text-base leading-tight font-bold text-white">{order.order_number ?? '—'}</p>
        {relativeTime && <span className="text-muted shrink-0 text-[12px] font-medium">{relativeTime}</span>}
      </div>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <p className="text-brand text-base text-[16px] leading-tight font-bold">{formatPrice(order.total)}</p>
          <p className="text-[16px] font-medium text-[#808080]">Total</p>
        </div>
        <OrderStatusPill status={order.status} statusLabel={order.status_label} />
      </div>
      <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-1">
        <span className="min-w-0 truncate text-[13px] font-normal text-[#CCCCCC]">{displaySummary}</span>
        {extraCount > 0 && <span className="text-brand shrink-0 font-normal">+{extraCount}</span>}
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
        {isLoading && <PageLoader label="Loading orders" className="min-h-[30vh] py-12" />}

        {isError && !isLoading ? <ListError message="Could not load orders." onRetry={() => refetch()} /> : null}

        {!isLoading && !isError && orders.length === 0 ? (
          <ListEmpty
            title="No Orders Yet."
            description="Items you buy in the shop will show up here."
            action={
              <Button type="button" variant="orange" onClick={() => navigate('/shop')}>
                Browse Shop
              </Button>
            }
          />
        ) : null}

        {!isLoading && !isError && orders.length > 0 ? (
          <div className="flex flex-col gap-8 pb-10">
            {currentOrders.length > 0 ? (
              <section>
                <h2 className="text-muted mb-4 text-[13px] font-bold tracking-wide uppercase">CURRENT ORDERS</h2>
                <div className="flex flex-col gap-3">
                  {currentOrders.map((order) => (
                    <OrderCard key={order.id} order={order} onClick={handleOrderClick} />
                  ))}
                </div>
              </section>
            ) : null}

            {previousOrders.length > 0 ? (
              <section>
                <h2 className="text-muted mb-4 text-[13px] font-bold tracking-wide uppercase">PREVIOUS ORDERS</h2>
                <div className="flex flex-col gap-3">
                  {previousOrders.map((order) => (
                    <OrderCard key={order.id} order={order} onClick={handleOrderClick} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        ) : null}
      </Container>
    </div>
  );
}
