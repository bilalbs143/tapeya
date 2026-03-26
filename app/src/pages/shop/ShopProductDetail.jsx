import { useEffect, useMemo, useState } from 'react';

import { useLocation, useNavigate, useParams } from 'react-router-dom';

import shoppingCartIcon from '@/assets/images/icons/shopping-cart.svg';
import { useAddToCart } from '@/hooks/shop/useAddToCart';
import { useToast } from '@/hooks/useToast';
import { formatPrice } from '@/lib/format';
import { useGetProductQuery } from '@/store/api/shopApi';
import { Container } from '@/ui/Container';

function getImageUrls(images) {
  if (!images?.length) return [];
  return images.map((img) => img.path ?? img).filter(Boolean);
}

export default function ShopProductDetail() {
  const { brandId, productSlug } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useGetProductQuery(productSlug, { skip: !productSlug });
  const toast = useToast();
  const { addToCart, isAddingToCart } = useAddToCart();

  const normalized = useMemo(() => {
    if (!product) return null;
    const imageUrls = getImageUrls(product.images);
    const displayPrice = product.sale_price ?? product.price;
    const hasDiscount =
      product.sale_price != null && product.sale_price < product.price;
    const discountPercent =
      hasDiscount && product.price > 0
        ? Math.round((1 - product.sale_price / product.price) * 100)
        : 0;
    return {
      ...product,
      imageUrls: imageUrls.length ? imageUrls : [],
      categoryName:
        typeof product.category === 'object' && product.category?.name
          ? product.category.name
          : (product.category ?? 'Product'),
      displayPrice,
      hasDiscount,
      discountPercent,
      stock: product.stock_quantity ?? 0,
    };
  }, [product]);

  const backTo = state?.from ?? (brandId ? `/shop/${brandId}` : '/shop');

  const handleAddToCart = async () => {
    if (!normalized?.id) return;
    try {
      await addToCart({ product_id: normalized.id, quantity }).unwrap();
      toast.success('Added to cart');
    } catch (_err) {
      toast.error('Could not add to cart. Try again.');
    }
  };

  useEffect(() => {
    if (!productSlug) navigate('/shop', { replace: true });
  }, [productSlug, navigate]);

  if (!productSlug) return null;

  if (isLoading || !normalized) {
    return (
      <Container>
        <div className="flex min-h-[40vh] items-center justify-center">
          {!isLoading && (
            <p className="text-[14px] text-[#A2A6AB]">Product not found.</p>
          )}
        </div>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container>
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
          <p className="text-[14px] text-[#A2A6AB]">
            {error?.data?.message ?? 'Something went wrong.'}
          </p>
          <button
            type="button"
            onClick={() => navigate(backTo)}
            className="rounded-full bg-[#DA9811] px-6 py-2.5 text-[14px] font-bold text-black"
          >
            Go Back
          </button>
        </div>
      </Container>
    );
  }

  const mainImage =
    normalized.imageUrls[selectedImage] ?? normalized.imageUrls[0];

  return (
    <Container>
      <div className="flex flex-col gap-4">
        <header className="-mx-4 -mt-6 flex items-center gap-3 bg-black px-4 pt-6 pb-4 lg:mt-0">
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
          <h1 className="min-w-0 flex-1 pr-4 text-center text-[16px] font-bold tracking-wide uppercase">
            <span className="text-white">SHOP - </span>
            <span className="text-[#DA9811]">{normalized.categoryName}</span>
          </h1>
        </header>

        {/* Mobile layout: keep original stacking order */}
        <div className="flex flex-col gap-4 lg:hidden">
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-t-[17px] bg-white">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={normalized.images?.[selectedImage]?.alt ?? normalized.name}
                  className="aspect-square h-[280px] w-full object-contain"
                />
              ) : (
                <div className="aspect-square w-full bg-[#141412]" aria-hidden />
              )}
              {normalized.is_featured && (
                <span className="absolute top-3 left-3 rounded-full bg-[#DA9811] px-4 py-1 text-[12px] font-bold text-black uppercase">
                  Featured
                </span>
              )}
              {normalized.hasDiscount && normalized.discountPercent > 0 && (
                <span className="absolute top-3 right-3 rounded-full bg-[#FF3B30] px-2 py-0.5 text-[11px] font-bold text-white">
                  -{normalized.discountPercent}%
                </span>
              )}
            </div>
            {normalized.imageUrls.length > 1 && (
              <div className="flex gap-2">
                {normalized.imageUrls.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImage(i)}
                    className={`h-[45px] w-[45px] shrink-0 overflow-hidden rounded-full border-2 bg-white ${
                      selectedImage === i
                        ? 'border-[#DA9811]'
                        : 'border-transparent'
                    }`}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-[16px] font-bold text-white">{normalized.name}</h2>
            <div className="flex items-center gap-8">
              {normalized.hasDiscount && (
                <span className="text-[16px] font-bold text-[#A2A6AB82] line-through">
                  {formatPrice(normalized.price)}
                </span>
              )}
              <span className="text-[16px] font-bold text-[#DA9811]">
                {formatPrice(normalized.displayPrice)}
              </span>
            </div>
            <p className="text-[12px] font-bold text-[#A2A6AB]">
              Availability:{' '}
              <span
                className={`ml-2 text-[12px] ${
                  normalized.stock > 0 ? 'text-[#FF3B30]' : 'text-[#A2A6AB]'
                }`}
              >
                {normalized.stock > 0
                  ? `Only ${normalized.stock} left in stock`
                  : 'Out of stock'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-4 border-t border-b border-[#1A1A1A] py-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-[#141412] text-[#A2A6AB] transition-opacity active:opacity-80"
                aria-label="Decrease quantity"
              >
                <span className="text-xl leading-none font-bold">−</span>
              </button>
              <span
                className="flex h-[48px] w-[86px] min-w-[3rem] items-center justify-center rounded-[6px] bg-[#141412] px-5 text-base font-bold text-[#A2A6AB]"
                aria-live="polite"
              >
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-[#141412] text-[#A2A6AB] transition-opacity active:opacity-80"
                aria-label="Increase quantity"
              >
                <span className="text-xl leading-none font-bold">+</span>
              </button>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={normalized.stock < 1 || isAddingToCart}
              className="flex flex-1 items-center justify-center gap-2 rounded-[6px] bg-[#DA9811] py-3.5 text-base text-[16px] font-semibold text-black transition-opacity active:opacity-90 disabled:opacity-50"
            >
              <img
                src={shoppingCartIcon}
                alt=""
                className="h-6 w-6 shrink-0"
                aria-hidden
              />
              {isAddingToCart ? 'Adding…' : 'Add to Cart'}
            </button>
          </div>

          {normalized.description && (
            <section className="pt-2">
              <h3 className="mb-2 text-[12px] font-bold tracking-wide text-[#A2A6AB] uppercase">
                Features
              </h3>
              <div
                className="product-description text-[14px] text-[#A2A6AB]"
                dangerouslySetInnerHTML={{ __html: normalized.description }}
              />
            </section>
          )}
        </div>

        {/* Desktop layout: left image; right details (top) + counter/button */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:items-center lg:gap-8 ">
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-t-[17px] bg-white">
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={
                      normalized.images?.[selectedImage]?.alt ?? normalized.name
                    }
                    className="aspect-square h-[280px] w-full object-contain"
                  />
                ) : (
                  <div
                    className="aspect-square w-full bg-[#141412]"
                    aria-hidden
                  />
                )}
                {normalized.is_featured && (
                  <span className="absolute top-3 left-3 rounded-full bg-[#DA9811] px-4 py-1 text-[12px] font-bold text-black uppercase">
                    Featured
                  </span>
                )}
                {normalized.hasDiscount &&
                  normalized.discountPercent > 0 && (
                    <span className="absolute top-3 right-3 rounded-full bg-[#FF3B30] px-2 py-0.5 text-[11px] font-bold text-white">
                      -{normalized.discountPercent}%
                    </span>
                  )}
              </div>
              {normalized.imageUrls.length > 1 && (
                <div className="flex gap-2">
                  {normalized.imageUrls.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedImage(i)}
                      className={`h-[45px] w-[45px] shrink-0 overflow-hidden rounded-full border-2 bg-white ${
                        selectedImage === i
                          ? 'border-[#DA9811]'
                          : 'border-transparent'
                      }`}
                      aria-label={`View image ${i + 1}`}
                    >
                      <img
                        src={url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-[16px] font-bold text-white">{normalized.name}</h2>
              <div className="flex items-center gap-8">
                {normalized.hasDiscount && (
                  <span className="text-[16px] font-bold text-[#A2A6AB82] line-through">
                    {formatPrice(normalized.price)}
                  </span>
                )}
                <span className="text-[16px] font-bold text-[#DA9811]">
                  {formatPrice(normalized.displayPrice)}
                </span>
              </div>
              <p className="text-[12px] font-bold text-[#A2A6AB]">
                Availability:{' '}
                <span
                  className={`ml-2 text-[12px] ${
                    normalized.stock > 0
                      ? 'text-[#FF3B30]'
                      : 'text-[#A2A6AB]'
                  }`}
                >
                  {normalized.stock > 0
                    ? `Only ${normalized.stock} left in stock`
                    : 'Out of stock'}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-4 border-t border-b border-[#1A1A1A] py-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-[#141412] text-[#A2A6AB] transition-opacity active:opacity-80"
                  aria-label="Decrease quantity"
                >
                  <span className="text-xl leading-none font-bold">−</span>
                </button>
                <span
                  className="flex h-[48px] w-[86px] min-w-[3rem] items-center justify-center rounded-[6px] bg-[#141412] px-5 text-base font-bold text-[#A2A6AB]"
                  aria-live="polite"
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-[#141412] text-[#A2A6AB] transition-opacity active:opacity-80"
                  aria-label="Increase quantity"
                >
                  <span className="text-xl leading-none font-bold">+</span>
                </button>
              </div>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={normalized.stock < 1 || isAddingToCart}
                className="flex flex-1 items-center justify-center gap-2 rounded-[6px] bg-[#DA9811] py-3.5 text-base text-[16px] font-semibold text-black transition-opacity active:opacity-90 disabled:opacity-50"
              >
                <img
                  src={shoppingCartIcon}
                  alt=""
                  className="h-6 w-6 shrink-0"
                  aria-hidden
                />
                {isAddingToCart ? 'Adding…' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {normalized.description && (
        <section className="hidden lg:block pt-2">
          <h3 className="mb-2 text-[12px] font-bold tracking-wide text-[#A2A6AB] uppercase">
            Features
          </h3>
          <div
            className="product-description text-[14px] text-[#A2A6AB]"
            dangerouslySetInnerHTML={{ __html: normalized.description }}
          />
        </section>
      )}
    </Container>
  );
}
