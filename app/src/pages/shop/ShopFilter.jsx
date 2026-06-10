import { useEffect, useRef, useState } from 'react';

import { Link, useNavigate, useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { ListingProductCard } from '@/components/shop/ListingProductCard';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { NAVBAR_HEIGHT } from '@/lib/constants/layout';
import { useGetBrandsQuery, useGetCategoriesQuery, useGetProductsQuery } from '@/store/api/shopApi';
import { Container } from '@/ui/Container';

const searchIcon = `${CLOUDFRONT_APP_BASE}/images/icons/searchicon.svg`;

const FILTER_CONFIG = {
  popular: {
    title: 'Most Popular',
    params: { is_popular: true },
  },
  'special-offer': {
    title: 'Special Offer',
    params: { is_special_offer: true },
  },
};

export default function ShopFilter() {
  const navigate = useNavigate();
  const { filterKey } = useParams();
  const [query, setQuery] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [tabsFixedVisible, setTabsFixedVisible] = useState(false);
  const tabsSentinelRef = useRef(null);

  const config = filterKey ? FILTER_CONFIG[filterKey] : null;
  const { data: brandsResponse } = useGetBrandsQuery({ all: true });
  const brands = brandsResponse?.data ?? [];
  const { data: categoriesResponse } = useGetCategoriesQuery({ all: true });
  const allCategories = categoriesResponse?.data ?? [];

  const { data: allProductsResponse } = useGetProductsQuery({ ...config?.params, all: true }, { skip: !config });
  const allProductsForFilter = allProductsResponse?.data ?? [];
  const categoryIdsWithProducts = [...new Set(allProductsForFilter.map((p) => p.category_id).filter((id) => id != null))];
  const categoriesWithProducts = allCategories.filter((c) => categoryIdsWithProducts.includes(c.id));

  const { data: productsResponse } = useGetProductsQuery(
    {
      ...config?.params,
      category_id: activeCategoryId ?? undefined,
      search: query || undefined,
      all: true,
    },
    { skip: !config },
  );
  const products = productsResponse?.data ?? [];

  useEffect(() => {
    const sentinel = tabsSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setTabsFixedVisible(!entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: `-${NAVBAR_HEIGHT}px 0px 0px 0px`,
        threshold: 0,
      },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const displayTitle = config?.title ?? filterKey ?? 'Products';

  if (!config) {
    return (
      <div className="bg-black">
        <AppSubpageHeader title="SHOP" onBack={() => navigate('/shop')} />
        <Container>
          <div className="py-8 text-center text-white">
            <p>Invalid filter.</p>
            <Link to="/shop" className="text-brand mt-4 inline-block underline">
              Back to Shop
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  const productsWithBrandSlug = products.map((p) => ({
    ...p,
    brandSlug: brands.find((b) => b.id === p.brand_id)?.slug ?? '',
  }));

  return (
    <div className="bg-black">
      <AppSubpageHeader
        onBack={() => navigate('/shop')}
        title={
          <h1 className="min-w-0 text-[16px] font-bold tracking-wide uppercase">
            <span className="text-white">SHOP - </span>
            <span className="text-brand">{displayTitle}</span>
          </h1>
        }
      />
      <Container>
        <div className="flex flex-col gap-3">
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What Are You Looking For?"
              className="bg-surface placeholder:text-muted/47 focus:ring-brand/50 h-12 w-full rounded-[6px] pr-14 pl-4 text-white focus:ring-2 focus:outline-none"
              aria-label="Search Shop"
            />
            <span className="pointer-events-none absolute top-0 right-5 bottom-0 flex items-center">
              <img src={searchIcon} alt="" className="h-5 w-5 shrink-0" aria-hidden />
            </span>
          </div>

          <div className="flex flex-col">
            <div ref={tabsSentinelRef} className="h-px w-full" aria-hidden />
            <div className="-mx-4 bg-black px-4 pt-0.5 pb-2">
              <div className="flex gap-2 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <button
                  type="button"
                  onClick={() => setActiveCategoryId(null)}
                  className={`shrink-0 rounded-[6px] px-4 py-2.5 text-[13px] font-semibold tracking-wide transition-colors ${
                    activeCategoryId === null ? 'bg-brand text-black' : 'bg-surface text-white'
                  }`}
                  aria-pressed={activeCategoryId === null}
                >
                  All
                </button>
                {categoriesWithProducts.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={`shrink-0 rounded-[6px] px-4 py-2.5 text-[13px] font-semibold tracking-wide transition-colors ${
                      activeCategoryId === cat.id ? 'bg-brand text-black' : 'bg-surface text-white'
                    }`}
                    aria-pressed={activeCategoryId === cat.id}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {tabsFixedVisible && (
            <div className="fixed right-0 left-0 z-10 bg-black pt-1 pb-2 lg:left-[280px]" style={{ top: NAVBAR_HEIGHT }}>
              <div className="mx-auto max-w-2xl px-4 lg:max-w-none lg:px-4">
                <div className="flex gap-2 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <button
                    type="button"
                    onClick={() => setActiveCategoryId(null)}
                    className={`shrink-0 rounded-[6px] px-4 py-2.5 text-[13px] font-semibold tracking-wide transition-colors ${
                      activeCategoryId === null ? 'bg-brand text-black' : 'bg-surface text-white'
                    }`}
                    aria-pressed={activeCategoryId === null}
                  >
                    All
                  </button>
                  {categoriesWithProducts.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategoryId(cat.id)}
                      className={`shrink-0 rounded-[6px] px-4 py-2.5 text-[13px] font-semibold tracking-wide transition-colors ${
                        activeCategoryId === cat.id ? 'bg-brand text-black' : 'bg-surface text-white'
                      }`}
                      aria-pressed={activeCategoryId === cat.id}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {productsWithBrandSlug.map((product) => (
              <ListingProductCard key={product.id} product={product} brandSlug={product.brandSlug} />
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
