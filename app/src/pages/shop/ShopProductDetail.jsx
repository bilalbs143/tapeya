import { useEffect, useMemo, useState } from 'react';

import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { ShopContactCard } from '@/components/shop/ShopContactCard';
import { useToast } from '@/hooks/useToast';
import { AppEventParams, AppEvents, logEvent } from '@/lib/analytics/facebook';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { formatPrice } from '@/lib/format';
import { buildShopVendorPath } from '@/lib/shopPaths';
import { useAddCartItemMutation, useGetProductQuery } from '@/store/api/shopApi';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { ListEmpty, ListError } from '@/ui/ListState';
import { Loader, PageLoader } from '@/ui/Loader';

const shoppingCartIcon = `${CLOUDFRONT_APP_BASE}/images/icons/shopping-cart.svg`;

function getImageUrls(images) {
  if (!images?.length) return [];
  return images.map((img) => img.path ?? img).filter(Boolean);
}

export default function ShopProductDetail() {
  const { vendorSlug, productSlug } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const {
    data: product,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetProductQuery({
    slug: productSlug,
    vendor: vendorSlug,
  });
  const toast = useToast();
  const [addToCart, { isLoading: isAddingToCart }] = useAddCartItemMutation();

  const normalized = useMemo(() => {
    if (!product) return null;
    const imageUrls = getImageUrls(product.images);
    const displayPrice = product.sale_price ?? product.price;
    const hasDiscount = product.sale_price != null && product.sale_price < product.price;
    const discountPercent = hasDiscount && product.price > 0 ? Math.round((1 - product.sale_price / product.price) * 100) : 0;
    return {
      ...product,
      imageUrls: imageUrls.length ? imageUrls : [],
      categoryName:
        typeof product.category === 'object' && product.category?.name ? product.category.name : (product.category ?? 'Product'),
      displayPrice,
      hasDiscount,
      discountPercent,
      stock: product.stock_quantity ?? 0,
      isLowStock: (product.stock_quantity ?? 0) > 0 && (product.stock_quantity ?? 0) <= (product.low_stock_threshold ?? 5),
    };
  }, [product]);

  const backTo = state?.from ?? `/shop/${vendorSlug}`;

  const handleAddToCart = async () => {
    if (!normalized?.id) return;
    try {
      await addToCart({ product_id: normalized.id, quantity }).unwrap();
      toast.success('Added to cart');
      logEvent(
        AppEvents.ADDED_TO_CART,
        {
          [AppEventParams.CONTENT_ID]: String(normalized.id),
          [AppEventParams.CONTENT_TYPE]: normalized.categoryName,
          [AppEventParams.CURRENCY]: 'PKR',
        },
        normalized.displayPrice * quantity,
      );
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not add to cart. Try again.'));
    }
  };

  useEffect(() => {
    if (!normalized?.id) return;
    logEvent(AppEvents.VIEWED_CONTENT, {
      [AppEventParams.CONTENT_ID]: String(normalized.id),
      [AppEventParams.CONTENT_TYPE]: normalized.categoryName,
    });
  }, [normalized?.id]);

  if (isLoading) {
    return (
      <div className="bg-black">
        <AppSubpageHeader title="SHOP" onBack={() => navigate(backTo)} />
        <Container>
          <PageLoader label="Loading product" className="min-h-[40vh] py-12" />
        </Container>
      </div>
    );
  }

  if (isError || !normalized) {
    return (
      <div className="bg-black">
        <AppSubpageHeader title="SHOP" onBack={() => navigate(backTo)} />
        <Container>
          {isError ? (
            <ListError message={error?.data?.message ?? 'Could not load product.'} onRetry={() => refetch()} />
          ) : (
            <ListEmpty
              title="Product Not Found."
              action={
                <Button type="button" variant="orange" onClick={() => navigate(backTo)}>
                  Go Back
                </Button>
              }
            />
          )}
        </Container>
      </div>
    );
  }

  const mainImage = normalized.imageUrls[selectedImage] ?? normalized.imageUrls[0];
  const availabilityText = normalized.stock > 0 ? `Only ${normalized.stock} left in stock` : 'Out of stock';
  const availabilityClass = normalized.isLowStock ? 'text-[#FF3B30]' : 'text-muted';

  return (
    <div className="bg-black">
      <AppSubpageHeader
        onBack={() => navigate(backTo)}
        title={
          <h1 className="min-w-0 text-[16px] font-bold tracking-wide uppercase">
            <span className="text-white">SHOP - </span>
            <span className="text-brand">{normalized.categoryName}</span>
          </h1>
        }
      />
      <Container>
        <div className="flex flex-col gap-4">
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
                  <div className="bg-surface aspect-square w-full" aria-hidden />
                )}
                {normalized.is_featured && (
                  <span className="bg-brand absolute top-3 left-3 rounded-full px-4 py-1 text-[12px] font-bold text-black uppercase">
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
                      className={`h-[45px] w-[45px] shrink-0 overflow-hidden rounded-full border-2 bg-white ${selectedImage === i ? 'border-brand' : 'border-transparent'}`}
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
                  <span className="text-[16px] font-bold text-[#A2A6AB82] line-through">{formatPrice(normalized.price)}</span>
                )}
                <span className="text-brand text-[16px] font-bold">{formatPrice(normalized.displayPrice)}</span>
              </div>
              <p className="text-muted text-[12px] font-bold">
                Availability: <span className={`ml-1 text-[12px] ${availabilityClass}`}>{availabilityText}</span>
              </p>
            </div>

            <div className="border-surface-border flex items-center gap-4 border-t border-b py-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="bg-surface text-muted flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full transition-opacity active:opacity-80"
                  aria-label="Decrease Quantity"
                >
                  <span className="text-xl leading-none font-bold">−</span>
                </button>
                <span
                  className="bg-surface text-muted flex h-[48px] w-[86px] min-w-[3rem] items-center justify-center rounded-[6px] px-5 text-base font-bold"
                  aria-live="polite"
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="bg-surface text-muted flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full transition-opacity active:opacity-80"
                  aria-label="Increase Quantity"
                >
                  <span className="text-xl leading-none font-bold">+</span>
                </button>
              </div>
              <Button
                type="button"
                variant="orange"
                onClick={handleAddToCart}
                disabled={normalized.stock < 1 || isAddingToCart}
                className="flex-1 gap-2 py-3.5 text-[16px]"
              >
                {isAddingToCart ? (
                  <Loader size="xs" tone="ink" />
                ) : (
                  <img src={shoppingCartIcon} alt="" className="h-6 w-6 shrink-0" aria-hidden />
                )}
                Add to Cart
              </Button>
            </div>

            {normalized.vendor?.store_name ? (
              <ShopContactCard
                name={normalized.vendor.store_name}
                phone={normalized.vendor.phone}
                href={buildShopVendorPath(normalized.vendor.slug)}
              />
            ) : null}

            {normalized.description && (
              <section className="pt-2">
                <h3 className="text-muted mb-2 text-[12px] font-bold tracking-wide uppercase">Features</h3>
                <div
                  className="product-description text-muted text-[14px]"
                  dangerouslySetInnerHTML={{ __html: normalized.description }}
                />
              </section>
            )}
          </div>

          {/* Desktop layout: left image; right details (top) + counter/button */}
          <div className="hidden lg:grid lg:grid-cols-2 lg:items-center lg:gap-8">
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-t-[17px] bg-white">
                  {mainImage ? (
                    <img
                      src={mainImage}
                      alt={normalized.images?.[selectedImage]?.alt ?? normalized.name}
                      className="aspect-square h-[280px] w-full object-contain"
                    />
                  ) : (
                    <div className="bg-surface aspect-square w-full" aria-hidden />
                  )}
                  {normalized.is_featured && (
                    <span className="bg-brand absolute top-3 left-3 rounded-full px-4 py-1 text-[12px] font-bold text-black uppercase">
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
                        className={`h-[45px] w-[45px] shrink-0 overflow-hidden rounded-full border-2 bg-white ${selectedImage === i ? 'border-brand' : 'border-transparent'}`}
                        aria-label={`View image ${i + 1}`}
                      >
                        <img src={url} alt="" className="h-full w-full object-cover" />
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
                    <span className="text-[16px] font-bold text-[#A2A6AB82] line-through">{formatPrice(normalized.price)}</span>
                  )}
                  <span className="text-brand text-[16px] font-bold">{formatPrice(normalized.displayPrice)}</span>
                </div>
                <p className="text-muted text-[12px] font-bold">
                  Availability: <span className={`ml-1 text-[12px] ${availabilityClass}`}>{availabilityText}</span>
                </p>
              </div>

              <div className="border-surface-border flex items-center gap-4 border-t border-b py-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="bg-surface text-muted flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full transition-opacity active:opacity-80"
                    aria-label="Decrease Quantity"
                  >
                    <span className="text-xl leading-none font-bold">−</span>
                  </button>
                  <span
                    className="bg-surface text-muted flex h-[48px] w-[86px] min-w-[3rem] items-center justify-center rounded-[6px] px-5 text-base font-bold"
                    aria-live="polite"
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="bg-surface text-muted flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full transition-opacity active:opacity-80"
                    aria-label="Increase Quantity"
                  >
                    <span className="text-xl leading-none font-bold">+</span>
                  </button>
                </div>
                <Button
                  type="button"
                  variant="orange"
                  onClick={handleAddToCart}
                  disabled={normalized.stock < 1 || isAddingToCart}
                  className="flex-1 gap-2 py-3.5 text-[16px]"
                >
                  {isAddingToCart ? (
                    <Loader size="xs" tone="ink" />
                  ) : (
                    <img src={shoppingCartIcon} alt="" className="h-6 w-6 shrink-0" aria-hidden />
                  )}
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>

        {normalized.vendor?.store_name ? (
          <div className="mt-4 hidden lg:block">
            <ShopContactCard
              name={normalized.vendor.store_name}
              phone={normalized.vendor.phone}
              href={buildShopVendorPath(normalized.vendor.slug)}
            />
          </div>
        ) : null}

        {normalized.description && (
          <section className="hidden pt-2 lg:block">
            <h3 className="text-muted mb-2 text-[12px] font-bold tracking-wide uppercase">Features</h3>
            <div
              className="product-description text-muted text-[14px]"
              dangerouslySetInnerHTML={{ __html: normalized.description }}
            />
          </section>
        )}
      </Container>
    </div>
  );
}
