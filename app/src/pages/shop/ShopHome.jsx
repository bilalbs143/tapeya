import 'swiper/css';

import { useEffect, useRef, useState } from 'react';

import { Link } from 'react-router-dom';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { ListingProductCard } from '@/components/shop/ListingProductCard';
import { ShopSearchPopover } from '@/components/shop/ShopSearchPopover';
import { useGetBrandsQuery, useGetProductsQuery } from '@/store/api/shopApi';
import { Container } from '@/ui/Container';

function ShopSlider({
  title,
  viewMorePath,
  products,
  brands,
  reverseDirection = false,
}) {
  const productsWithBrandSlug = products.map((p) => ({
    ...p,
    brandSlug: brands.find((b) => b.id === p.brand_id)?.slug,
  }));

  if (productsWithBrandSlug.length === 0) return null;

  return (
    <section className="mb-10 space-y-3">
      <header className="flex items-center justify-between">
        <h2 className="text-[13px] font-bold tracking-wide text-[#A2A6AB] uppercase">
          {title}
        </h2>
        <Link
          to={viewMorePath}
          className="text-[12px] font-bold text-[#DA9811] uppercase transition-opacity active:opacity-80"
        >
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
        {productsWithBrandSlug.map((product) => (
          <SwiperSlide key={product.id}>
            <ListingProductCard
              product={product}
              brandSlug={product.brandSlug}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

const NAVBAR_HEIGHT = 64;

export default function ShopHome() {
  const [tabsFixedVisible, setTabsFixedVisible] = useState(false);
  const tabsSentinelRef = useRef(null);
  const { data: brandsResponse } = useGetBrandsQuery({ all: true });
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
        rootMargin: `-${NAVBAR_HEIGHT}px 0px 0px 0px`,
        threshold: 0,
      },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <Container>
      <div className="flex flex-col gap-3">
        <h1 className="text-center text-[16px] font-bold tracking-wide text-white uppercase">
          Shop
        </h1>

        <ShopSearchPopover />

        <div className="flex flex-col">
          <div ref={tabsSentinelRef} className="h-px w-full" aria-hidden />
          <div className="-mx-4 bg-black px-4 pt-0.5 pb-2">
            <div className="flex gap-2 overflow-x-auto py-1 [scrollbar-width:none] lg:gap-3 [&::-webkit-scrollbar]:hidden">
              {brands.map(({ id, name, slug, logo }) => (
                <Link
                  key={id}
                  to={`/shop/${slug}`}
                  className="flex shrink-0 items-center gap-2 rounded-[6px] bg-[#141412] px-[13px] py-[10px] text-[13px] font-semibold tracking-wide text-white uppercase transition-colors hover:bg-[#252520] lg:min-w-[96px] lg:justify-center lg:px-4"
                  aria-label={`Shop ${name} products`}
                >
                  {logo ? (
                    <img
                      src={logo}
                      alt={`${name} logo`}
                      className="h-5 w-5 shrink-0 object-contain"
                    />
                  ) : null}
                  {name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {tabsFixedVisible && (
          <div
            className="fixed right-0 left-0 z-10 bg-black pt-1 pb-2 lg:left-[280px]"
            style={{ top: NAVBAR_HEIGHT }}
          >
            <div className="mx-auto max-w-2xl px-4 lg:max-w-none lg:px-4">
              <div className="flex gap-2 overflow-x-auto py-1 [scrollbar-width:none] lg:gap-3 [&::-webkit-scrollbar]:hidden">
                {brands.map(({ id, name, slug, logo }) => (
                  <Link
                    key={id}
                    to={`/shop/${slug}`}
                    className="flex shrink-0 items-center gap-2 rounded-[6px] bg-[#141412] px-[13px] py-[10px] text-[13px] font-semibold tracking-wide text-white uppercase transition-colors hover:bg-[#252520] lg:min-w-[96px] lg:justify-center lg:px-4"
                    aria-label={`Shop ${name} products`}
                  >
                    {logo ? (
                      <img
                        src={logo}
                        alt={`${name} logo`}
                        className="h-5 w-5 shrink-0 object-contain"
                      />
                    ) : null}
                    {name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6 pt-2">
          <ShopSlider
            title="Most popular"
            viewMorePath="/shop/filter/popular"
            products={popularProducts}
            brands={brands}
            reverseDirection={false}
          />
          <ShopSlider
            title="Special offer"
            viewMorePath="/shop/filter/special-offer"
            products={specialOfferProducts}
            brands={brands}
            reverseDirection
          />
        </div>
      </div>
    </Container>
  );
}
