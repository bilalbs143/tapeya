import { Link } from 'react-router-dom';

import { PageDock, ScreenBar } from '@/shared/layout';
import { HScroll } from '@/shared/ui/HScroll';
import { SearchBar } from '@/shared/ui/SearchBar';
import { EmptyState, ErrorState, SKELETON, Skeleton } from '@/shared/ui/states';

import { shopPaths } from '../lib/shopPaths';
import { BrandRail } from './BrandRail';
import { CartLink } from './CartLink';
import { ProductCardSkeleton } from './ProductCard';
import { ProductGrid, ProductRail, ProductRailSkeleton } from './ProductGrid';
import { ShopSectionHeader } from './ShopSectionHeader';
import type { useShopHome } from './useShopHome';

type ShopHomeFlow = ReturnType<typeof useShopHome>;

type ShopHomeBodyProps = {
  flow: ShopHomeFlow;
};

const HOME_RAIL_SKELETONS = [
  { title: 'Most Popular', label: 'Loading Most Popular' },
  { title: 'Special Offer', label: 'Loading Special Offer' },
] as const;

/** ScreenBar + search + brands pinned; product rails/grid scroll. */
export function ShopHomeBody({ flow }: ShopHomeBodyProps) {
  const brandCount = SKELETON.brandRail;
  const productCount = SKELETON.productGrid;
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
    <PageDock
      header={
        <div className="bg-surface shrink-0">
          <ScreenBar title="Shop" subtitle="Gear and Kits" onBack={goBack} action={<CartLink />} />

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
                <HScroll className="gap-2" bleed={false} aria-busy="true" aria-label="Loading Brands">
                  {Array.from({ length: brandCount }, (_, i) => (
                    <span
                      key={i}
                      className="border-border-subtle bg-surface flex shrink-0 items-center gap-2 rounded-chip border py-1.5 pr-3 pl-1.5"
                      aria-hidden
                    >
                      <Skeleton className="h-7 w-7 shrink-0 rounded-icon" />
                      <Skeleton className="h-2.5 w-14" />
                    </span>
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
      }
    >
      <div className="flex flex-col gap-5 px-4 pt-3.5 pb-6">
        {searching ? (
          <>
            <ShopSectionHeader title={searchHeading} />
            {searchLoading ? (
              <div className="grid grid-cols-2 gap-3 tab:grid-cols-3" aria-busy="true" aria-label="Loading Products">
                {Array.from({ length: productCount }, (_, i) => (
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
          <div className="flex flex-col gap-5" aria-busy="true" aria-label="Loading Shop">
            {HOME_RAIL_SKELETONS.map((rail) => (
              <section key={rail.title} className="flex flex-col gap-3" aria-label={rail.label}>
                <ShopSectionHeader title={rail.title} action={<Skeleton className="h-3 w-14" />} />
                <ProductRailSkeleton />
              </section>
            ))}
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
    </PageDock>
  );
}
