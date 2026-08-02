import { Link } from 'react-router-dom';

import { formatPrice } from '@/lib/format';

function FeedShopProductCard({ product, brandSlug }) {
  const detailPath = brandSlug && product.slug ? `/shop/${brandSlug}/product/${product.slug}` : '/shop';
  const image = product.images?.[0];
  const hasDiscount = product.sale_price != null && Number(product.sale_price) < Number(product.price);
  const price = hasDiscount ? product.sale_price : product.price;

  return (
    <Link
      to={detailPath}
      className="group/product flex min-w-0 flex-col overflow-hidden rounded-[14px] border border-white/8 bg-transparent transition-transform active:scale-[0.98]"
      aria-label={`View ${product.name}`}
    >
      <div className="relative aspect-square overflow-hidden bg-white">
        {image?.path ? (
          <img
            src={image.path}
            alt={image.alt ?? product.name}
            className="h-full w-full object-contain p-1.5 transition-transform duration-300 group-hover/product:scale-105"
          />
        ) : (
          <div className="bg-surface-raised h-full w-full" aria-hidden />
        )}
        {hasDiscount ? (
          <span className="absolute top-1.5 right-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[8px] font-bold text-white uppercase">
            Sale
          </span>
        ) : null}
      </div>

      <div className="flex min-h-[78px] flex-1 flex-col p-2 sm:min-h-[88px] sm:p-2.5">
        <p className="line-clamp-2 text-[10px] leading-snug font-semibold text-white sm:text-[12px]">{product.name}</p>
        <div className="mt-auto pt-2">
          {hasDiscount ? (
            <span className="text-muted block truncate text-[8px] leading-none line-through sm:text-[10px]">
              {formatPrice(product.price)}
            </span>
          ) : null}
          <span className="text-brand block truncate text-[14px] leading-tight font-bold sm:text-[16px]">
            {formatPrice(price)}
          </span>
        </div>
      </div>
    </Link>
  );
}

/**
 * Compact commerce recommendation inserted between social posts.
 *
 * @param {{
 *   title: string,
 *   products: Array<object>,
 *   brands: Array<{ id: number|string, slug?: string }>,
 * }} props
 */
export function FeedShopWidget({ title, products, brands }) {
  if (!products.length) return null;

  const brandSlugById = new Map(brands.map((brand) => [String(brand.id), brand.slug]));

  return (
    <section className="bg-surface overflow-hidden px-4 py-3.5">
      <header className="mb-3 flex items-center justify-between gap-3">
        <p className="truncate text-[14px] font-bold text-white">{title}</p>
        <Link to="/shop" className="text-brand shrink-0 text-[12px] font-semibold transition-opacity hover:opacity-80">
          View More
        </Link>
      </header>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {products.slice(0, 3).map((product) => (
          <FeedShopProductCard key={product.id} product={product} brandSlug={brandSlugById.get(String(product.brand_id))} />
        ))}
      </div>
    </section>
  );
}
