import { Link, useParams, useSearchParams } from 'react-router-dom';

import { ScreenBar } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { EmptyState, ErrorState, Skeleton } from '@/shared/ui/states';

import { shopPaths } from '../lib/shopPaths';
import { CartLink } from '../ui/CartLink';
import { ProductDetailBody } from '../ui/ProductDetailBody';
import { useProductDetail } from '../ui/useProductDetail';

/** Product detail — /shop/products/:slug (API resolves by slug, optional ?vendor=). */

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const productSlug = slug?.trim() ?? '';
  const vendor = searchParams.get('vendor')?.trim() || undefined;

  const flow = useProductDetail(productSlug, vendor);
  const { product, isLoading, isError, refetch, barSubtitle, goBack, goHome } = flow;

  if (!productSlug) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        <ScreenBar title="Shop" subtitle="Gear and Kits" onBack={goHome} />
        <div className="px-4 py-8">
          <EmptyState title="This Product Is Gone" description="The link is wrong." />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        <ScreenBar title="Shop" subtitle="Gear and Kits" onBack={goBack} action={<CartLink />} />
        <Skeleton className="h-64 w-full" />
        <div className="flex flex-col gap-3 px-4 pt-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-5 w-1/3" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        <ScreenBar title="Shop" subtitle="Gear and Kits" onBack={goHome} action={<CartLink />} />
        <div className="flex flex-col items-center gap-4 px-4 py-8">
          <ErrorState
            title="This Product Is Gone"
            description="It was delisted or the link is wrong."
            onRetry={() => void refetch()}
          />
          <Button asChild variant="secondary">
            <Link to={shopPaths.home()}>Back to Shop</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface flex min-h-full flex-col">
      <ScreenBar title="Shop" subtitle={barSubtitle} onBack={goBack} action={<CartLink />} />
      <ProductDetailBody flow={flow} />
    </div>
  );
}
