import { ScreenBar } from '@/shared/layout';
import { SearchBar } from '@/shared/ui/SearchBar';

import { CategoryChips } from './CategoryChips';
import { ProductGrid } from './ProductGrid';
import type { useShopBrand } from './useShopBrand';

type ShopBrandFlow = ReturnType<typeof useShopBrand>;

type ShopBrandBodyProps = {
  flow: ShopBrandFlow;
};

/** Sticky search + chips, then product grid for a brand. */
export function ShopBrandBody({ flow }: ShopBrandBodyProps) {
  const {
    brand,
    query,
    setQuery,
    debounced,
    categoryId,
    setCategoryId,
    products,
    chipCategories,
    gridStatus,
    refetchProducts,
    goHome,
  } = flow;

  if (!brand) return null;

  return (
    <div className="bg-surface flex min-h-full flex-col">
      <div className="bg-surface sticky top-0 z-30 tab:static">
        <ScreenBar title={brand.name} subtitle="Products in This Brand" onBack={goHome} sticky={false} />
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
      </div>

      <div className="px-4 pb-6">
        <ProductGrid
          products={products}
          status={gridStatus}
          query={debounced}
          onRetry={() => void refetchProducts()}
          showFeatured
        />
      </div>
    </div>
  );
}
