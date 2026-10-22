import { ScreenBar } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { EmptyState, Skeleton } from '@/shared/ui/states';

import { ProductCardSkeleton } from './ProductCard';

type ShopSlugBodyProps = {
  mode: 'loading' | 'not-found';
  description?: string | undefined;
  emptySize?: 'lg' | undefined;
  onBack: () => void;
};

/** Loading skeleton or not-found empty for unresolved `/shop/:slug`. */
export function ShopSlugBody({ mode, description, emptySize, onBack }: ShopSlugBodyProps) {
  return (
    <div className="bg-surface flex min-h-full flex-col">
      <ScreenBar title="Shop" subtitle="Gear and Kits" onBack={onBack} />

      {mode === 'loading' ? (
        <div className="flex flex-col gap-3 px-4 pt-4" aria-busy="true" aria-label="Loading Shop Page">
          <Skeleton className="h-24 w-full rounded-card" />
          <Skeleton className="h-11 w-full rounded-panel" />
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 py-8">
          <EmptyState
            size={emptySize}
            title="Page Not Found"
            description={description ?? 'That shop link isn’t valid.'}
            action={
              <Button variant="secondary" onClick={onBack}>
                Back to Shop
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}
