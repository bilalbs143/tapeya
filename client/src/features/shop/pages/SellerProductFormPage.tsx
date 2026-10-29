import { useNavigate, useParams } from 'react-router-dom';

import { DockScreen } from '@/shared/layout';
import { ErrorState, FormFieldsSkeleton, Skeleton } from '@/shared/ui/states';

import { useGetVendorProductQuery, useGetVendorStoreQuery } from '../api/vendorShopApi';
import { shopPaths } from '../lib/shopPaths';
import {
  SellerProductFormBody,
  SellerProductFormFlowProvider,
  SellerProductFormFooter,
} from '../ui/SellerProductFormBody';

/** Create / edit seller product. */
export default function SellerProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const productId = Number(id);
  const validEdit = isEdit && Number.isFinite(productId) && productId > 0;

  const { data: store } = useGetVendorStoreQuery();
  const productQuery = useGetVendorProductQuery(productId, { skip: !validEdit });

  const back = () => navigate(shopPaths.sellerProducts());
  const storeApproved = store?.status === 'approved';
  const storeStatusLabel = store?.statusLabel;

  const editLoading = validEdit && productQuery.isLoading;
  const editError = validEdit && (productQuery.isError || !productQuery.data);
  const ready = !validEdit || (!productQuery.isLoading && productQuery.data != null && !productQuery.isError);

  const title = validEdit ? 'Edit Product' : 'New Product';

  const dock = (
    <DockScreen
      title={title}
      subtitle="Name, Price and Media"
      onBack={back}
      footer={ready ? <SellerProductFormFooter /> : undefined}
    >
      {editLoading ? (
        <div className="flex flex-col gap-4 px-4 pt-4" aria-busy="true" aria-label="Loading Product">
          <FormFieldsSkeleton rows={5} />
          <div className="flex gap-2">
            <Skeleton className="h-16 w-16 rounded-panel" />
            <Skeleton className="h-16 w-16 rounded-panel" />
            <Skeleton className="h-16 w-16 rounded-panel" />
          </div>
          <Skeleton className="h-12 w-full rounded-field" />
        </div>
      ) : editError ? (
        <div className="px-4 py-8">
          <ErrorState title="Couldn’t Load Product" onRetry={() => void productQuery.refetch()} />
        </div>
      ) : (
        <SellerProductFormBody key={validEdit ? productId : 'new'} />
      )}
    </DockScreen>
  );

  if (ready) {
    return (
      <SellerProductFormFlowProvider
        storeApproved={storeApproved}
        storeStatusLabel={storeStatusLabel}
        product={validEdit ? productQuery.data : null}
      >
        {dock}
      </SellerProductFormFlowProvider>
    );
  }

  return dock;
}
