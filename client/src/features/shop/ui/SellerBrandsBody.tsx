import { ScreenBar } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { IconButton } from '@/shared/ui/IconButton';
import { PlusIcon } from '@/shared/ui/icons';
import { EmptyState, ErrorState, ListRowSkeleton } from '@/shared/ui/states';

import { sellerBrandSlugLine, sellerBrandThumbInitials } from '../lib/sellerBrands';
import { SellerBrandDialog } from './SellerBrandDialog';
import type { useSellerBrands } from './useSellerBrands';

type SellerBrandsFlow = ReturnType<typeof useSellerBrands>;

type SellerBrandsBodyProps = {
  flow: SellerBrandsFlow;
};

/** Brand rows with add/edit dialog when approved. */
export function SellerBrandsBody({ flow }: SellerBrandsBodyProps) {
  const {
    canEdit,
    intro,
    brands,
    isLoading,
    isError,
    refetch,
    dialogOpen,
    setDialogOpen,
    editing,
    openCreate,
    openEdit,
    goSeller,
  } = flow;

  return (
    <div className="bg-surface flex min-h-full flex-col">
      <ScreenBar
        title="Brands"
        subtitle="Labels on Your Catalogue"
        onBack={goSeller}
        action={
          canEdit ? (
            <IconButton label="Add Brand" onClick={openCreate}>
              <PlusIcon className="h-4 w-4" strokeWidth={2.4} />
            </IconButton>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3 px-4 pt-3.5 pb-8">
        <p className="text-muted text-2xs leading-relaxed">{intro}</p>

        {isLoading ? (
          <ul
            className="border-border-subtle divide-border-subtle flex flex-col divide-y overflow-hidden rounded-card border"
            aria-busy="true"
            aria-label="Loading Brands"
          >
            {Array.from({ length: 4 }, (_, i) => (
              <li key={i}>
                <ListRowSkeleton thumbClassName="h-12 w-12 rounded-panel" trailing={false} />
              </li>
            ))}
          </ul>
        ) : null}

        {isError && !isLoading ? <ErrorState title="Couldn’t Load Brands" onRetry={() => void refetch()} /> : null}

        {!isLoading && !isError && brands.length === 0 ? (
          <EmptyState
            title="No Brands Yet"
            description="Brands group your products by maker. Buyers use brand chips on Shop to find them."
            action={
              canEdit ? (
                <Button type="button" onClick={openCreate}>
                  Add Brand
                </Button>
              ) : undefined
            }
          />
        ) : null}

        {!isLoading && !isError && brands.length > 0 ? (
          <ul className="border-border-subtle bg-surface divide-border-subtle flex flex-col divide-y overflow-hidden rounded-card border">
            {brands.map((brand) => {
              const slugLine = sellerBrandSlugLine(brand.slug);
              return (
                <li key={brand.id}>
                  <button
                    type="button"
                    onClick={() => openEdit(brand)}
                    className="hover:bg-surface-raised flex w-full items-center gap-3 p-3.5 text-left"
                  >
                    <span className="bg-surface-raised border-border-subtle flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-panel border">
                      {brand.logoUrl ? (
                        <img src={brand.logoUrl} alt="" className="h-full w-full object-contain p-1" />
                      ) : (
                        <span className="text-dim font-mono text-4xs font-bold">
                          {sellerBrandThumbInitials(brand.name)}
                        </span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-ink">{brand.name}</span>
                      {slugLine ? (
                        <span className="text-dim font-mono mt-0.5 block truncate text-3xs">{slugLine}</span>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      <SellerBrandDialog open={dialogOpen} onOpenChange={setDialogOpen} brand={editing} canEdit={canEdit} />
    </div>
  );
}
