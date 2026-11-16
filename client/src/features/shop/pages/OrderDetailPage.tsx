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
        <EmptyState size="lg" title="Order Not Found" />
      ) : isLoading ? (
        <div className="flex flex-col gap-3 px-4 pt-4">
          <Skeleton className="h-28 w-full rounded-card" />
          <Skeleton className="h-40 w-full rounded-card" />
        </div>
      ) : isError || !order ? (
        <ErrorState
          page
          title="Order Not Found"
          description="That order number doesn't belong to this account, or the link is wrong."
          onRetry={() => void refetch()}
          action={
            <Button asChild variant="secondary">
              <Link to={shopPaths.orders()}>All Orders</Link>
            </Button>
          }
        />
      ) : (
        <OrderDetailBody flow={flow} />
      )}
    </DockScreen>
  );
}
