import { Link, useNavigate, useParams } from 'react-router-dom';

import { DockScreen } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { ErrorState, FormFieldsSkeleton, ListRowSkeleton, Skeleton } from '@/shared/ui/states';

import { useGetVendorOrderQuery, useGetVendorStoreQuery } from '../api/vendorShopApi';
import { shopPaths } from '../lib/shopPaths';
import {
  SellerOrderDetailBody,
  SellerOrderDetailFlowProvider,
  SellerOrderDetailFooter,
} from '../ui/SellerOrderDetailBody';

/** Status + tracking via POST …/status; payment via POST …/payment. */
export default function SellerOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const orderId = Number(id);
  const valid = Number.isFinite(orderId) && orderId > 0;

  const { data: store } = useGetVendorStoreQuery();
  const orderQuery = useGetVendorOrderQuery(orderId, { skip: !valid });

  const listBack = () => navigate(shopPaths.sellerOrders());
  const order = orderQuery.data;
  const ready = valid && !orderQuery.isLoading && !orderQuery.isError && order != null;
  const storeApproved = store?.status === 'approved';
  const storeStatusLabel = store?.statusLabel;

  const dock = (
    <DockScreen
      title="Order"
      subtitle={ready ? order.vendorOrderNumber : 'Fulfillment and Tracking'}
      onBack={listBack}
      footer={ready ? <SellerOrderDetailFooter /> : undefined}
    >
      {!valid ? (
        <div className="flex flex-col items-center gap-4 px-4 py-8 text-center">
          <p className="text-sm font-bold text-ink">Order Not Found</p>
          <Button asChild variant="secondary">
            <Link to={shopPaths.sellerOrders()}>All Orders</Link>
          </Button>
        </div>
      ) : orderQuery.isLoading ? (
        <div className="flex flex-col gap-4 px-4 pt-4" aria-busy="true" aria-label="Loading Order">
          <div className="border-border-subtle rounded-card border p-4">
            <div className="flex items-start gap-2.5">
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Skeleton className="h-2.5 w-16" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-2.5 w-full" />
                <Skeleton className="h-2.5 w-2/3" />
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <Skeleton className="h-5 w-16 rounded-chip" />
                <Skeleton className="h-5 w-12 rounded-chip" />
              </div>
            </div>
          </div>
          <div className="border-border-subtle divide-border-subtle flex flex-col divide-y overflow-hidden rounded-card border">
            <ListRowSkeleton />
            <ListRowSkeleton />
          </div>
          <FormFieldsSkeleton rows={3} />
          <Skeleton className="h-12 w-full rounded-field" />
        </div>
      ) : orderQuery.isError || !order ? (
        <div className="px-4 py-8">
          <ErrorState title="Couldn’t Load This Order" onRetry={() => void orderQuery.refetch()} />
        </div>
      ) : (
        <SellerOrderDetailBody key={order.id} />
      )}
    </DockScreen>
  );

  if (ready) {
    return (
      <SellerOrderDetailFlowProvider order={order} storeApproved={storeApproved} storeStatusLabel={storeStatusLabel}>
        {dock}
      </SellerOrderDetailFlowProvider>
    );
  }

  return dock;
}
