import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container } from '@/ui/Container';

import helmetImage from '@/assets/images/standard/shop-helmet.png';

const BRAND_LABELS = {
  jd: 'JD',
  fplus: 'FPLUS',
  saki: 'SAKI',
  'tm-spor': 'TM SPOR',
};

const BRAND_DISPLAY_TITLES = {
  jd: 'JD SPORTS',
  fplus: 'FPLUS',
  saki: 'SAKI',
  'tm-spor': 'TM SPOR',
};

const CATEGORIES = ['All', 'Bats', 'Grips', 'Balls', 'Shoes', 'Wickets'];

/** Mock products per category; in real app would come from API */
const PRODUCTS = [
  { id: 1, category: 'Bats', title: 'Cricket Arabia Silver Medal for Place 34', price: '1,499', image: helmetImage },
  { id: 2, category: 'Bats', title: 'Cricket Arabia Silver Medal for Place 34', price: '1,499', image: helmetImage },
  { id: 3, category: 'Grips', title: 'Cricket Arabia Silver Medal for Place 34', price: '1,499', image: helmetImage },
  { id: 4, category: 'Grips', title: 'Cricket Arabia Silver Medal for Place 34', price: '1,499', image: helmetImage },
  { id: 5, category: 'Balls', title: 'Cricket Arabia Silver Medal for Place 34', price: '1,499', image: helmetImage },
  { id: 6, category: 'Balls', title: 'Cricket Arabia Silver Medal for Place 34', price: '1,499', image: helmetImage },
  { id: 7, category: 'Shoes', title: 'Cricket Arabia Silver Medal for Place 34', price: '1,499', image: helmetImage },
  { id: 8, category: 'Shoes', title: 'Cricket Arabia Silver Medal for Place 34', price: '1,499', image: helmetImage },
  { id: 9, category: 'Wickets', title: 'Cricket Arabia Silver Medal for Place 34', price: '1,499', image: helmetImage },
  { id: 10, category: 'Wickets', title: 'Cricket Arabia Silver Medal for Place 34', price: '1,499', image: helmetImage },
];

function SearchIcon() {
  return (
    <svg className="h-5 w-5 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function AddToCartIcon({ className = 'text-white' }) {
  return (
    <span className={`flex items-center gap-0.5 ${className}`} aria-hidden>
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    </span>
  );
}

function ProductCard({ product, brandId }) {
  const { image, title, price, category } = product;
  return (
    <Link
      to={`/shop/${brandId}/product/${product.id}`}
      state={{ product: { ...product, originalPrice: '2,300', stock: 1, featured: true, features: null }, category }}
      className="flex flex-col overflow-hidden rounded-[17px] bg-[#1a1a18] transition-opacity active:opacity-90"
    >
      <div className="aspect-square bg-white">
        <img src={image} alt="" className="h-full w-full object-contain p-2" />
      </div>
      <div className="flex flex-col gap-1 p-3">
        <p className="line-clamp-2 text-[13px] font-medium text-white">{title}</p>
        <div className="flex items-end justify-between gap-2">
          <span className="text-base font-bold text-[#DA9811]">PKR {price}</span>
          <span className="shrink-0 rounded p-1">
            <AddToCartIcon />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ShopCategory() {
  const { brandId } = useParams();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const displayTitle = (brandId && BRAND_DISPLAY_TITLES[brandId]) ?? (brandId && BRAND_LABELS[brandId]) ?? brandId ?? '';

  const filteredProducts = useMemo(() => {
    if (activeTab === 'All') return PRODUCTS;
    return PRODUCTS.filter((p) => p.category === activeTab);
  }, [activeTab]);

  return (
    <Container>
      <div className="flex flex-col gap-4">
        <header className="flex -mx-4 -mt-6 px-4 pt-6 pb-4 items-center gap-3 bg-black">
          <Link
            to="/shop"
            className="flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full bg-white text-[#4a4a4a] transition-opacity active:opacity-80"
            aria-label="Back to shop"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="min-w-0 flex-1 text-[16px] font-bold uppercase text-center pr-4 tracking-wide">
            <span className="text-white">SHOP - </span>
            <span className="text-[#DA9811]">{displayTitle}</span>
          </h1>
        </header>

        <div className="relative -mx-4 px-4">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What are you looking for?"
            className="h-12 w-full rounded-full bg-[#2a2a2a] pl-4 pr-14 text-white placeholder:text-[#A2A6AB] focus:outline-none focus:ring-2 focus:ring-[#DA9811]/50"
            aria-label="Search shop"
          />
          <span className="pointer-events-none absolute right-5 top-0 bottom-0 flex items-center">
            <SearchIcon />
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveTab(cat)}
              className={`shrink-0 rounded-[6px] px-4 py-2.5 text-[13px] font-semibold tracking-wide transition-colors ${
                activeTab === cat ? 'bg-[#DA9811] text-black' : 'bg-[#141412] text-white'
              }`}
              aria-pressed={activeTab === cat}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} brandId={brandId} />
          ))}
        </div>
      </div>
    </Container>
  );
}
