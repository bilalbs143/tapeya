import { useParams } from 'react-router-dom';

import { DockScreen } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { EmptyState, ErrorState, Skeleton } from '@/shared/ui/states';

import { ProductCardSkeleton } from '../ui/ProductCard';
import { ShopBrandBody, ShopBrandHeaderBelow } from '../ui/ShopBrandBody';
import { useShopBrand } from '../ui/useShopBrand';

export default function ShopBrandPage() {
  const { slug } = useParams<{ slug: string }>();
  const brandSlug = slug?.trim() ?? '';
  const flow = useShopBrand(brandSlug);
  const { brand, brandsLoading, brandsError, refetchBrands, goHome } = flow;
  const ready = Boolean(brandSlug) && !brandsLoading && !brandsError && brand != null;

  const title = ready ? brand.name : !brandSlug || (!brandsLoading && !brand) ? 'Shop' : 'Brand';
  const subtitle = ready || (brandSlug && (brandsLoading || brandsError)) ? 'Products in This Brand' : 'Gear and Kits';

  return (
    <DockScreen
      title={title}
      subtitle={subtitle}
      onBack={goHome}
      below={ready ? <ShopBrandHeaderBelow flow={flow} /> : undefined}
    >
      {!brandSlug ? (
        <div className="px-4 py-8">
          <EmptyState title="Brand Not Found" description="That link is incomplete." />
        </div>
      ) : brandsLoading ? (
        <div className="flex flex-col gap-3 px-4 pt-4">
          <Skeleton className="h-11 w-full rounded-panel" />
          <Skeleton className="h-8 w-full rounded-chip" />
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : brandsError ? (
        <div className="px-4 py-8">
          <ErrorState title="Couldn’t Load Brands" onRetry={() => void refetchBrands()} />
        </div>
      ) : !brand ? (
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
      ) : (
        <ShopBrandBody flow={flow} />
      )}
    </DockScreen>
  );
}
