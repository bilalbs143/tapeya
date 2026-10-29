import { Link, useParams } from 'react-router-dom';

import { DockScreen } from '@/shared/layout';
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
  const ready = orderId != null && !isLoading && !isError && order != null;

  return (
    <DockScreen title="Order Detail" subtitle={ready ? order.orderNumber : 'Status and Tracking'} onBack={goOrders}>
      {orderId == null ? (
        <div className="px-4 py-8">
          <EmptyState title="Order Not Found" />
        </div>
      ) : isLoading ? (
        <div className="flex flex-col gap-3 px-4 pt-4">
          <Skeleton className="h-28 w-full rounded-card" />
          <Skeleton className="h-40 w-full rounded-card" />
        </div>
      ) : isError || !order ? (
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
      ) : (
        <OrderDetailBody flow={flow} />
      )}
    </DockScreen>
  );
}
