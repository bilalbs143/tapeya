import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import helmetImage from '@/assets/images/standard/shop-helmet.png';
import { Container } from '@/ui/Container';

const DEFAULT_PRODUCT = {
  id: 0,
  category: 'Helmets',
  title: 'SG Armour Lite Helmet (Limited Edition)',
  price: '1,499',
  originalPrice: '2,300',
  image: helmetImage,
  stock: 1,
  featured: true,
  features: [
    'SG Armour Lite Helmet',
    'Experience the perfect blend of safety, comfort, and performance with our latest innovation.',
    'Patented 360° Protection Grill: Featuring a newly designed face guard for maximum coverage.',
  ],
};

export default function ShopProductDetail() {
  const { brandId, productId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const product = state?.product ?? { ...DEFAULT_PRODUCT, id: productId };
  const categoryLabel = (
    state?.category ??
    product.category ??
    'Product'
  ).toUpperCase();
  const images = [product.image, product.image, product.image, product.image]; // in real app: product.images

  const backTo = state?.from ?? `/shop/${brandId ?? 'jd'}`;

  return (
    <Container>
      <div className="flex flex-col gap-4">
        {/* Header: back + title (logo, bell, menu are in MainLayout Navbar) */}
        <header className="-mx-4 -mt-6 flex items-center gap-3 bg-black px-4 pt-6 pb-4">
          <button
            type="button"
            onClick={() => navigate(backTo)}
            className="flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full bg-white text-[#4a4a4a] transition-opacity active:opacity-80"
            aria-label="Back"
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
          </button>
          <h1 className="min-w-0 flex-1 truncate pr-4 text-center text-[16px] font-bold tracking-wide text-white uppercase">
            SHOP - {categoryLabel}
          </h1>
        </header>

        {/* Product image + thumbnails */}
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-[17px] bg-white">
            <img
              src={images[selectedImage]}
              alt=""
              className="aspect-square w-full object-contain p-4"
            />
            {product.featured && (
              <span className="absolute top-3 left-3 rounded-full bg-[#DA9811] px-2.5 py-1 text-[12px] font-bold text-black uppercase">
                Featured
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedImage(i)}
                className={`h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 bg-white ${
                  selectedImage === i
                    ? 'border-[#DA9811]'
                    : 'border-transparent'
                }`}
                aria-label={`View image ${i + 1}`}
              >
                <img
                  src={img}
                  alt=""
                  className="h-full w-full object-contain p-1"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2">
          <h2 className="text-[16px] font-bold text-white">{product.title}</h2>
          <div className="flex items-center gap-4">
            {product.originalPrice && (
              <span className="text-[16px] font-bold text-[#A2A6AB82] line-through">
                PKR {product.originalPrice}
              </span>
            )}
            <span className="text-[16px] font-bold text-[#DA9811]">
              PKR {product.price}
            </span>
          </div>
          <p className="text-[12px] font-bold text-[#A2A6AB]">
            Availability:{' '}
            <span className="ml-2 text-[12px] text-[#FF3B30]">
              Only {product.stock ?? 1} left in stock
            </span>
          </p>
        </div>

        {/* Quantity + Add to cart */}
        <div className="flex items-center gap-4 border-t border-b border-[#1A1A1A] py-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-[#141412] text-white transition-opacity active:opacity-80"
              aria-label="Decrease quantity"
            >
              <span className="text-xl leading-none font-medium">−</span>
            </button>
            <span
              className="flex h-[44px] w-[74px] min-w-[3rem] items-center justify-center rounded-full bg-[#141412] px-5 text-base font-medium text-white"
              aria-live="polite"
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-[#141412] text-white transition-opacity active:opacity-80"
              aria-label="Increase quantity"
            >
              <span className="text-xl leading-none font-medium">+</span>
            </button>
          </div>
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#DA9811] py-3.5 text-base text-[16px] font-bold text-black transition-opacity active:opacity-90"
          >
            <svg
              className="h-5 w-5 shrink-0"
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
            Add to Cart
          </button>
        </div>

        {/* Features */}
        <section className="space-y-2 pt-2">
          <h3 className="text-[12px] font-bold tracking-wide text-[#A2A6AB] uppercase">
            Features
          </h3>
          <ul className="space-y-1 text-[12px] text-[#A2A6AB]">
            {(product.features ?? DEFAULT_PRODUCT.features).map((line, i) => (
              <li key={i} className="flex gap-2">
                <span className="shrink-0 text-[#A2A6AB]">*</span>
                <span>{line.replace(/^\*\s*/, '')}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Container>
  );
}
