import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { NoImagePlaceholder } from '@/pages/vendor/NoImagePlaceholder';
import { SellerBrandDialog } from '@/pages/vendor/SellerBrandDialog';
import { useGetVendorBrandsQuery, useGetVendorStoreQuery } from '@/store/api/vendorShopApi';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { ListEmpty, ListError } from '@/ui/ListState';
import { PageLoader } from '@/ui/Loader';

const editIcon = `${CLOUDFRONT_APP_BASE}/images/icons/team-edit-icon.svg`;

export default function SellerBrands() {
  const navigate = useNavigate();
  const { data: store } = useGetVendorStoreQuery();
  const { data: brandsResponse, isLoading, isError, refetch } = useGetVendorBrandsQuery({ all: true });
  const brands = brandsResponse?.data ?? [];
  const canEdit = store?.status === 'approved';
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  const openCreate = () => {
    setEditingBrand(null);
    setDialogOpen(true);
  };

  const openEdit = (brand) => {
    setEditingBrand(brand);
    setDialogOpen(true);
  };

  return (
    <div className="bg-black">
      <AppSubpageHeader
        sticky
        title="BRANDS"
        onBack={() => navigate('/seller')}
        right={
          canEdit ? (
            <button
              type="button"
              onClick={openCreate}
              className="bg-brand flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold text-black"
              aria-label="Add Brand"
            >
              +
            </button>
          ) : undefined
        }
      />
      <Container className="pb-8">
        {!canEdit && store?.status ? (
          <p className="text-muted mb-4 text-[13px] leading-snug">
            Brands are read-only while your account is {store.status_label ?? store.status}.
          </p>
        ) : (
          <p className="text-muted mb-4 text-[13px] leading-snug md:text-[14px]">
            Add missing brands so they appear when you create products.
          </p>
        )}

        {isLoading ? (
          <PageLoader label="Loading brands" className="min-h-[30vh] py-12" />
        ) : isError ? (
          <ListError message="Could not load brands." onRetry={() => refetch()} />
        ) : brands.length === 0 ? (
          <ListEmpty
            title="No Brands Yet."
            action={
              canEdit ? (
                <Button type="button" variant="orange" onClick={openCreate}>
                  Add Brand
                </Button>
              ) : null
            }
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {brands.map((brand) => (
              <li key={brand.id}>
                <div className="bg-surface flex w-full items-center gap-3 rounded-[17px] p-3">
                  <button
                    type="button"
                    onClick={() => openEdit(brand)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left transition-opacity active:opacity-90"
                  >
                    <div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                      {brand.logo ? (
                        <img src={brand.logo} alt="" className="h-full w-full object-contain p-1" />
                      ) : (
                        <NoImagePlaceholder />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-bold text-white">{brand.name}</p>
                    </div>
                  </button>
                  {canEdit ? (
                    <button
                      type="button"
                      onClick={() => openEdit(brand)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center transition-opacity active:opacity-80"
                      aria-label="Edit Brand"
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

      <SellerBrandDialog open={dialogOpen} onOpenChange={setDialogOpen} brand={editingBrand} canEdit={canEdit} />
    </div>
  );
}
