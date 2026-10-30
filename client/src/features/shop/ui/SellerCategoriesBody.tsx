import { PageDock, ScreenBar } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { IconButton } from '@/shared/ui/IconButton';
import { PlusIcon } from '@/shared/ui/icons';
import { EmptyState, ErrorState, ListRowSkeleton } from '@/shared/ui/states';

import { sellerCategoryRowMeta, sellerCategoryThumbInitials } from '../lib/sellerCategories';
import { SellerCategoryDialog } from './SellerCategoryDialog';
import type { useSellerCategories } from './useSellerCategories';

type SellerCategoriesFlow = ReturnType<typeof useSellerCategories>;

type SellerCategoriesBodyProps = {
  flow: SellerCategoriesFlow;
};

/** Category rows with add/edit dialog when approved. */
export function SellerCategoriesBody({ flow }: SellerCategoriesBodyProps) {
  const {
    canEdit,
    intro,
    categories,
    nameById,
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
    <PageDock
      header={
        <ScreenBar
          title="Categories"
          subtitle="Shelves for Your Products"
          onBack={goSeller}
          action={
            canEdit ? (
              <IconButton label="Add Category" onClick={openCreate}>
                <PlusIcon className="h-4 w-4" strokeWidth={2.4} />
              </IconButton>
            ) : undefined
          }
        />
      }
    >
      <div className="flex flex-col gap-3 px-4 pt-3.5 pb-8">
        <p className="text-muted text-2xs leading-relaxed">{intro}</p>

        {isLoading ? (
          <ul
            className="border-border-subtle bg-surface divide-border-subtle flex flex-col divide-y overflow-hidden rounded-card border"
            aria-busy="true"
            aria-label="Loading Categories"
          >
            {Array.from({ length: 6 }, (_, i) => (
              <li key={i}>
                <ListRowSkeleton thumbClassName="h-12 w-12 rounded-panel" trailing={false} />
              </li>
            ))}
          </ul>
        ) : null}

        {isError && !isLoading ? <ErrorState title="Couldn’t Load Categories" onRetry={() => void refetch()} /> : null}

        {!isLoading && !isError && categories.length === 0 ? (
          <EmptyState
            title="No Categories Yet"
            description="Categories are what buyers filter by on Shop."
            action={
              canEdit ? (
                <Button type="button" onClick={openCreate}>
                  Add Category
                </Button>
              ) : undefined
            }
          />
        ) : null}

        {!isLoading && !isError && categories.length > 0 ? (
          <ul className="border-border-subtle bg-surface divide-border-subtle flex flex-col divide-y overflow-hidden rounded-card border">
            {categories.map((category) => {
              const parentName = category.parentId != null ? nameById.get(category.parentId) : null;
              return (
                <li key={category.id}>
                  <button
                    type="button"
                    onClick={() => openEdit(category)}
                    className="hover:bg-surface-raised flex w-full items-center gap-3 p-3.5 text-left"
                  >
                    <span className="bg-surface-raised border-border-subtle flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-panel border">
                      {category.imageUrl ? (
                        <img src={category.imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-dim font-mono text-4xs font-bold">
                          {sellerCategoryThumbInitials(category.name)}
                        </span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-ink">{category.name}</span>
                      <span className="text-dim mt-0.5 block truncate text-3xs">
                        {sellerCategoryRowMeta(parentName, category.slug)}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      <SellerCategoryDialog open={dialogOpen} onOpenChange={setDialogOpen} category={editing} canEdit={canEdit} />
    </PageDock>
  );
}
