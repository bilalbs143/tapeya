import { useNavigate } from 'react-router-dom';

import { DockScreen } from '@/shared/layout';
import { ErrorState, FormFieldsSkeleton, Skeleton } from '@/shared/ui/states';

import { useGetVendorStoreQuery } from '../api/vendorShopApi';
import { shopPaths } from '../lib/shopPaths';
import { SellerStoreFormBody, SellerStoreFormFlowProvider, SellerStoreFormFooter } from '../ui/SellerStoreFormBody';

/** Read for pending/suspended; PATCH only when approved. */

export default function SellerStorePage() {
  const navigate = useNavigate();
  const { data: store, isLoading, isError, refetch } = useGetVendorStoreQuery();

  const back = () => navigate(shopPaths.seller());
  const ready = store != null && !isError;

  const dock = (
    <DockScreen
      title="Store Settings"
      subtitle="Public Store Profile"
      onBack={back}
      footer={ready ? <SellerStoreFormFooter /> : undefined}
    >
      {isLoading && !store ? (
        <div className="flex flex-col gap-4 px-4 pt-4" aria-busy="true" aria-label="Loading Store Settings">
          <Skeleton className="h-3 w-2/3" />
          <FormFieldsSkeleton rows={5} />
          <Skeleton className="h-12 w-full rounded-field" />
        </div>
      ) : isError || !store ? (
        <div className="px-4 py-8">
          <ErrorState title="Couldn’t Load Store" onRetry={() => void refetch()} />
        </div>
      ) : (
        <SellerStoreFormBody key={store.id} />
      )}
    </DockScreen>
  );

  if (store != null && !isError) {
    return <SellerStoreFormFlowProvider store={store}>{dock}</SellerStoreFormFlowProvider>;
  }

  return dock;
}
