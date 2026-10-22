import { ScreenBar } from '@/shared/layout';
import { SearchBar } from '@/shared/ui/SearchBar';

import { ProductGrid } from './ProductGrid';
import type { useShopFilter } from './useShopFilter';

type ShopFilterFlow = ReturnType<typeof useShopFilter>;

type ShopFilterBodyProps = {
  flow: ShopFilterFlow;
};

/** Search + product grid for a shop collection filter. */
export function ShopFilterBody({ flow }: ShopFilterBodyProps) {
  const { title, query, setQuery, debounced, products, status, showFeatured, refetch, goHome } = flow;

  return (
    <div className="bg-surface flex min-h-full flex-col">
      <div className="bg-surface sticky top-0 z-30 tab:static">
        <ScreenBar title="Shop" subtitle={title ?? 'Gear and Kits'} onBack={goHome} sticky={false} />
        <div className="flex flex-col gap-3 px-4 pt-3.5 pb-3">
          <SearchBar
            value={query}
            onValueChange={setQuery}
            placeholder="Search products, brands, stores"
            label="Search This Collection"
            size="md"
            className="w-full"
            inputClassName="h-11 rounded-panel"
          />
        </div>
      </div>

      <div className="px-4 pb-6">
        <ProductGrid
          products={products}
          status={status}
          query={debounced}
          onRetry={() => void refetch()}
          showFeatured={showFeatured}
        />
      </div>
    </div>
  );
}
