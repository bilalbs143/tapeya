import { Link, useParams } from 'react-router-dom';

import { ScreenBar } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { EmptyState, ErrorState, Skeleton } from '@/shared/ui/states';

import { parseOrderIdParam } from '../lib/orderDetail';
import { shopPaths } from '../lib/shopPaths';
import { OrderDetailBody } from '../ui/OrderDetailBody';
import { useOrderDetail } from '../ui/useOrderDetail';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = parseOrderIdParam(id);
  const flow = useOrderDetail(orderId);
  const { order, isLoading, isError, refetch, goOrders } = flow;

  const header = <ScreenBar title="Order Detail" subtitle="Status and Tracking" onBack={goOrders} />;

  if (orderId == null) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        {header}
        <div className="px-4 py-8">
          <EmptyState title="Order Not Found" />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        {header}
        <div className="flex flex-col gap-3 px-4 pt-4">
          <Skeleton className="h-28 w-full rounded-card" />
          <Skeleton className="h-40 w-full rounded-card" />
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        {header}
        <div className="flex flex-col items-center gap-4 px-4 py-8">
          <ErrorState
            title="Order Not Found"
            description="That order number doesn't belong to this account, or the link is wrong."
            onRetry={() => void refetch()}
          />
          <Button asChild variant="secondary">
            <Link to={shopPaths.orders()}>All Orders</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface flex min-h-full flex-col">
      <ScreenBar title="Order Detail" subtitle={order.orderNumber} onBack={goOrders} />
      <OrderDetailBody flow={flow} />
    </div>
  );
}
