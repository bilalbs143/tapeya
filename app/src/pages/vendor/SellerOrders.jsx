import { memo, useCallback, useMemo } from 'react';

import { useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { formatPrice } from '@/lib/format';
import { formatRelativeDate } from '@/lib/utils/dateUtils';
import { useGetVendorOrdersQuery, useGetVendorStoreQuery } from '@/store/api/vendorShopApi';
import { Container } from '@/ui/Container';
import { ListEmpty, ListError } from '@/ui/ListState';
import { PageLoader } from '@/ui/Loader';

import { OrderStatusPill } from './OrderStatusPill';

const CURRENT_STATUSES = ['pending', 'processing', 'dispatched'];

const OrderCard = memo(function OrderCard({ order, onClick }) {
  const relativeTime = formatRelativeDate(order.created_at);

  return (
    <button
      type="button"
      onClick={() => onClick(order.id)}
      className="bg-surface flex w-full flex-col gap-2 rounded-[17px] p-4 text-left transition-opacity active:opacity-90"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="min-w-0 flex-1 text-base leading-tight font-bold text-white">
          {order.vendor_order_number ?? `#${order.id}`}
        </p>
        {relativeTime ? <span className="text-muted shrink-0 text-[12px] font-medium">{relativeTime}</span> : null}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="text-brand text-[16px] font-bold">{formatPrice(order.total)}</span>
          <span className="text-[16px] font-medium text-[#808080]">Total</span>
        </div>
        <OrderStatusPill status={order.status} statusLabel={order.status_label} />
      </div>
    </button>
  );
});

function OrderSection({ title, orders, onOpen }) {
  return (
    <section>
      <h2 className="text-muted mb-4 text-[13px] font-bold tracking-wide uppercase">{title}</h2>
      <div className="flex flex-col gap-3">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} onClick={onOpen} />
        ))}
      </div>
    </section>
  );
}

export default function SellerOrders() {
  const navigate = useNavigate();
  const { data: store } = useGetVendorStoreQuery();
  const { data: ordersResponse, isLoading, isError, refetch } = useGetVendorOrdersQuery({ all: true });
  const orders = ordersResponse?.data ?? [];
  const canEdit = store?.status === 'approved';

  const { currentOrders, previousOrders } = useMemo(() => {
    const current = [];
    const previous = [];
    for (const order of orders) {
      if (CURRENT_STATUSES.includes((order.status ?? '').toLowerCase())) current.push(order);
      else previous.push(order);
    }
    return { currentOrders: current, previousOrders: previous };
  }, [orders]);

  const openOrder = useCallback(
    (id) => {
      navigate(`/seller/orders/${id}`);
    },
    [navigate],
  );

  return (
    <div className="bg-black">
      <AppSubpageHeader sticky title="ORDERS" onBack={() => navigate('/seller')} />
      <Container className="pb-8">
        {!canEdit && store?.status ? (
          <p className="text-muted mb-4 text-[13px] leading-snug">
            Order updates are disabled while your account is {store.status_label ?? store.status}.
          </p>
        ) : null}

        {isLoading ? (
          <PageLoader label="Loading orders" className="min-h-[30vh] py-12" />
        ) : isError ? (
          <ListError message="Could not load orders." onRetry={() => refetch()} />
        ) : orders.length === 0 ? (
          <ListEmpty title="No Orders Yet." description="Orders from your store will show up here." />
        ) : (
          <div className="flex flex-col gap-8">
            {currentOrders.length > 0 ? <OrderSection title="Current Orders" orders={currentOrders} onOpen={openOrder} /> : null}
            {previousOrders.length > 0 ? (
              <OrderSection title="Previous Orders" orders={previousOrders} onOpen={openOrder} />
            ) : null}
          </div>
        )}
      </Container>
    </div>
  );
}
