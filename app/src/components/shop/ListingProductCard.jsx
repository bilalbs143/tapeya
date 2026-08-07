import { memo } from 'react';

import { Link } from 'react-router-dom';

import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { formatPrice } from '@/lib/format';

const productCartIcon = `${CLOUDFRONT_APP_BASE}/images/icons/product-cart-icon.svg`;

function ListingProductCardInner({ product, brandSlug }) {
  const resolvedBrandSlug = brandSlug ?? product.brand?.slug;
  const detailPath = resolvedBrandSlug && product.slug ? `/shop/${resolvedBrandSlug}/product/${product.slug}` : null;
  const imageUrl = product.images?.[0]?.path;
  const hasDiscount = product.sale_price != null && product.sale_price < product.price;
  const discountPercent = hasDiscount && product.price > 0 ? Math.round((1 - product.sale_price / product.price) * 100) : 0;
  const vendor = product.vendor;
  const vendorSlug = vendor?.slug;
  const vendorStoreName = vendor?.store_name;

  const media = (
    <div className="relative h-[138px] bg-white">
      {imageUrl ? (
        <img src={imageUrl} alt={product.images?.[0]?.alt ?? product.name} className="h-full w-full object-contain p-2" />
      ) : (
        <div className="bg-surface h-full w-full" aria-hidden />
      )}
      {product.is_featured && (
        <span className="bg-brand absolute top-2 left-2 rounded-full px-2 py-0.5 text-[11px] font-bold text-black uppercase">
          Featured
        </span>
      )}
      {hasDiscount && discountPercent > 0 && (
        <span className="absolute top-2 right-2 rounded-full bg-[#FF3B30] px-2 py-0.5 text-[11px] font-bold text-white">
          -{discountPercent}%
        </span>
      )}
    </div>
  );

  const body = (
    <div className="flex min-h-[110px] flex-col p-3">
      <p className="line-clamp-2 shrink-0 text-[13px] leading-snug font-medium text-white">{product.name}</p>
      {vendorStoreName && vendorSlug && (
        <Link
          to={`/shop/vendors/${vendorSlug}`}
          onClick={(e) => e.stopPropagation()}
          className="text-muted hover:text-brand relative z-10 mt-1 line-clamp-1 text-[11px] transition-colors"
        >
          Sold by {vendorStoreName}
        </Link>
      )}
      <div className="mt-auto flex min-h-[2.75rem] shrink-0 items-end justify-between gap-2">
        <div className="flex min-w-0 flex-col justify-end gap-0.5">
          {hasDiscount ? (
            <>
              <span className="text-muted text-[11px] line-through">{formatPrice(product.price)}</span>
              <span className="text-brand text-base font-bold">{formatPrice(product.sale_price)}</span>
            </>
          ) : (
            <span className="text-brand text-base font-bold">{formatPrice(product.price)}</span>
          )}
        </div>
        {detailPath && (
          <span className="flex shrink-0 items-center gap-0.5 rounded p-1" aria-hidden>
            <svg className="text-brand h-3 w-3 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <img src={productCartIcon} alt="" className="h-[17px] w-[17px]" />
          </span>
        )}
      </div>
    </div>
  );

  // Outer article + overlay product link avoids nesting Sold-by <Link> inside product <Link>.
  if (detailPath) {
    return (
      <article className="bg-surface-elevated relative flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[17px]">
        <Link
          to={detailPath}
          className="absolute inset-0 z-0 transition-opacity active:opacity-90"
          aria-label={`View ${product.name}`}
        />
        <div className="pointer-events-none relative z-[1] flex flex-1 flex-col">
          {media}
          <div className="flex min-h-[110px] flex-col p-3">
            <p className="line-clamp-2 shrink-0 text-[13px] leading-snug font-medium text-white">{product.name}</p>
            {vendorStoreName && vendorSlug ? (
              <span className="pointer-events-auto mt-1">
                <Link
                  to={`/shop/vendors/${vendorSlug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-muted hover:text-brand relative z-10 line-clamp-1 text-[11px] transition-colors"
                >
                  Sold by {vendorStoreName}
                </Link>
              </span>
            ) : null}
            <div className="mt-auto flex min-h-[2.75rem] shrink-0 items-end justify-between gap-2">
              <div className="flex min-w-0 flex-col justify-end gap-0.5">
                {hasDiscount ? (
                  <>
                    <span className="text-muted text-[11px] line-through">{formatPrice(product.price)}</span>
                    <span className="text-brand text-base font-bold">{formatPrice(product.sale_price)}</span>
                  </>
                ) : (
                  <span className="text-brand text-base font-bold">{formatPrice(product.price)}</span>
                )}
              </div>
              <span className="flex shrink-0 items-center gap-0.5 rounded p-1" aria-hidden>
                <svg
                  className="text-brand h-3 w-3 font-bold"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <img src={productCartIcon} alt="" className="h-[17px] w-[17px]" />
              </span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="bg-surface-elevated flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[17px]">
      {media}
      {body}
    </article>
  );
}

export const ListingProductCard = memo(ListingProductCardInner);
ListingProductCard.displayName = 'ListingProductCard';
