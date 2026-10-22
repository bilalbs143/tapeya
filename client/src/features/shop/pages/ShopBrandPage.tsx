import { useParams } from 'react-router-dom';

import { ScreenBar } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { EmptyState, ErrorState, Skeleton } from '@/shared/ui/states';

import { ProductCardSkeleton } from '../ui/ProductCard';
import { ShopBrandBody } from '../ui/ShopBrandBody';
import { useShopBrand } from '../ui/useShopBrand';

export default function ShopBrandPage() {
  const { slug } = useParams<{ slug: string }>();
  const brandSlug = slug?.trim() ?? '';
  const flow = useShopBrand(brandSlug);
  const { brand, brandsLoading, brandsError, refetchBrands, goHome } = flow;

  if (!brandSlug) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        <ScreenBar title="Shop" subtitle="Gear and Kits" onBack={goHome} />
        <div className="px-4 py-8">
          <EmptyState title="Brand Not Found" description="That link is incomplete." />
        </div>
      </div>
    );
  }

  if (brandsLoading) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        <ScreenBar title="Brand" subtitle="Products in This Brand" onBack={goHome} />
        <div className="flex flex-col gap-3 px-4 pt-4">
          <Skeleton className="h-11 w-full rounded-panel" />
          <Skeleton className="h-8 w-full rounded-chip" />
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (brandsError) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        <ScreenBar title="Brand" subtitle="Products in This Brand" onBack={goHome} />
        <div className="px-4 py-8">
          <ErrorState title="Couldn’t Load Brands" onRetry={() => void refetchBrands()} />
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        <ScreenBar title="Shop" subtitle="Gear and Kits" onBack={goHome} />
        <div className="px-4 py-8">
          <EmptyState
            size="lg"
            title="That Brand Doesn’t Exist"
            description="It may have been closed or renamed. The Shop home page still has everything else."
            action={
              <Button variant="secondary" onClick={goHome}>
                Back to Shop
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return <ShopBrandBody flow={flow} />;
}
