import { useNavigate } from 'react-router-dom';

import { ScreenBar } from '@/shared/layout';
import { ErrorState, FormFieldsSkeleton, Skeleton } from '@/shared/ui/states';

import { useGetVendorStoreQuery } from '../api/vendorShopApi';
import { shopPaths } from '../lib/shopPaths';
import { SellerStoreFormBody } from '../ui/SellerStoreFormBody';

/** Read for pending/suspended; PATCH only when approved. */

export default function SellerStorePage() {
  const navigate = useNavigate();
  const { data: store, isLoading, isError, refetch } = useGetVendorStoreQuery();

  if (isLoading && !store) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        <ScreenBar title="Store Settings" subtitle="Public Store Profile" onBack={() => navigate(shopPaths.seller())} />
        <div className="flex flex-col gap-4 px-4 pt-4" aria-busy="true" aria-label="Loading Store Settings">
          <Skeleton className="h-3 w-2/3" />
          <FormFieldsSkeleton rows={5} />
          <Skeleton className="h-12 w-full rounded-field" />
        </div>
      </div>
    );
  }

  if (isError || !store) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        <ScreenBar title="Store Settings" subtitle="Public Store Profile" onBack={() => navigate(shopPaths.seller())} />
        <div className="px-4 py-8">
          <ErrorState title="Couldn’t Load Store" onRetry={() => void refetch()} />
        </div>
      </div>
    );
  }

  return <SellerStoreFormBody key={store.id} store={store} />;
}
