import { Link } from 'react-router-dom';

import { Button } from '@/shared/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select';
import { StickyActionBar } from '@/shared/ui/StickyActionBar';

import { CART_QTY_OPTIONS, cartVendorGroupKey } from '../lib/cartPage';
import { formatPkr } from '../lib/money';
import { shopPaths } from '../lib/shopPaths';
import { MoneyRows } from './MoneyRows';
import type { useCartPage } from './useCartPage';

type CartFlow = ReturnType<typeof useCartPage>;

type CartPageBodyProps = {
  flow: CartFlow;
};

/** Vendor groups, qty/remove controls, summary, sticky checkout. */
export function CartPageBody({ flow }: CartPageBodyProps) {
  const { groups, totals, checkoutLabel, setQty, remove, goCheckout } = flow;

  return (
    <>
      <div className="flex flex-col gap-3 px-4 pt-3.5 pb-4">
        {groups.map((group) => {
          const key = cartVendorGroupKey(group.vendor);
          return (
            <section key={key} className="border-border-subtle bg-surface overflow-hidden rounded-card border">
              <div className="border-border-subtle flex items-center gap-2 border-b px-3.5 py-2.5">
                <span className="min-w-0 flex-1 truncate text-2xs leading-normal font-bold text-body">
                  {group.vendor?.storeName ?? 'Store'}
                </span>
                <span className="text-dim font-mono text-3xs font-semibold tabular-nums">
                  {formatPkr(group.subtotal)}
                </span>
              </div>

              <ul className="divide-border-subtle flex flex-col divide-y">
                {group.items.map((l) => {
                  const thumb = l.product?.imageUrls[0];
                  const name = l.product?.name ?? 'Product';
                  const detailTo = shopPaths.product({
                    slug: l.product?.slug,
                    vendor: l.product?.vendor ?? l.vendor,
                  });
                  return (
                    <li key={l.id} className="flex gap-3 p-3.5">
                      <Link
                        to={detailTo}
                        className="bg-surface-raised h-16 w-16 shrink-0 overflow-hidden rounded-panel"
                      >
                        {thumb ? <img src={thumb} alt="" className="h-full w-full object-cover" /> : null}
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <Link to={detailTo} className="line-clamp-2 text-xs leading-snug font-bold text-ink">
                          {name}
                        </Link>
                        <span className="font-mono text-2xs font-semibold text-muted tabular-nums">
                          {formatPkr(l.priceSnapshot)} × {l.quantity} ={' '}
                          <span className="text-ink">{formatPkr(l.lineTotal)}</span>
                        </span>

                        <div className="mt-0.5 flex items-center gap-2.5">
                          <Select value={String(l.quantity)} onValueChange={(v) => void setQty(l.id, Number(v))}>
                            <SelectTrigger
                              aria-label={`Quantity for ${name}`}
                              className="bg-surface-raised h-8 min-w-14 rounded-icon px-2.5 text-xs font-semibold"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CART_QTY_OPTIONS.map((n) => (
                                <SelectItem key={n} value={String(n)}>
                                  {n}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <button
                            type="button"
                            onClick={() => void remove(l.id)}
                            className="text-muted hover:text-danger-soft text-2xs font-bold"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}

        <section className="border-border-subtle bg-surface rounded-card border p-4">
          <h2 className="font-mono mb-3 text-2xs font-bold tracking-eyebrow text-ink uppercase">Order Summary</h2>
          <MoneyRows
            rows={[
              ['Subtotal', formatPkr(totals.subtotal)],
              ['Shipping', formatPkr(totals.shipping)],
            ]}
            total={formatPkr(totals.total)}
          />
        </section>
      </div>

      <StickyActionBar>
        <Button className="w-full font-bold" onClick={goCheckout}>
          {checkoutLabel}
        </Button>
      </StickyActionBar>
    </>
  );
}
