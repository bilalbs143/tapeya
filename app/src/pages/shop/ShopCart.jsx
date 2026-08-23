import { memo, useCallback, useMemo } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { formatPrice, toNumber } from '@/lib/format';
import { buildShopVendorPath } from '@/lib/shopPaths';
import { useGetCartQuery, useRemoveCartItemMutation, useUpdateCartItemMutation } from '@/store/api/shopApi';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { ListEmpty } from '@/ui/ListState';
import { PageLoader } from '@/ui/Loader';
import {
  Select,
  SelectContent,
  selectContentInputClass,
  SelectItem,
  selectItemInputClass,
  SelectTrigger,
  SelectValue,
  selectViewportInputClass,
} from '@/ui/Select';

const qtySelectTriggerClass =
  '!h-8 !w-[4.25rem] !min-w-0 !rounded-[6px] !border-0 !bg-surface !px-2 !py-1 !text-[12px] !text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF9700]/50 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:!text-[12px] [&>span]:!text-white [&_svg]:!text-white';

const CartItemCard = memo(function CartItemCard({ item, onUpdateQty, onRemove, isUpdating }) {
  const imageUrl = item.product?.images?.[0]?.path;
  const name = item.product?.name ?? 'Product';

  return (
    <div className="bg-surface flex gap-3 rounded-2xl p-4">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white">
        {imageUrl ? (
          <img src={imageUrl} alt={item.product?.images?.[0]?.alt ?? name} className="h-full w-full object-contain p-1.5" />
        ) : (
          <div className="bg-surface h-full w-full" aria-hidden />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
        <p className="text-[14px] font-normal text-white">{name}</p>
        <p className="text-brand text-[14px] font-bold">
          {formatPrice(item.price_snapshot)} <span className="font-normal text-white">x {item.quantity}</span>
        </p>
        <div className="mt-1 flex items-center gap-2">
          <Select
            value={String(item.quantity)}
            onValueChange={(v) => {
              const qty = parseInt(v, 10);
              if (qty >= 1) onUpdateQty(item.id, qty);
            }}
            disabled={isUpdating}
          >
            <SelectTrigger className={qtySelectTriggerClass} aria-label="Quantity">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={selectContentInputClass} viewportClassName={selectViewportInputClass} position="popper">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <SelectItem
                  key={n}
                  value={String(n)}
                  className={selectItemInputClass}
                  textClassName="!text-white"
                  indicatorClassName="!text-white"
                >
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            disabled={isUpdating}
            className="text-muted text-[12px] underline transition-opacity hover:text-white disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
});

export default function ShopCart() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: cart, isLoading } = useGetCartQuery();
  const [updateItem, { isLoading: isUpdating }] = useUpdateCartItemMutation();
  const [removeItem] = useRemoveCartItemMutation();

  const items = cart?.items ?? [];
  const vendorGroups = useMemo(() => {
    if (Array.isArray(cart?.vendor_groups) && cart.vendor_groups.length > 0) {
      return cart.vendor_groups;
    }
    if (items.length === 0) return [];
    return [{ vendor: null, items, subtotal: null }];
  }, [cart?.vendor_groups, items]);

  const subtotalFromApi = toNumber(cart?.subtotal);
  const subtotalFromItems = items.reduce((sum, i) => sum + toNumber(i.price_snapshot) * Math.max(0, toNumber(i.quantity)), 0);
  const subtotal = subtotalFromApi > 0 ? subtotalFromApi : subtotalFromItems;
  const shipping = toNumber(cart?.shipping_amount ?? cart?.shipping);
  const discount = toNumber(cart?.discount_amount ?? cart?.discount);
  const computedTotal = Math.max(0, subtotal + shipping - discount);
  const apiTotal = toNumber(cart?.total);
  const grandTotal = Math.max(0, Number.isFinite(apiTotal) && apiTotal > 0 ? apiTotal : computedTotal);

  const handleUpdateQty = useCallback(
    (cartItemId, quantity) => {
      updateItem({ cartItemId, quantity })
        .unwrap()
        .then(() => toast.success('Cart updated'))
        .catch((err) => toast.error(getApiErrorMessage(err, 'Could not update cart. Try again.')));
    },
    [updateItem, toast],
  );

  const handleRemove = useCallback(
    (cartItemId) => {
      removeItem(cartItemId)
        .unwrap()
        .then(() => toast.success('Item removed'))
        .catch((err) => toast.error(getApiErrorMessage(err, 'Could not remove item. Try again.')));
    },
    [removeItem, toast],
  );

  const emptyCart = !isLoading && items.length === 0;

  return (
    <div className="flex flex-1 flex-col bg-black">
      <AppSubpageHeader title="SELECTED ITEMS" />
      <Container fullWidth className="flex flex-1 flex-col">
        {isLoading ? (
          <PageLoader label="Loading cart" className="flex-1 py-16" />
        ) : emptyCart ? (
          <ListEmpty
            title="Your Cart Is Empty."
            description="Browse the shop and add items to continue."
            action={
              <Button type="button" variant="orange" onClick={() => navigate('/shop')}>
                Continue Shopping
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-3 pb-28 lg:flex-row lg:items-start lg:gap-6 lg:pb-0">
            <div className="min-w-0 flex-1 space-y-5">
              {vendorGroups.map((group, groupIndex) => {
                const storeName = group.vendor?.store_name;
                const storeSlug = group.vendor?.slug;
                const groupKey = group.vendor?.id ?? `flat-${groupIndex}`;
                const groupSubtotal = toNumber(group.subtotal);
                const groupItems = group.items ?? [];

                return (
                  <section key={groupKey} className="space-y-3">
                    {storeName && (
                      <div className="flex items-baseline justify-between gap-3 px-0.5">
                        <h2 className="min-w-0 text-[13px] font-bold tracking-wide text-white uppercase">
                          {storeSlug ? (
                            <Link
                              to={buildShopVendorPath(storeSlug)}
                              className="text-brand transition-opacity hover:opacity-80 active:opacity-80"
                            >
                              {storeName}
                            </Link>
                          ) : (
                            storeName
                          )}
                        </h2>
                        {groupSubtotal > 0 && (
                          <span className="text-muted shrink-0 text-[12px] font-medium">{formatPrice(groupSubtotal)}</span>
                        )}
                      </div>
                    )}
                    {groupItems.map((item) => (
                      <CartItemCard
                        key={item.id}
                        item={item}
                        onUpdateQty={handleUpdateQty}
                        onRemove={handleRemove}
                        isUpdating={isUpdating}
                      />
                    ))}
                  </section>
                );
              })}
            </div>

            <div className="lg:sticky lg:top-20 lg:w-[320px] lg:shrink-0">
              <div className="bg-surface rounded-2xl p-4 shadow-sm">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted text-[14px] font-medium">Subtotal:</span>
                    <span className="text-[14px] font-bold text-white">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted text-[14px] font-medium">Shipping:</span>
                    <span className="text-[14px] font-bold text-white">{formatPrice(shipping)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted text-[14px] font-medium">Discount:</span>
                    <span className="text-[14px] font-bold text-white">{formatPrice(discount)}</span>
                  </div>
                </div>

                <div className="mt-4 hidden border-t border-white/10 pt-4 lg:block">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[12px] font-normal text-white">Grand Total:</p>
                      <p className="text-brand text-[18px] font-bold">{formatPrice(grandTotal)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/shop/checkout')}
                      className="bg-brand shrink-0 rounded-[6px] px-6 py-3 text-[14px] font-bold tracking-wide text-black transition-opacity hover:opacity-95 active:opacity-90 lg:px-8 lg:py-3.5"
                    >
                      Checkout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>

      {!emptyCart && !isLoading && (
        <footer className="fixed right-0 bottom-20 left-0 z-30 bg-black px-4 pt-4 pb-4 lg:hidden">
          <div className="bg-surface flex w-full items-center justify-between gap-4 rounded-[17px] p-4">
            <div>
              <p className="text-[12px] font-normal text-white">Grand Total:</p>
              <p className="text-brand text-[18px] font-bold">{formatPrice(grandTotal)}</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/shop/checkout')}
              className="bg-brand shrink-0 rounded-[6px] px-8 py-3.5 text-[14px] font-bold tracking-wide text-black transition-opacity active:opacity-90"
            >
              Checkout
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
