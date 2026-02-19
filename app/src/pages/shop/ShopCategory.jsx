import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { FloatingCartButton } from '@/components/FloatingCartButton';
import { formatPrice } from '@/lib/format';
import {
  useGetBrandsQuery,
  useGetCategoriesQuery,
  useGetProductsQuery,
} from '@/store/api/shopApi';
import { Container } from '@/ui/Container';

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

function AddToCartIcon({ className = 'text-white' }) {
  return (
    <span className={`flex items-center gap-0.5 ${className}`} aria-hidden>
      <svg
        className="h-3 w-3"
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

function ProductCard({ product, brandSlug }) {
  const imageUrl = product.images?.[0]?.path;
  const hasDiscount =
    product.sale_price != null && product.sale_price < product.price;
  const discountPercent =
    hasDiscount && product.price > 0
      ? Math.round((1 - product.sale_price / product.price) * 100)
      : 0;

  return (
    <Link
      to={`/shop/${brandSlug}/product/${product.slug}`}
      className="flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[17px] bg-[#1a1a18] transition-opacity active:opacity-90"
    >
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
          <span className="absolute top-2 left-2 rounded-full bg-[#DA9811] px-2 py-0.5 text-[12px] font-bold text-black uppercase">
            Featured
          </span>
        )}
        {hasDiscount && discountPercent > 0 && (
          <span className="absolute top-2 right-2 rounded-full bg-[#FF3B30] px-2 py-0.5 text-[12px] font-bold text-white">
            -{discountPercent}%
          </span>
        )}
      </div>
      <div className="flex h-[90px] flex-col p-3">
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
          <span className="shrink-0 rounded p-1">
            <AddToCartIcon />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ShopCategory() {
  const { brandId: brandSlug } = useParams();
  const [query, setQuery] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState(null);

  const { data: brandsResponse } = useGetBrandsQuery({ all: true });
  const brands = brandsResponse?.data ?? [];
  const brand = brandSlug
    ? brands.find((b) => b.slug === brandSlug || String(b.id) === brandSlug)
    : null;

  const { data: categoriesResponse } = useGetCategoriesQuery({ all: true });
  const categories = categoriesResponse?.data ?? [];

  const { data: productsResponse } = useGetProductsQuery(
    {
      brand_id: brand?.id,
      category_id: activeCategoryId ?? undefined,
      search: query || undefined,
      all: true,
    },
    { skip: !brand?.id },
  );
  const products = productsResponse?.data ?? [];

  const displayTitle = brand?.name ?? brandSlug ?? '';

  return (
    <Container>
      <FloatingCartButton />
      <div className="flex flex-col gap-4">
        <header className="-mx-4 -mt-6 flex items-center gap-3 bg-black px-4 pt-6 pb-4">
          <Link
            to="/shop"
            className="flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full bg-white text-[#4a4a4a] transition-opacity active:opacity-80"
            aria-label="Back to shop"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="min-w-0 flex-1 pr-4 text-center text-[16px] font-bold tracking-wide uppercase">
            <span className="text-white">SHOP - </span>
            <span className="text-[#DA9811]">{displayTitle || 'Brand'}</span>
          </h1>
        </header>

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
          <button
            type="button"
            onClick={() => setActiveCategoryId(null)}
            className={`shrink-0 rounded-[6px] px-4 py-2.5 text-[13px] font-semibold tracking-wide transition-colors ${
              activeCategoryId === null
                ? 'bg-[#DA9811] text-black'
                : 'bg-[#141412] text-white'
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
              className={`shrink-0 rounded-[6px] px-4 py-2.5 text-[13px] font-semibold tracking-wide transition-colors ${
                activeCategoryId === cat.id
                  ? 'bg-[#DA9811] text-black'
                  : 'bg-[#141412] text-white'
              }`}
              aria-pressed={activeCategoryId === cat.id}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              brandSlug={brandSlug}
            />
          ))}
        </div>
      </div>
    </Container>
  );
}
