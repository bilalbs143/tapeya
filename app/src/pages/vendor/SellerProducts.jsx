import { Link, useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { formatPrice } from '@/lib/format';
import { NoImagePlaceholder } from '@/pages/vendor/NoImagePlaceholder';
import { useGetVendorProductsQuery, useGetVendorStoreQuery } from '@/store/api/vendorShopApi';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { ListEmpty, ListError } from '@/ui/ListState';
import { PageLoader } from '@/ui/Loader';
import { StatusPill } from '@/ui/StatusPill';

export default function SellerProducts() {
  const navigate = useNavigate();
  const { data: store } = useGetVendorStoreQuery();
  const { data: productsResponse, isLoading, isError, refetch } = useGetVendorProductsQuery({ all: true });
  const products = productsResponse?.data ?? [];
  const canEdit = store?.status === 'approved';

  return (
    <div className="bg-black">
      <AppSubpageHeader
        sticky
        title="PRODUCTS"
        onBack={() => navigate('/seller')}
        right={
          canEdit ? (
            <Link
              to="/seller/products/new"
              className="bg-brand flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold text-black"
              aria-label="Add Product"
            >
              +
            </Link>
          ) : undefined
        }
      />
      <Container className="pb-8">
        {!canEdit && store?.status ? (
          <p className="text-muted mb-4 text-[13px] leading-snug">
            Catalog is read-only while your account is {store.status_label ?? store.status}.
          </p>
        ) : (
          <p className="text-muted mb-4 text-[13px] leading-snug md:text-[14px]">
            Manage your catalog. Active products are sellable in the shop.
          </p>
        )}

        {isLoading ? (
          <PageLoader label="Loading products" className="min-h-[30vh] py-12" />
        ) : isError ? (
          <ListError message="Could not load products." onRetry={() => refetch()} />
        ) : products.length === 0 ? (
          <ListEmpty
            title="No Products Yet."
            action={
              canEdit ? (
                <Button asChild variant="orange">
                  <Link to="/seller/products/new">Create Product</Link>
                </Button>
              ) : null
            }
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {products.map((product) => {
              const imageUrl = product.images?.[0]?.path ?? product.images?.[0]?.url;
              return (
                <li key={product.id}>
                  <Link
                    to={`/seller/products/${product.id}/edit`}
                    className="bg-surface flex items-center gap-3 rounded-[17px] p-3 transition-opacity active:opacity-90"
                  >
                    <div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                      {imageUrl ? (
                        <img src={imageUrl} alt="" className="h-full w-full object-contain p-1" />
                      ) : (
                        <NoImagePlaceholder />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[13px] font-bold text-white">{product.name}</p>
                      <p className="text-brand mt-1 text-[14px] font-bold">{formatPrice(product.price)}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <StatusPill
                        tone={product.is_active ? 'success' : 'muted'}
                        size="sm"
                        label={product.is_active ? 'Active' : 'Inactive'}
                      />
                      <p className="text-muted text-[11px]">Stock: {product.stock_quantity ?? 0}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </div>
  );
}
