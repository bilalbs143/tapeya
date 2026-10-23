import { Link } from 'react-router-dom';

import { Button } from '@/shared/ui/Button';
import { SafeHtml } from '@/shared/ui/SafeHtml';
import { StickyActionBar } from '@/shared/ui/StickyActionBar';

import { shopPaths } from '../lib/shopPaths';
import { QuantityStepper } from './QuantityStepper';
import { SellerContactCard } from './SellerContactCard';
import type { useProductDetail } from './useProductDetail';

type ProductDetailFlow = ReturnType<typeof useProductDetail>;

type ProductDetailBodyProps = {
  flow: ProductDetailFlow;
};

/** Gallery, price/stock, description, qty, seller card, sticky add-to-cart. */
export function ProductDetailBody({ flow }: ProductDetailBodyProps) {
  const { product, shot, setShot, qty, setQty, oos, maxQty, stockLabel, stockToneClass, addLabel, adding, add } = flow;

  if (!product) return null;

  return (
    <>
      <div className="flex flex-col pb-4">
        <div className="bg-surface-raised relative h-64 overflow-hidden">
          {product.imageUrls[shot] ? (
            <img src={product.imageUrls[shot]} alt={product.name} className="h-full w-full object-cover" />
          ) : null}
          {product.isFeatured || product.discountPercent ? (
            <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
              {product.isFeatured ? (
                <span className="bg-brand font-mono rounded-chip px-2 py-1 text-4xs leading-normal font-bold tracking-[.1em] text-white uppercase">
                  Featured
                </span>
              ) : null}
              {product.discountPercent ? (
                <span className="bg-danger font-mono rounded-chip px-2 py-1 text-4xs leading-normal font-bold tracking-[.1em] text-white">
                  −{product.discountPercent}%
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {product.imageUrls.length > 1 ? (
          <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pt-2.5">
            {product.imageUrls.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setShot(i)}
                aria-label={`Image ${i + 1}`}
                aria-current={i === shot}
                className={`h-14 w-14 shrink-0 overflow-hidden rounded-panel border-2 ${
                  i === shot ? 'border-brand' : 'border-transparent opacity-60'
                }`}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        ) : null}

        <div className="flex flex-col px-4 pt-4">
          <h1 className="text-title-sm leading-snug font-extrabold text-ink">{product.name}</h1>
          {product.brandName && product.brandSlug ? (
            <Link
              to={shopPaths.brand(product.brandSlug)}
              className="text-brand-text mt-1.5 inline-block text-2xs font-bold"
            >
              {product.brandName}
            </Link>
          ) : product.brandName ? (
            <p className="text-muted mt-1.5 text-2xs font-semibold">{product.brandName}</p>
          ) : null}

          <div className="mt-2.5 flex items-baseline gap-2.5">
            <span className="font-mono text-display-sm leading-normal font-extrabold text-ink tabular-nums">
              {product.priceLabel}
            </span>
            {product.compareAtLabel ? (
              <span className="text-dim font-mono text-body-sm line-through tabular-nums">
                {product.compareAtLabel}
              </span>
            ) : null}
          </div>

          <p className={`mt-2.5 text-2xs leading-normal font-bold ${stockToneClass}`} aria-live="polite">
            {stockLabel}
          </p>

          {product.description ? (
            <SafeHtml
              profile="product"
              html={product.description}
              className="text-body mt-3 text-2xs leading-relaxed [&_a]:text-brand-text [&_a]:underline [&_h3]:mt-3 [&_h3]:mb-1.5 [&_h3]:text-xs [&_h3]:font-bold [&_h3]:text-ink [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-4 [&_p+p]:mt-2 [&_strong]:font-bold [&_strong]:text-ink [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-4"
            />
          ) : null}

          {!oos ? (
            <div className="mt-4 flex items-center gap-3">
              <span className="font-mono text-3xs font-bold tracking-[.12em] text-muted uppercase">Qty</span>
              <QuantityStepper value={qty} max={maxQty} onChange={setQty} />
            </div>
          ) : null}

          <SellerContactCard vendor={product.vendor} className="mt-4" />
        </div>
      </div>

      <StickyActionBar>
        <Button className="w-full font-bold" disabled={oos || adding} loading={adding} onClick={() => void add()}>
          {addLabel}
        </Button>
      </StickyActionBar>
    </>
  );
}
