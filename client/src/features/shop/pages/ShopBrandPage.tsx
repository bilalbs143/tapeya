import { useParams } from 'react-router-dom';

import { PageDock, ScreenBar } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { EmptyState, ErrorState, SKELETON, Skeleton } from '@/shared/ui/states';

import { ProductCardSkeleton } from '../ui/ProductCard';
import { ShopBrandBody, ShopBrandHeaderBelow } from '../ui/ShopBrandBody';
import { useShopBrand } from '../ui/useShopBrand';

export default function ShopBrandPage() {
  const { slug } = useParams<{ slug: string }>();
  const brandSlug = slug?.trim() ?? '';
  const flow = useShopBrand(brandSlug);
  const { brand, brandsLoading, brandsError, refetchBrands, goHome } = flow;
  const productCount = SKELETON.productGrid;
  const ready = Boolean(brandSlug) && !brandsLoading && !brandsError && brand != null;

  const title = ready ? brand.name : !brandSlug || (!brandsLoading && !brand) ? 'Shop' : 'Brand';
  const subtitle = ready || (brandSlug && (brandsLoading || brandsError)) ? 'Products in This Brand' : 'Gear and Kits';

  return (
    <PageDock
      header={
        <div className="bg-surface shrink-0">
          <ScreenBar title={title} subtitle={subtitle} onBack={goHome} />
          {ready ? <ShopBrandHeaderBelow flow={flow} /> : null}
        </div>
      }
    >
      {!brandSlug ? (
        <EmptyState size="lg" title="Brand Not Found" description="That link is incomplete." />
      ) : brandsLoading ? (
        <div className="flex flex-col gap-3 px-4 pt-4">
          <Skeleton className="h-11 w-full rounded-panel" />
          <Skeleton className="h-8 w-full rounded-chip" />
          <div className="grid grid-cols-2 gap-3 tab:grid-cols-3" aria-busy="true" aria-label="Loading Products">
            {Array.from({ length: productCount }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : brandsError ? (
        <ErrorState page title="Couldn’t Load Brands" onRetry={() => void refetchBrands()} />
      ) : !brand ? (
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
      ) : (
        <ShopBrandBody flow={flow} />
      )}
    </PageDock>
  );
}
