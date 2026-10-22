import { useNavigate, useParams } from 'react-router-dom';

import { ScreenBar } from '@/shared/layout';
import { ErrorState, FormFieldsSkeleton, Skeleton } from '@/shared/ui/states';

import { useGetVendorProductQuery, useGetVendorStoreQuery } from '../api/vendorShopApi';
import { shopPaths } from '../lib/shopPaths';
import { SellerProductFormBody } from '../ui/SellerProductFormBody';

/** Create / edit seller product. */
export default function SellerProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const productId = Number(id);
  const validEdit = isEdit && Number.isFinite(productId) && productId > 0;

  const { data: store } = useGetVendorStoreQuery();
  const productQuery = useGetVendorProductQuery(productId, { skip: !validEdit });

  if (validEdit && productQuery.isLoading) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        <ScreenBar
          title="Edit Product"
          subtitle="Name, Price and Media"
          onBack={() => navigate(shopPaths.sellerProducts())}
        />
        <div className="flex flex-col gap-4 px-4 pt-4" aria-busy="true" aria-label="Loading Product">
          <FormFieldsSkeleton rows={5} />
          <div className="flex gap-2">
            <Skeleton className="h-16 w-16 rounded-panel" />
            <Skeleton className="h-16 w-16 rounded-panel" />
            <Skeleton className="h-16 w-16 rounded-panel" />
          </div>
          <Skeleton className="h-12 w-full rounded-field" />
        </div>
      </div>
    );
  }

  if (validEdit && (productQuery.isError || !productQuery.data)) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        <ScreenBar
          title="Edit Product"
          subtitle="Name, Price and Media"
          onBack={() => navigate(shopPaths.sellerProducts())}
        />
        <div className="px-4 py-8">
          <ErrorState title="Couldn’t Load Product" onRetry={() => void productQuery.refetch()} />
        </div>
      </div>
    );
  }

  return (
    <SellerProductFormBody
      key={validEdit ? productId : 'new'}
      storeApproved={store?.status === 'approved'}
      storeStatusLabel={store?.statusLabel}
      product={validEdit ? productQuery.data : null}
    />
  );
}
