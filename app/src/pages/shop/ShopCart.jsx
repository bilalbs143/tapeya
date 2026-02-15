import { useNavigate } from 'react-router-dom';

import { formatPrice } from '@/lib/format';
import {
  useGetCartQuery,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from '@/store/api/shopApi';
import { Container } from '@/ui/Container';

function CartItemCard({ item, onUpdateQty, onRemove, isUpdating }) {
  const imageUrl = item.product?.images?.[0]?.path;
  const name = item.product?.name ?? 'Product';

  return (
    <div className="flex gap-3 rounded-2xl bg-[#1A1A1A] p-4">
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
}

export default function ShopCart() {
  const navigate = useNavigate();
  const { data: cart, isLoading } = useGetCartQuery();
  const [updateItem, { isLoading: isUpdating }] = useUpdateCartItemMutation();
  const [removeItem] = useRemoveCartItemMutation();

  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;

  const handleUpdateQty = (cartItemId, quantity) => {
    updateItem({ cartItemId, quantity });
  };

  const handleRemove = (cartItemId) => {
    removeItem(cartItemId);
  };

  const emptyCart = !isLoading && items.length === 0;

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Container className="!px-4 !py-0">
        <header className="-mx-4 -mt-6 flex items-center gap-3 bg-black px-4 pt-6 pb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
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
          <h1 className="min-w-0 flex-1 pr-[27px] text-center text-[16px] font-bold tracking-wide text-white uppercase">
            SELECTED ITEMS
          </h1>
        </header>

        {isLoading ? null : emptyCart ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-12 text-center">
            <p className="text-[14px] text-[#A2A6AB]">Your cart is empty.</p>
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="rounded-full bg-[#DA9811] px-6 py-3 text-[14px] font-bold text-black"
            >
              Continue shopping
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pt-2">
            {items.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onUpdateQty={handleUpdateQty}
                onRemove={handleRemove}
                isUpdating={isUpdating}
              />
            ))}
            <div className="h-24" />
          </div>
        )}
      </Container>

      {!emptyCart && !isLoading && (
        <footer className="fixed right-0 bottom-20 left-0 z-30 bg-black px-4 pt-4 pb-4">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 rounded-2xl bg-[#1A1A1A] p-4">
            <div>
              <p className="text-[12px] font-normal text-white">Grand Total:</p>
              <p className="text-[18px] font-bold text-[#DA9811]">
                {formatPrice(subtotal)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/shop/checkout')}
              className="shrink-0 rounded-full bg-[#DA9811] px-8 py-3.5 text-[14px] font-bold tracking-wide text-black uppercase transition-opacity active:opacity-90"
            >
              Checkout
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
