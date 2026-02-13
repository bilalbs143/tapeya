import 'swiper/css';

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import shopPopular1 from '@/assets/images/standard/shop-most-popular-1.png';
import shopPopular2 from '@/assets/images/standard/shop-most-popular-2.png';
import shopOffer1 from '@/assets/images/standard/shop-sp-offer-1.png';
import shopOffer2 from '@/assets/images/standard/shop-sp-offer-2.png';
import { Container } from '@/ui/Container';

/** Brands that offer products; each links to their shop category page */
const SHOP_BRANDS = [
  { id: 'jd', label: 'JD' },
  { id: 'fplus', label: 'FPLUS' },
  { id: 'saki', label: 'SAKI' },
  { id: 'tm-spor', label: 'TM SPOR' },
];

const MOST_POPULAR_PRODUCTS = [
  {
    id: 1,
    image: shopPopular1,
    title: 'Cricket Arabia Silver Medal for Place 34',
    price: '1,499',
    featured: true,
  },
  {
    id: 2,
    image: shopPopular2,
    title: 'Cricket Arabia Silver Medal for Place 34',
    price: '1,499',
    featured: true,
  },
  {
    id: 3,
    image: shopPopular1,
    title: 'Cricket Arabia Silver Medal for Place 34',
    price: '1,499',
    featured: false,
  },
];

const SPECIAL_OFFER_PRODUCTS = [
  {
    id: 1,
    image: shopOffer1,
    title: 'White Athletic Shoes Blue Accents',
    price: '2,299',
    featured: true,
  },
  {
    id: 2,
    image: shopOffer2,
    title: 'Sports Sunglasses Reflective',
    price: '1,899',
    featured: true,
  },
  {
    id: 3,
    image: shopOffer1,
    title: 'White Athletic Shoes Blue Accents',
    price: '2,299',
    featured: false,
  },
];

function SearchIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0 text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function TmBadgeIcon() {
  return (
    <span
      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#DA9811]/20 text-[10px] font-bold text-[#DA9811]"
      aria-hidden
    >
      TM
    </span>
  );
}

function AddToCartIcon({ className = 'text-[#DA9811]' }) {
  return (
    <span className={`flex items-center gap-0.5 ${className}`} aria-hidden>
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    </span>
  );
}

function ProductCard({ image, title, price, featured }) {
  return (
    <article className="flex w-full min-w-0 flex-col overflow-hidden rounded-[17px] bg-[#1a1a18]">
      <div className="relative aspect-square bg-white">
        <img src={image} alt="" className="h-full w-full object-contain p-2" />
        {featured && (
          <span className="absolute top-2 left-2 rounded-full bg-[#DA9811] px-2 py-0.5 text-[12px] font-bold text-black uppercase">
            Featured
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between gap-1 p-3">
        <p className="line-clamp-2 text-[13px] font-medium text-white">
          {title}
        </p>
        <div className="mt-auto flex items-end justify-between gap-2">
          <span className="text-base font-bold text-[#DA9811]">
            PKR {price}
          </span>
          <button
            type="button"
            className="shrink-0 rounded p-1 transition-opacity active:opacity-80"
            aria-label="Add to cart"
          >
            <AddToCartIcon className="text-white" />
          </button>
        </div>
      </div>
    </article>
  );
}

function ShopSlider({
  title,
  viewMorePath,
  products,
  reverseDirection = false,
}) {
  return (
    <section className="space-y-3">
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
        slidesPerView={1.5}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          reverseDirection,
        }}
        loop
        className="shop-swiper -mx-4 px-4"
        grabCursor
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <ProductCard {...product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

export default function ShopHome() {
  const [query, setQuery] = useState('');

  return (
    <Container>
      <div className="flex flex-col gap-6">
        <h1 className="text-center text-[16px] font-bold tracking-wide text-white uppercase">
          Shop
        </h1>

        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What are you looking for?"
            className="h-12 w-full rounded-full bg-[#141412] pr-14 pl-4 text-white placeholder:text-[#A2A6AB] focus:ring-2 focus:ring-[#DA9811]/50 focus:outline-none"
            aria-label="Search shop"
          />
          <span className="pointer-events-none absolute top-0 right-5 bottom-0 flex items-center">
            <SearchIcon />
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SHOP_BRANDS.map(({ id, label }) => (
            <Link
              key={id}
              to={`/shop/${id}`}
              className="flex shrink-0 items-center gap-2 rounded-[6px] bg-[#141412] px-[13px] py-[10px] text-[13px] font-semibold tracking-wide text-white uppercase transition-colors hover:bg-[#252520]"
              aria-label={`Shop ${label} products`}
            >
              <TmBadgeIcon />
              {label}
            </Link>
          ))}
        </div>

        <div className="space-y-6 pt-2">
          <ShopSlider
            title="Most popular"
            viewMorePath="/shop"
            products={MOST_POPULAR_PRODUCTS}
          />
          <ShopSlider
            title="Special offer"
            viewMorePath="/shop"
            products={SPECIAL_OFFER_PRODUCTS}
            reverseDirection
          />
        </div>
      </div>
    </Container>
  );
}
