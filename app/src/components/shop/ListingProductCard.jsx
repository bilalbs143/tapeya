import { memo } from 'react';

import { Link } from 'react-router-dom';

import { useAddToCart } from '@/hooks/shop/useAddToCart';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { formatPrice } from '@/lib/format';

const productCartIcon = `${CLOUDFRONT_APP_BASE}/images/icons/product-cart-icon.svg`;

function ListingProductCardInner({ product, brandSlug }) {
  const { addingProductId, handleAddToCartForCard } = useAddToCart();
  const isThisCardAdding = addingProductId === product.id;
  const stock = product.stock_quantity ?? 0;
  const imageUrl = product.images?.[0]?.path;
  const hasDiscount = product.sale_price != null && product.sale_price < product.price;
  const discountPercent = hasDiscount && product.price > 0 ? Math.round((1 - product.sale_price / product.price) * 100) : 0;

  const content = (
    <>
      <div className="relative h-[138px] bg-white">
        {imageUrl ? (
          <img src={imageUrl} alt={product.images?.[0]?.alt ?? product.name} className="h-full w-full object-contain p-2" />
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
        <p className="line-clamp-2 shrink-0 text-[13px] leading-snug font-medium text-white">{product.name}</p>
        <div className="mt-auto flex min-h-[2.75rem] shrink-0 items-end justify-between gap-2">
          <div className="flex min-w-0 flex-col justify-end gap-0.5">
            {hasDiscount ? (
              <>
                <span className="text-[11px] text-[#A2A6AB] line-through">{formatPrice(product.price)}</span>
                <span className="text-base font-bold text-[#DA9811]">{formatPrice(product.sale_price)}</span>
              </>
            ) : (
              <span className="text-base font-bold text-[#DA9811]">{formatPrice(product.price)}</span>
            )}
          </div>
          <button
            type="button"
            onClick={(e) => handleAddToCartForCard(e, product.id)}
            disabled={stock < 1 || isThisCardAdding}
            className="flex shrink-0 items-center gap-0.5 rounded p-1 transition-opacity active:opacity-80 disabled:opacity-50"
            aria-label={`Add ${product.name} to cart`}
          >
            <svg
              className="h-3 w-3 font-bold text-[#DA9811]"
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

  return <article className="flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[17px] bg-[#1a1a18]">{content}</article>;
}

export const ListingProductCard = memo(ListingProductCardInner);
ListingProductCard.displayName = 'ListingProductCard';
