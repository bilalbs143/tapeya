import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { NoImagePlaceholder } from '@/pages/vendor/NoImagePlaceholder';
import { SellerCategoryDialog } from '@/pages/vendor/SellerCategoryDialog';
import { useGetVendorCategoriesQuery, useGetVendorStoreQuery } from '@/store/api/vendorShopApi';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { ListEmpty, ListError } from '@/ui/ListState';
import { PageLoader } from '@/ui/Loader';

const editIcon = `${CLOUDFRONT_APP_BASE}/images/icons/team-edit-icon.svg`;

export default function SellerCategories() {
  const navigate = useNavigate();
  const { data: store } = useGetVendorStoreQuery();
  const { data: categoriesResponse, isLoading, isError, refetch } = useGetVendorCategoriesQuery({ all: true });
  const categories = categoriesResponse?.data ?? [];
  const canEdit = store?.status === 'approved';
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const openCreate = () => {
    setEditingCategory(null);
    setDialogOpen(true);
  };

  const openEdit = (category) => {
    setEditingCategory(category);
    setDialogOpen(true);
  };

  return (
    <div className="bg-black">
      <AppSubpageHeader
        sticky
        title="CATEGORIES"
        onBack={() => navigate('/seller')}
        right={
          canEdit ? (
            <button
              type="button"
              onClick={openCreate}
              className="bg-brand flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold text-black"
              aria-label="Add Category"
            >
              +
            </button>
          ) : undefined
        }
      />
      <Container className="pb-8">
        {!canEdit && store?.status ? (
          <p className="text-muted mb-4 text-[13px] leading-snug">
            Categories are read-only while your account is {store.status_label ?? store.status}.
          </p>
        ) : (
          <p className="text-muted mb-4 text-[13px] leading-snug md:text-[14px]">
            Add missing categories so they appear when you create products.
          </p>
        )}

        {isLoading ? (
          <PageLoader label="Loading categories" className="min-h-[30vh] py-12" />
        ) : isError ? (
          <ListError message="Could not load categories." onRetry={() => refetch()} />
        ) : categories.length === 0 ? (
          <ListEmpty
            title="No Categories Yet."
            action={
              canEdit ? (
                <Button type="button" variant="orange" onClick={openCreate}>
                  Add Category
                </Button>
              ) : null
            }
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {categories.map((category) => (
              <li key={category.id}>
                <div className="bg-surface flex w-full items-center gap-3 rounded-[17px] p-3">
                  <button
                    type="button"
                    onClick={() => openEdit(category)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left transition-opacity active:opacity-90"
                  >
                    <div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                      {category.image ? (
                        <img src={category.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <NoImagePlaceholder />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-bold text-white">{category.name}</p>
                      {category.parent?.name ? (
                        <p className="text-muted mt-0.5 truncate text-[11px]">{category.parent.name}</p>
                      ) : null}
                    </div>
                  </button>
                  {canEdit ? (
                    <button
                      type="button"
                      onClick={() => openEdit(category)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center transition-opacity active:opacity-80"
                      aria-label="Edit Category"
                    >
                      <img src={editIcon} alt="" className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Container>

      <SellerCategoryDialog open={dialogOpen} onOpenChange={setDialogOpen} category={editingCategory} canEdit={canEdit} />
    </div>
  );
}
