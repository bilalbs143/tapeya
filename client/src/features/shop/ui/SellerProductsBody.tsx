import { Link } from 'react-router-dom';

import { PageDock, ScreenBar } from '@/shared/layout';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { IconButton } from '@/shared/ui/IconButton';
import { PlusIcon } from '@/shared/ui/icons';
import { Input } from '@/shared/ui/Input';
import { EmptyState, ErrorState, ListRowSkeleton } from '@/shared/ui/states';

import { sellerProductThumbInitials } from '../lib/sellerProducts';
import { shopPaths } from '../lib/shopPaths';
import type { useSellerProducts } from './useSellerProducts';

type SellerProductsFlow = ReturnType<typeof useSellerProducts>;

type SellerProductsBodyProps = {
  flow: SellerProductsFlow;
};

/** Searchable product rows with add CTA when approved. */
export function SellerProductsBody({ flow }: SellerProductsBodyProps) {
  const {
    canEdit,
    intro,
    query,
    setQuery,
    products,
    filtered,
    noMatchDescription,
    isLoading,
    isError,
    refetch,
    goSeller,
  } = flow;

  return (
    <PageDock
      header={
        <ScreenBar
          title="Products"
          subtitle="Catalogue for Your Store"
          onBack={goSeller}
          action={
            canEdit ? (
              <IconButton label="Add Product" asChild>
                <Link to={shopPaths.sellerProductNew()}>
                  <PlusIcon className="h-4 w-4" strokeWidth={2.4} />
                </Link>
              </IconButton>
            ) : undefined
          }
        />
      }
    >
      <div className="flex flex-col gap-5 px-4 pt-3.5 pb-8">
        <p className="text-muted text-2xs leading-relaxed">{intro}</p>

        {products.length > 0 ? (
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Your Products"
            className="h-11 rounded-field"
          />
        ) : null}

        {isLoading ? (
          <ul
            className="border-border-subtle divide-border-subtle flex flex-col divide-y overflow-hidden rounded-card border"
            aria-busy="true"
            aria-label="Loading Products"
          >
            {Array.from({ length: 4 }, (_, i) => (
              <li key={i}>
                <ListRowSkeleton />
              </li>
            ))}
          </ul>
        ) : null}

        {isError && !isLoading ? <ErrorState title="Couldn’t Load Products" onRetry={() => void refetch()} /> : null}

        {!isLoading && !isError && products.length === 0 ? (
          <EmptyState
            title="No Products Yet"
            description="A product needs a name, price, photo and stock — about two minutes."
            action={
              canEdit ? (
                <Button asChild>
                  <Link to={shopPaths.sellerProductNew()}>Create Product</Link>
                </Button>
              ) : undefined
            }
          />
        ) : null}

        {!isLoading && !isError && products.length > 0 && filtered.length === 0 ? (
          <EmptyState title="No Products Match" description={noMatchDescription} />
        ) : null}

        {!isLoading && !isError && filtered.length > 0 ? (
          <ul className="border-border-subtle bg-surface divide-border-subtle flex flex-col divide-y overflow-hidden rounded-card border">
            {filtered.map((p) => (
              <li key={p.id}>
                <Link
                  to={shopPaths.sellerProductEdit(p.id)}
                  className="hover:bg-surface-raised flex items-center gap-3 p-3.5"
                >
                  <span className="bg-surface-raised border-border-subtle flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-panel border">
                    {p.imageUrls[0] ? (
                      <img src={p.imageUrls[0]} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-dim font-mono text-4xs font-bold">
                        {sellerProductThumbInitials(p.name)}
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 block text-xs font-bold text-ink">{p.name}</span>
                    <span className="font-mono text-brand-text mt-1 block text-xs font-bold tabular-nums">
                      {p.priceLabel}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1.5">
                    <Badge variant={p.isActive ? 'positive' : 'neutral'}>{p.isActive ? 'Active' : 'Inactive'}</Badge>
                    <span className="text-dim text-3xs tabular-nums">Stock: {p.stock}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </PageDock>
  );
}
