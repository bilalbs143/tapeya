import { Link } from 'react-router-dom';

import { ScreenBar } from '@/shared/layout';
import { HScroll } from '@/shared/ui/HScroll';
import { SearchBar } from '@/shared/ui/SearchBar';
import { EmptyState, ErrorState, Skeleton } from '@/shared/ui/states';

import { shopPaths } from '../lib/shopPaths';
import { BrandRail } from './BrandRail';
import { CartLink } from './CartLink';
import { ProductCardSkeleton } from './ProductCard';
import { ProductGrid, ProductRail } from './ProductGrid';
import { ShopSectionHeader } from './ShopSectionHeader';
import type { useShopHome } from './useShopHome';

type ShopHomeFlow = ReturnType<typeof useShopHome>;

type ShopHomeBodyProps = {
  flow: ShopHomeFlow;
};

/** Sticky search + brands; search grid or popular/offer rails. */
export function ShopHomeBody({ flow }: ShopHomeBodyProps) {
  const {
    query,
    setQuery,
    debounced,
    searching,
    searchResults,
    searchLoading,
    searchError,
    refetchSearch,
    searchHeading,
    popular,
    offers,
    brands,
    brandsLoading,
    brandsError,
    refetchBrands,
    railsLoading,
    railsError,
    bare,
    goBack,
    retryRails,
  } = flow;

  return (
    <div className="bg-surface flex min-h-full flex-col">
      <div className="bg-surface sticky top-0 z-20 tab:static">
        <ScreenBar title="Shop" subtitle="Gear and Kits" onBack={goBack} sticky={false} action={<CartLink />} />

        <div className="px-4 pt-3.5">
          <SearchBar
            value={query}
            onValueChange={setQuery}
            placeholder="Search products, brands, stores"
            label="Search the Shop"
            size="md"
            className="w-full"
            inputClassName="h-11 rounded-panel"
          />
        </div>

        {!searching ? (
          <div className="pt-3 pb-2.5">
            {brandsLoading ? (
              <HScroll className="gap-2.5" bleed={false}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-14 w-14 shrink-0 rounded-full" />
                ))}
              </HScroll>
            ) : brandsError ? (
              <div className="px-4">
                <ErrorState
                  title="Couldn't Load Brands"
                  description="Try again in a moment."
                  onRetry={() => void refetchBrands()}
                />
              </div>
            ) : brands.length ? (
              <BrandRail brands={brands} bleed={false} />
            ) : null}
          </div>
        ) : (
          <div className="h-2.5" />
        )}
      </div>

      <div className="flex flex-col gap-5 px-4 pt-3.5 pb-6">
        {searching ? (
          <>
            <ShopSectionHeader title={searchHeading} />
            {searchLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : searchError ? (
              <ErrorState
                title="Couldn't Load Products"
                description="Try again in a moment."
                onRetry={() => void refetchSearch()}
              />
            ) : (
              <ProductGrid products={searchResults} query={debounced} />
            )}
          </>
        ) : railsLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-4 w-32" />
            <HScroll className="gap-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-48 w-36 shrink-0 rounded-card" />
              ))}
            </HScroll>
          </div>
        ) : railsError ? (
          <ErrorState title="Couldn't Load the Shop" description="Featured rails didn't answer." onRetry={retryRails} />
        ) : bare ? (
          <EmptyState
            className="py-16"
            title="No Products Yet"
            description="The catalogue is empty. Featured rails will appear here as sellers list their gear."
          />
        ) : (
          <>
            {popular.length ? (
              <section className="flex flex-col gap-3">
                <ShopSectionHeader
                  title="Most Popular"
                  action={
                    <Link to={shopPaths.filter('popular')} className="text-brand-text text-2xs font-bold">
                      View More
                    </Link>
                  }
                />
                <ProductRail products={popular} />
              </section>
            ) : null}

            {offers.length ? (
              <section className="flex flex-col gap-3">
                <ShopSectionHeader
                  title="Special Offer"
                  action={
                    <Link to={shopPaths.filter('special-offer')} className="text-brand-text text-2xs font-bold">
                      View More
                    </Link>
                  }
                />
                <ProductRail products={offers} />
              </section>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
