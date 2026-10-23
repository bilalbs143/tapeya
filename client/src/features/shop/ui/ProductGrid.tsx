import { Link } from 'react-router-dom';

import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { HScroll } from '@/shared/ui/HScroll';
import { EmptyState, ErrorState } from '@/shared/ui/states';

import { shopPaths } from '../lib/shopPaths';
import type { ShopProduct } from '../model/schemas';
import { ProductCard, ProductCardSkeleton } from './ProductCard';

type ProductGridProps = {
  products?: ShopProduct[] | undefined;
  status?: 'loading' | 'error' | 'ready' | undefined;
  query?: string | undefined;
  onRetry?: (() => void) | undefined;
  className?: string | undefined;
  showFeatured?: boolean | undefined;
};

export function ProductGrid({
  products = [],
  status = 'ready',
  query = '',
  onRetry,
  className,
  showFeatured = true,
}: ProductGridProps) {
  if (status === 'loading') {
    return (
      <div className={cn('grid grid-cols-2 gap-3 tab:grid-cols-3', className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <ErrorState
        className={className}
        title="Couldn't Load These Products"
        description="Your connection dropped partway through."
        onRetry={onRetry}
      />
    );
  }

  if (!products.length) {
    return query ? (
      <EmptyState
        size="lg"
        className={className}
        title="No Products Match Your Search"
        description={`Nothing came back for “${query}”. Try a shorter word.`}
      />
    ) : (
      <EmptyState
        size="md"
        className={className}
        title="No Products Yet"
        description="Nothing has been listed here. Check the featured rails on Shop Home in the meantime."
        action={
          <Button asChild variant="secondary">
            <Link to={shopPaths.home()}>Back to Shop</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className={cn('grid grid-cols-2 gap-3 tab:grid-cols-3', className)}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} showFeatured={showFeatured} />
      ))}
    </div>
  );
}

export function ProductRail({
  products = [],
  className,
}: {
  products?: ShopProduct[] | undefined;
  className?: string | undefined;
}) {
  if (!products.length) return null;

  return (
    <HScroll as="ul" className={cn('gap-3', className)}>
      {products.map((p) => (
        <li key={p.id} className="w-36 shrink-0">
          <ProductCard product={p} className="h-full" />
        </li>
      ))}
    </HScroll>
  );
}
