import { memo, useCallback } from 'react';

import { useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { useToast } from '@/hooks/useToast';
import { formatPrice, toNumber } from '@/lib/format';
import {
  useGetCartQuery,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from '@/store/api/shopApi';
import { Container } from '@/ui/Container';

const CartItemCard = memo(function CartItemCard({
  item,
  onUpdateQty,
  onRemove,
  isUpdating,
}) {
  const imageUrl = item.product?.images?.[0]?.path;
  const name = item.product?.name ?? 'Product';

  return (
    <div className="flex gap-3 rounded-2xl bg-[#141412] p-4">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.product?.images?.[0]?.alt ?? name}
            className="h-full w-full object-contain p-1.5"
          />
        ) : (
          <div className="h-full w-full bg-[#141412]" aria-hidden />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
        <p className="text-[14px] font-normal text-white">{name}</p>
        <p className="text-[14px] font-bold text-[#DA9811]">
          {formatPrice(item.price_snapshot)}{' '}
          <span className="font-normal text-white">x {item.quantity}</span>
        </p>
        <div className="mt-1 flex items-center gap-2">
          <select
            value={item.quantity}
            onChange={(e) => {
              const qty = parseInt(e.target.value, 10);
              if (qty >= 1) onUpdateQty(item.id, qty);
            }}
            disabled={isUpdating}
            className="rounded bg-[#141412] px-2 py-1 text-[12px] text-white"
            aria-label="Quantity"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            disabled={isUpdating}
            className="text-[12px] text-[#A2A6AB] underline transition-opacity hover:text-white disabled:opacity-50"
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
  const subtotalFromApi = toNumber(cart?.subtotal);
  const subtotalFromItems = items.reduce(
    (sum, i) =>
      sum + toNumber(i.price_snapshot) * Math.max(0, toNumber(i.quantity)),
    0,
  );
  const subtotal = subtotalFromApi > 0 ? subtotalFromApi : subtotalFromItems;
  const shipping = toNumber(cart?.shipping_amount ?? cart?.shipping);
  const discount = toNumber(cart?.discount_amount ?? cart?.discount);
  const computedTotal = Math.max(0, subtotal + shipping - discount);
  const apiTotal = toNumber(cart?.total);
  const grandTotal = Math.max(
    0,
    Number.isFinite(apiTotal) && apiTotal > 0 ? apiTotal : computedTotal,
  );

  const handleUpdateQty = useCallback(
    (cartItemId, quantity) => {
      updateItem({ cartItemId, quantity })
        .unwrap()
        .then(() => toast.success('Cart updated'))
        .catch(() => toast.error('Could not update cart. Try again.'));
    },
    [updateItem, toast],
  );

  const handleRemove = useCallback(
    (cartItemId) => {
      removeItem(cartItemId)
        .unwrap()
        .then(() => toast.success('Item removed'))
        .catch(() => toast.error('Could not remove item. Try again.'));
    },
    [removeItem, toast],
  );

  const emptyCart = !isLoading && items.length === 0;

  return (
    <div className="flex flex-col bg-black">
      <Container fullWidth className="!px-4 !py-0">
        <AppSubpageHeader
          title="SELECTED ITEMS"
          bottomSpacing="relaxed"
          className="-mx-4 -mt-6 lg:mt-0"
        />

        {isLoading ? null : emptyCart ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-12 text-center">
            <p className="text-[14px] text-[#A2A6AB]">Your cart is empty.</p>
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="rounded-full bg-[#DA9811] px-6 py-3 text-[14px] font-bold text-black"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pt-2 lg:flex-row lg:items-start lg:gap-6 lg:pt-4">
            <div className="min-w-0 flex-1 space-y-3">
              {items.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  onUpdateQty={handleUpdateQty}
                  onRemove={handleRemove}
                  isUpdating={isUpdating}
                />
              ))}
            </div>

            <div className="lg:sticky lg:top-20 lg:w-[320px] lg:shrink-0">
              <div className="rounded-2xl bg-[#141412] p-4 shadow-sm">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[14px] font-medium text-[#A2A6AB]">
                      Subtotal:
                    </span>
                    <span className="text-[14px] font-bold text-white">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[14px] font-medium text-[#A2A6AB]">
                      Shipping:
                    </span>
                    <span className="text-[14px] font-bold text-white">
                      {formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[14px] font-medium text-[#A2A6AB]">
                      Discount:
                    </span>
                    <span className="text-[14px] font-bold text-white">
                      {formatPrice(discount)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 hidden border-t border-white/10 pt-4 lg:block">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[12px] font-normal text-white">
                        Grand Total:
                      </p>
                      <p className="text-[18px] font-bold text-[#DA9811]">
                        {formatPrice(grandTotal)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/shop/checkout')}
                      className="shrink-0 rounded-[6px] bg-[#DA9811] px-6 py-3 text-[14px] font-bold tracking-wide text-black uppercase transition-opacity hover:opacity-95 active:opacity-90 lg:px-8 lg:py-3.5"
                    >
                      Checkout
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-24 lg:hidden" />
          </div>
        )}
      </Container>

      {!emptyCart && !isLoading && (
        <footer className="fixed right-0 bottom-20 left-0 z-30 bg-black px-4 pt-4 pb-4 lg:hidden">
          <div className="flex w-full items-center justify-between gap-4 rounded-[17px] bg-[#141412] p-4">
            <div>
              <p className="text-[12px] font-normal text-white">Grand Total:</p>
              <p className="text-[18px] font-bold text-[#DA9811]">
                {formatPrice(grandTotal)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/shop/checkout')}
              className="shrink-0 rounded-[6px] bg-[#DA9811] px-8 py-3.5 text-[14px] font-bold tracking-wide text-black uppercase transition-opacity active:opacity-90"
            >
              Checkout
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
