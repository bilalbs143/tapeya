import { ScreenBar } from '@/shared/layout';
import { SearchBar } from '@/shared/ui/SearchBar';

import { CategoryChips } from './CategoryChips';
import { ProductGrid } from './ProductGrid';
import type { useShopVendor } from './useShopVendor';

type ShopVendorFlow = ReturnType<typeof useShopVendor>;

type ShopVendorBodyProps = {
  flow: ShopVendorFlow;
};

/** Store blurb, search, category chips, and product grid. */
export function ShopVendorBody({ flow }: ShopVendorBodyProps) {
  const {
    vendor,
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

  if (!vendor) return null;

  return (
    <div className="bg-surface flex min-h-full flex-col">
      <ScreenBar title="Store" subtitle={vendor.storeName} onBack={goHome} />

      <div className="flex flex-col gap-3 px-4 pt-3.5 pb-6">
        {vendor.description ? (
          <section className="border-border-subtle bg-surface rounded-card border p-3.5">
            <p className="text-2xs leading-relaxed text-body">{vendor.description}</p>
          </section>
        ) : null}

        <SearchBar
          value={query}
          onValueChange={setQuery}
          placeholder="Search products, brands, stores"
          label="Search This Store"
          size="md"
          className="w-full"
          inputClassName="h-11 rounded-panel"
        />
        <CategoryChips categories={chipCategories} value={categoryId} onChange={setCategoryId} />

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
