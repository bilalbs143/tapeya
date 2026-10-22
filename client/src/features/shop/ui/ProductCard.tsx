import { Link } from 'react-router-dom';

import { cn } from '@/shared/lib/cn';
import { Skeleton } from '@/shared/ui/states';

import { shopPaths } from '../lib/shopPaths';
import type { ShopProduct } from '../model/schemas';

type ProductCardProps = {
  product: ShopProduct;
  className?: string | undefined;
  showFeatured?: boolean | undefined;
};

export function ProductCard({ product, className, showFeatured = true }: ProductCardProps) {
  const off = product.discountPercent;
  const showFeaturedBadge = showFeatured && product.isFeatured;
  const thumb = product.imageUrls[0];

  return (
    <Link
      to={shopPaths.product(product)}
      className={cn(
        'border-border-subtle bg-surface focus-visible:outline-brand group flex flex-col overflow-hidden rounded-card border hover:border-border focus-visible:outline-2',
        className
      )}
    >
      <span className="bg-surface-raised relative block aspect-square overflow-hidden">
        {thumb ? (
          <img
            src={thumb}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : null}

        {showFeaturedBadge || off ? (
          <span className="absolute top-2 left-2 flex flex-col items-start gap-1">
            {showFeaturedBadge ? (
              <span className="bg-brand font-mono rounded-chip px-1.5 py-1 text-4xs font-bold tracking-[.1em] text-white uppercase">
                Featured
              </span>
            ) : null}
            {off ? (
              <span className="bg-danger font-mono rounded-chip px-1.5 py-1 text-4xs font-bold tracking-[.1em] text-white">
                −{off}%
              </span>
            ) : null}
          </span>
        ) : null}

        {product.outOfStock ? (
          <span className="bg-veil-scrim absolute inset-0 grid place-items-center">
            <span className="font-mono text-3xs font-bold tracking-eyebrow text-white uppercase">Out of Stock</span>
          </span>
        ) : null}
      </span>

      <span className="flex flex-1 flex-col gap-1.5 p-3">
        <span className="line-clamp-2 text-body-sm leading-snug font-bold text-ink">{product.name}</span>
        <span className="text-dim truncate text-3xs">Sold by {product.vendor?.storeName ?? 'Store'}</span>
        <span className="mt-auto flex items-baseline gap-1.5 pt-1">
          <span className="font-mono text-sm leading-normal font-extrabold text-ink tabular-nums">
            {product.priceLabel}
          </span>
          {product.compareAtLabel ? (
            <span className="text-dim font-mono text-3xs leading-normal line-through tabular-nums">
              {product.compareAtLabel}
            </span>
          ) : null}
        </span>
      </span>
    </Link>
  );
}

export function ProductCardSkeleton({ className }: { className?: string | undefined }) {
  return (
    <div className={cn('border-border-subtle bg-surface overflow-hidden rounded-card border', className)} aria-hidden>
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="flex flex-col gap-2 p-3">
        <Skeleton className="h-3 w-[85%]" />
        <Skeleton className="h-2.5 w-[55%]" />
        <Skeleton className="mt-1 h-3.5 w-[40%]" />
      </div>
    </div>
  );
}
