import { SearchBar } from '@/shared/ui/SearchBar';

import { ProductGrid } from './ProductGrid';
import type { useShopFilter } from './useShopFilter';

type ShopFilterFlow = ReturnType<typeof useShopFilter>;

type ShopFilterBodyProps = {
  flow: ShopFilterFlow;
};

/** Search for DockScreen `below` — page owns header. */
export function ShopFilterHeaderBelow({ flow }: ShopFilterBodyProps) {
  const { query, setQuery } = flow;

  return (
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
  );
}

/** Product grid — page owns DockScreen. */
export function ShopFilterBody({ flow }: ShopFilterBodyProps) {
  const { debounced, products, status, showFeatured, refetch } = flow;

  return (
    <div className="px-4 pb-6">
      <ProductGrid
        products={products}
        status={status}
        query={debounced}
        onRetry={() => void refetch()}
        showFeatured={showFeatured}
      />
    </div>
  );
}
