import { Link } from 'react-router-dom';

import { ScreenBar } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { EmptyState, ErrorState, Skeleton } from '@/shared/ui/states';

import { shopPaths } from '../lib/shopPaths';
import { SellerHubBody } from '../ui/SellerHubBody';
import { useSellerHub } from '../ui/useSellerHub';

/** Dashboard + store status; store settings live; products/orders/taxonomies next. */
export default function SellerHubPage() {
  const flow = useSellerHub();
  const { goHome, store, storeLoading, storeError, needsApply, refetchStore } = flow;

  const header = <ScreenBar title="Seller Hub" subtitle="Store, Products and Orders" onBack={goHome} />;

  if (storeLoading) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        {header}
        <div className="flex flex-col gap-5 px-4 pt-4 pb-6" aria-busy="true" aria-label="Loading Seller Hub">
          <Skeleton className="h-12 w-full rounded-panel" />
          <div className="border-border-subtle rounded-card border p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-11 w-11 shrink-0 rounded-panel" />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-2.5 w-40" />
                <Skeleton className="mt-1 h-5 w-16 rounded-chip" />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Skeleton className="h-10 flex-1 rounded-panel" />
              <Skeleton className="h-10 flex-1 rounded-panel" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="border-border-subtle rounded-card border p-3.5">
                <Skeleton className="h-2.5 w-20" />
                <Skeleton className="mt-2 h-5 w-12" />
              </div>
            ))}
          </div>
          <div className="border-border-subtle divide-border-subtle flex flex-col divide-y overflow-hidden rounded-card border">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3.5">
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-40" />
                </div>
                <Skeleton className="h-3.5 w-3.5 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (needsApply) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        {header}
        <div className="flex flex-1 flex-col px-4">
          <EmptyState
            size="lg"
            title="Sell on Tapeya"
            description="Apply to open a store. Once approved you can list gear, fulfil orders, and track earnings here."
            action={
              <Button asChild size="lg">
                <Link to={shopPaths.sellerApply()}>Become a Seller</Link>
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  if (storeError || !store) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        {header}
        <div className="px-4 py-8">
          <ErrorState
            title="Couldn't Load Seller Hub"
            description="You may not have a store yet, or the connection dropped."
            onRetry={() => void refetchStore()}
          />
          <div className="mt-4 flex justify-center">
            <Button asChild variant="secondary">
              <Link to={shopPaths.sellerApply()}>Become a Seller</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface flex min-h-full flex-col">
      {header}
      <SellerHubBody flow={flow} store={store} />
    </div>
  );
}
