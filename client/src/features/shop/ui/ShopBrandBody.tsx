import { SearchBar } from '@/shared/ui/SearchBar';

import { CategoryChips } from './CategoryChips';
import { ProductGrid } from './ProductGrid';
import type { useShopBrand } from './useShopBrand';

type ShopBrandFlow = ReturnType<typeof useShopBrand>;

type ShopBrandBodyProps = {
  flow: ShopBrandFlow;
};

/** Search + category chips for DockScreen `below` — page owns header. */
export function ShopBrandHeaderBelow({ flow }: ShopBrandBodyProps) {
  const { query, setQuery, categoryId, setCategoryId, chipCategories } = flow;

  return (
    <div className="flex flex-col gap-3 px-4 pt-3.5 pb-3">
      <SearchBar
        value={query}
        onValueChange={setQuery}
        placeholder="Search products, brands, stores"
        label="Search This Brand"
        size="md"
        className="w-full"
        inputClassName="h-11 rounded-panel"
      />
      <CategoryChips categories={chipCategories} value={categoryId} onChange={setCategoryId} />
    </div>
  );
}

/** Product grid — page owns DockScreen. */
export function ShopBrandBody({ flow }: ShopBrandBodyProps) {
  const { brand, debounced, products, gridStatus, refetchProducts } = flow;

  if (!brand) return null;

  return (
    <div className="px-4 pb-6">
      <ProductGrid
        products={products}
        status={gridStatus}
        query={debounced}
        onRetry={() => void refetchProducts()}
        showFeatured
      />
    </div>
  );
}
