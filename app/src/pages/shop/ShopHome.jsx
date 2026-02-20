import 'swiper/css';

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import productCartIcon from '@/assets/images/icons/product-cart-icon.svg';
import searchIcon from '@/assets/images/icons/searchicon.svg';

import { FloatingCartButton } from '@/components/FloatingCartButton';
import { formatPrice } from '@/lib/format';
import {
  useAddCartItemMutation,
  useGetBrandsQuery,
  useGetProductsQuery,
} from '@/store/api/shopApi';
import { Container } from '@/ui/Container';

function ProductCard({ product, brandSlug }) {
  const [addToCart, { isLoading: isAddingToCart }] = useAddCartItemMutation();
  const stock = product.stock_quantity ?? 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (stock < 1 || isAddingToCart) return;
    addToCart({ product_id: product.id, quantity: 1 });
  };

  const imageUrl = product.images?.[0]?.path;
  const hasDiscount =
    product.sale_price != null && product.sale_price < product.price;
  const discountPercent =
    hasDiscount && product.price > 0
      ? Math.round((1 - product.sale_price / product.price) * 100)
      : 0;

  const content = (
    <>
      <div className="relative h-[138px] bg-white">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.images?.[0]?.alt ?? product.name}
            className="h-full w-full object-contain p-2"
          />
        ) : (
          <div className="h-full w-full bg-[#141412]" aria-hidden />
        )}
        {product.is_featured && (
          <span className="absolute top-2 left-2 rounded-full bg-[#DA9811] px-2 py-0.5 text-[11px] font-bold text-black uppercase">
            Featured
          </span>
        )}
        {hasDiscount && discountPercent > 0 && (
          <span className="absolute top-2 right-2 rounded-full bg-[#FF3B30] px-2 py-0.5 text-[11px] font-bold text-white">
            -{discountPercent}%
          </span>
        )}
      </div>
      <div className="flex h-[110px] flex-col p-3">
        <p className="line-clamp-2 shrink-0 text-[13px] font-medium leading-snug text-white">
          {product.name}
        </p>
        <div className="mt-auto flex min-h-[2.75rem] shrink-0 items-end justify-between gap-2">
          <div className="flex min-w-0 flex-col justify-end gap-0.5">
            {hasDiscount ? (
              <>
                <span className="text-[11px] text-[#A2A6AB] line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="text-base font-bold text-[#DA9811]">
                  {formatPrice(product.sale_price)}
                </span>
              </>
            ) : (
              <span className="text-base font-bold text-[#DA9811]">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={stock < 1 || isAddingToCart}
            className="shrink-0 flex items-center gap-0.5 rounded p-1 transition-opacity active:opacity-80 disabled:opacity-50"
            aria-label="Add to cart"
          >
            <svg
              className="h-3 w-3 text-[#DA9811] font-bold"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <img src={productCartIcon} alt="" className="h-[17px] w-[17px]" aria-hidden />
          </button>
        </div>
      </div>
    </>
  );

  if (brandSlug && product.slug) {
    return (
      <Link
        to={`/shop/${brandSlug}/product/${product.slug}`}
        className="flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[17px] bg-[#1a1a18] transition-opacity active:opacity-90"
      >
        {content}
      </Link>
    );
  }

  return (
    <article className="flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[17px] bg-[#1a1a18]">
      {content}
    </article>
  );
}

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
    <section className="space-y-3 mb-10">
      <header className="flex items-center justify-between">
        <h2 className="text-[13px] font-bold tracking-wide text-[#A2A6AB] uppercase">
          {title}
        </h2>
        <Link
          to={viewMorePath}
          className="text-[12px] font-bold text-[#DA9811] uppercase transition-opacity active:opacity-80"
        >
          View more
        </Link>
      </header>
      <Swiper
        modules={[Autoplay]}
        spaceBetween={12}
        slidesPerView={2}
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
            <ProductCard product={product} brandSlug={product.brandSlug} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

const NAVBAR_HEIGHT = 64;

export default function ShopHome() {
  const [query, setQuery] = useState('');
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
      <FloatingCartButton />
      <div className="flex flex-col gap-3">
        <h1 className="text-center text-[16px] font-bold tracking-wide text-white uppercase">
          Shop
        </h1>

        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What are you looking for?"
            className="h-12 w-full rounded-[6px] bg-[#141412] pr-14 pl-4 text-white placeholder:text-[#A2A6AB78] focus:ring-2 focus:ring-[#DA9811]/50 focus:outline-none"
            aria-label="Search shop"
          />
          <span className="pointer-events-none absolute top-0 right-5 bottom-0 flex items-center">
            <img src={searchIcon} alt="" className="h-5 w-5 shrink-0" aria-hidden />
          </span>
        </div>

        <div className="flex flex-col">
          <div ref={tabsSentinelRef} className="h-px w-full" aria-hidden />
          <div className="-mx-4 bg-black px-4 pb-2 pt-0.5">
            <div className="flex gap-2 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {brands.map(({ id, name, slug, logo }) => (
                <Link
                  key={id}
                  to={`/shop/${slug}`}
                  className="flex shrink-0 items-center gap-2 rounded-[6px] bg-[#141412] px-[13px] py-[10px] text-[13px] font-semibold tracking-wide text-white uppercase transition-colors hover:bg-[#252520]"
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
            className="fixed left-0 right-0 z-10 bg-black pb-2 pt-1"
            style={{ top: NAVBAR_HEIGHT }}
          >
            <div className="mx-auto max-w-2xl px-4">
              <div className="flex gap-2 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {brands.map(({ id, name, slug, logo }) => (
                  <Link
                    key={id}
                    to={`/shop/${slug}`}
                    className="flex shrink-0 items-center gap-2 rounded-[6px] bg-[#141412] px-[13px] py-[10px] text-[13px] font-semibold tracking-wide text-white uppercase transition-colors hover:bg-[#252520]"
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
            viewMorePath="/shop"
            products={popularProducts}
            brands={brands}
            reverseDirection={false}
          />
          <ShopSlider
            title="Special offer"
            viewMorePath="/shop"
            products={specialOfferProducts}
            brands={brands}
            reverseDirection
          />
        </div>
      </div>
    </Container>
  );
}
