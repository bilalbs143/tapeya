import 'swiper/css';

import { useEffect, useRef, useState } from 'react';

import { Link } from 'react-router-dom';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { ListingProductCard } from '@/components/shop/ListingProductCard';
import { ShopSearchPopover } from '@/components/shop/ShopSearchPopover';
import { getNavbarOffsetPx, NAVBAR_OFFSET_CSS } from '@/lib/constants/layout';
import { buildShopBrandPath } from '@/lib/shopPaths';
import { useGetBrandsQuery, useGetProductsQuery } from '@/store/api/shopApi';
import { Container } from '@/ui/Container';

function ShopSlider({ title, viewMorePath, products, reverseDirection = false }) {
  if (products.length === 0) return null;

  return (
    <section className="mb-10 space-y-3">
      <header className="flex items-center justify-between">
        <h2 className="text-muted text-[13px] font-bold tracking-wide uppercase">{title}</h2>
        <Link to={viewMorePath} className="text-brand text-[12px] font-bold transition-opacity active:opacity-80">
          View More
        </Link>
      </header>
      <Swiper
        modules={[Autoplay]}
        spaceBetween={12}
        slidesPerView={2}
        breakpoints={{
          1024: { slidesPerView: 3.5 },
        }}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          reverseDirection,
        }}
        loop
        className="shop-swiper -mx-4 px-4 [&_.swiper-wrapper]:items-stretch"
        grabCursor
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <ListingProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

export default function ShopHome() {
  const [tabsFixedVisible, setTabsFixedVisible] = useState(false);
  const tabsSentinelRef = useRef(null);
  const { data: brandsResponse } = useGetBrandsQuery({ all: true, has_products: true });
  const brands = brandsResponse?.data ?? [];
  const { data: popularResponse } = useGetProductsQuery({
    is_popular: true,
    all: true,
  });
  const { data: specialOfferResponse } = useGetProductsQuery({
    is_special_offer: true,
    all: true,
  });
  const popularProducts = popularResponse?.data ?? [];
  const specialOfferProducts = specialOfferResponse?.data ?? [];

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
  }, []);

  return (
    <div className="bg-black">
      <AppSubpageHeader title="Shop" />
      <Container>
        <div className="flex flex-col gap-3">
          <ShopSearchPopover />

          <div className="flex flex-col">
            <div ref={tabsSentinelRef} className="h-px w-full" aria-hidden />
            <div className="-mx-4 bg-black px-4 pt-0.5 pb-2">
              <div className="flex gap-2 overflow-x-auto py-1 [scrollbar-width:none] lg:gap-3 [&::-webkit-scrollbar]:hidden">
                {brands.map(({ id, name, slug, logo }) => (
                  <Link
                    key={id}
                    to={buildShopBrandPath(slug)}
                    className="bg-surface flex shrink-0 items-center gap-2 rounded-[6px] px-[13px] py-[10px] text-[13px] font-semibold tracking-wide text-white uppercase transition-colors hover:bg-[#252520] lg:min-w-[96px] lg:justify-center lg:px-4"
                    aria-label={`Shop ${name} Products`}
                  >
                    {logo ? <img src={logo} alt={`${name} logo`} className="h-5 w-5 shrink-0 object-contain" /> : null}
                    {name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {tabsFixedVisible && (
            <div className="fixed right-0 left-0 z-10 bg-black pt-1 pb-2 lg:left-[280px]" style={{ top: NAVBAR_OFFSET_CSS }}>
              <div className="mx-auto max-w-2xl px-4 lg:max-w-none lg:px-4">
                <div className="flex gap-2 overflow-x-auto py-1 [scrollbar-width:none] lg:gap-3 [&::-webkit-scrollbar]:hidden">
                  {brands.map(({ id, name, slug, logo }) => (
                    <Link
                      key={id}
                      to={buildShopBrandPath(slug)}
                      className="bg-surface flex shrink-0 items-center gap-2 rounded-[6px] px-[13px] py-[10px] text-[13px] font-semibold tracking-wide text-white uppercase transition-colors hover:bg-[#252520] lg:min-w-[96px] lg:justify-center lg:px-4"
                      aria-label={`Shop ${name} Products`}
                    >
                      {logo ? <img src={logo} alt={`${name} logo`} className="h-5 w-5 shrink-0 object-contain" /> : null}
                      {name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6 pt-2">
            <ShopSlider title="Most Popular" viewMorePath="/shop/filter/popular" products={popularProducts} />
            <ShopSlider
              title="Special Offer"
              viewMorePath="/shop/filter/special-offer"
              products={specialOfferProducts}
              reverseDirection
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
