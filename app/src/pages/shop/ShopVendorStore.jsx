import { useEffect, useRef, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { ListingProductCard } from '@/components/shop/ListingProductCard';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { getNavbarOffsetPx, NAVBAR_OFFSET_CSS } from '@/lib/constants/layout';
import { useGetCategoriesQuery, useGetProductsQuery, useGetVendorBySlugQuery } from '@/store/api/shopApi';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { ListEmpty } from '@/ui/ListState';
import { PageLoader } from '@/ui/Loader';

const searchIcon = `${CLOUDFRONT_APP_BASE}/images/icons/searchicon.svg`;

export default function ShopVendorStore() {
  const { slug: vendorSlug } = useParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [tabsFixedVisible, setTabsFixedVisible] = useState(false);
  const tabsSentinelRef = useRef(null);

  const {
    data: vendor,
    isLoading: vendorLoading,
    isError: vendorError,
  } = useGetVendorBySlugQuery(vendorSlug, { skip: !vendorSlug });

  const { data: categoriesResponse } = useGetCategoriesQuery({ all: true });
  const categories = categoriesResponse?.data ?? [];

  const vendorId = vendor?.id;
  const { data: productsResponse, isLoading: productsLoading } = useGetProductsQuery(
    {
      vendor_id: vendorId,
      category_id: activeCategoryId ?? undefined,
      search: query || undefined,
      all: true,
    },
    { skip: !vendorId },
  );

  const productsFromQuery = productsResponse?.data ?? [];
  const products =
    productsFromQuery.length > 0 || query || activeCategoryId
      ? productsFromQuery
      : (vendor?.products ?? []).map((p) => ({
          ...p,
          vendor: p.vendor ?? { id: vendor.id, store_name: vendor.store_name, slug: vendor.slug },
        }));

  const isLoading = vendorLoading || (!!vendorId && productsLoading);

  useEffect(() => {
    const sentinel = tabsSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setTabsFixedVisible(!entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: `-${getNavbarOffsetPx()}px 0px 0px 0px`,
        threshold: 0,
      },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [vendorId]);

  if (!vendorSlug) {
    return null;
  }

  if (isLoading && !vendor) {
    return (
      <div className="bg-black">
        <AppSubpageHeader title="STORE" onBack={() => navigate('/shop')} />
        <Container>
          <PageLoader label="Loading store" className="min-h-[40vh] py-12" />
        </Container>
      </div>
    );
  }

  if (vendorError || !vendor) {
    return (
      <div className="bg-black">
        <AppSubpageHeader title="STORE" onBack={() => navigate('/shop')} />
        <Container>
          <ListEmpty
            title="Store Not Found."
            action={
              <Button type="button" variant="orange" onClick={() => navigate('/shop')}>
                Back to Shop
              </Button>
            }
          />
        </Container>
      </div>
    );
  }

  const categoryTabs = (
    <>
      <button
        type="button"
        onClick={() => setActiveCategoryId(null)}
        className={`shrink-0 rounded-[6px] px-4 py-2.5 text-[13px] font-semibold tracking-wide transition-colors lg:min-w-[96px] ${
          activeCategoryId === null ? 'bg-brand text-black' : 'bg-surface text-white'
        }`}
        aria-pressed={activeCategoryId === null}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => setActiveCategoryId(cat.id)}
          className={`shrink-0 rounded-[6px] px-4 py-2.5 text-[13px] font-semibold tracking-wide transition-colors lg:min-w-[96px] ${
            activeCategoryId === cat.id ? 'bg-brand text-black' : 'bg-surface text-white'
          }`}
          aria-pressed={activeCategoryId === cat.id}
        >
          {cat.name}
        </button>
      ))}
    </>
  );

  return (
    <div className="bg-black">
      <AppSubpageHeader
        onBack={() => navigate('/shop')}
        title={
          <h1 className="min-w-0 text-[16px] font-bold tracking-wide uppercase">
            <span className="text-white">STORE - </span>
            <span className="text-brand">{vendor.store_name}</span>
          </h1>
        }
      />
      <Container>
        <div className="flex flex-col gap-3">
          {(vendor.description || vendor.city || vendor.country) && (
            <div className="space-y-1 pb-1">
              {vendor.description && <p className="text-muted text-[13px] leading-relaxed">{vendor.description}</p>}
              {(vendor.city || vendor.country) && (
                <p className="text-muted text-[12px]">{[vendor.city, vendor.country].filter(Boolean).join(', ')}</p>
              )}
            </div>
          )}

          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What Are You Looking For?"
              className="bg-surface placeholder:text-muted/47 focus:ring-brand/50 h-12 w-full rounded-[6px] pr-14 pl-4 text-white focus:ring-2 focus:outline-none"
              aria-label="Search Store"
            />
            <span className="pointer-events-none absolute top-0 right-5 bottom-0 flex items-center">
              <img src={searchIcon} alt="" className="h-5 w-5 shrink-0" aria-hidden />
            </span>
          </div>

          <div className="flex flex-col">
            <div ref={tabsSentinelRef} className="h-px w-full" aria-hidden />
            <div className="-mx-4 bg-black px-4 pt-0.5 pb-2">
              <div className="flex gap-2 overflow-x-auto py-1 [scrollbar-width:none] lg:gap-3 [&::-webkit-scrollbar]:hidden">
                {categoryTabs}
              </div>
            </div>
          </div>

          {tabsFixedVisible && (
            <div className="fixed right-0 left-0 z-10 bg-black pt-1 pb-2 lg:left-[280px]" style={{ top: NAVBAR_OFFSET_CSS }}>
              <div className="mx-auto max-w-2xl px-4 lg:max-w-none lg:px-4">
                <div className="flex gap-2 overflow-x-auto py-1 [scrollbar-width:none] lg:gap-3 [&::-webkit-scrollbar]:hidden">
                  {categoryTabs}
                </div>
              </div>
            </div>
          )}

          {products.length === 0 ? (
            <ListEmpty title={query || activeCategoryId ? 'No Products Match Your Search.' : 'No Products Yet.'} />
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ListingProductCard
                  key={product.id}
                  product={{
                    ...product,
                    vendor: product.vendor ?? {
                      id: vendor.id,
                      store_name: vendor.store_name,
                      slug: vendor.slug,
                    },
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
