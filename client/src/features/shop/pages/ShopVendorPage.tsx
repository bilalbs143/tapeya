import { useParams } from 'react-router-dom';

import { DockScreen } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { EmptyState, Skeleton } from '@/shared/ui/states';

import { ProductCardSkeleton } from '../ui/ProductCard';
import { ShopVendorBody } from '../ui/ShopVendorBody';
import { useShopVendor } from '../ui/useShopVendor';

export default function ShopVendorPage() {
  const { slug } = useParams<{ slug: string }>();
  const vendorSlug = slug?.trim() ?? '';
  const flow = useShopVendor(vendorSlug);
  const { vendor, vendorLoading, vendorError, goHome, onMissingStoreAction } = flow;
  const ready = Boolean(vendorSlug) && !vendorLoading && !vendorError && vendor != null;

  return (
    <DockScreen title="Store" subtitle={ready ? vendor.storeName : 'Seller Catalogue'} onBack={goHome}>
      {!vendorSlug ? (
        <div className="px-4 py-8">
          <EmptyState title="Store Not Found" description="That link is incomplete." />
        </div>
      ) : vendorLoading && !vendor ? (
        <div className="flex flex-col gap-3 px-4 pt-4">
          <Skeleton className="h-24 w-full rounded-card" />
          <Skeleton className="h-11 w-full rounded-panel" />
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : vendorError || !vendor ? (
        <div className="px-4 py-8">
          <EmptyState
            size="lg"
            title="That Store Doesn’t Exist"
            description="It may have been closed or renamed. The Shop home page still has everything else."
            action={
              <Button variant="secondary" onClick={onMissingStoreAction}>
                {vendorError ? 'Try Again' : 'Back to Shop'}
              </Button>
            }
          />
        </div>
      ) : (
        <ShopVendorBody flow={flow} />
      )}
    </DockScreen>
  );
}
