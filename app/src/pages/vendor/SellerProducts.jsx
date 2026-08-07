import { Link, useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { formatPrice } from '@/lib/format';
import { useGetVendorProductsQuery, useGetVendorStoreQuery } from '@/store/api/vendorShopApi';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';

function StatusPill({ isActive }) {
  const active = !!isActive;
  const style = active ? 'border border-[#34C759] text-[#34C759]' : 'border border-[#6B7280] text-[#6B7280]';
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-[11px] font-bold tracking-wide uppercase ${style}`}>
      {active ? 'ACTIVE' : 'INACTIVE'}
    </span>
  );
}

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
          <div className="flex min-h-[30vh] items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white/70" />
          </div>
        ) : isError ? (
          <div className="flex min-h-[30vh] flex-col items-center justify-center gap-4 py-12">
            <p className="text-muted text-[14px]">Could not load products. Please try again.</p>
            <Button type="button" variant="orange" className="px-6 py-2.5 text-[14px]" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-surface flex min-h-[30vh] flex-col items-center justify-center gap-4 rounded-[17px] px-4 py-10">
            <p className="text-muted text-center text-[14px]">No Products Yet.</p>
            {canEdit ? (
              <Button asChild variant="orange" className="px-6 py-2.5 text-[14px]">
                <Link to="/seller/products/new">Create Product</Link>
              </Button>
            ) : null}
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {products.map((product) => {
              const imageUrl = product.images?.[0]?.path ?? product.images?.[0]?.url;
              return (
                <li key={product.id}>
                  <Link
                    to={`/seller/products/${product.id}/edit`}
                    className="bg-surface flex gap-3 rounded-[17px] p-3 transition-opacity active:opacity-90"
                  >
                    <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                      {imageUrl ? (
                        <img src={imageUrl} alt="" className="h-full w-full object-contain p-1" />
                      ) : (
                        <div className="bg-surface-deep h-full w-full" aria-hidden />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <StatusPill isActive={product.is_active} />
                      </div>
                      <p className="line-clamp-2 text-[13px] font-bold text-white">{product.name}</p>
                      <p className="text-brand mt-1 text-[14px] font-bold">{formatPrice(product.price)}</p>
                      <p className="text-muted mt-0.5 text-[11px]">Stock: {product.stock_quantity ?? 0}</p>
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
