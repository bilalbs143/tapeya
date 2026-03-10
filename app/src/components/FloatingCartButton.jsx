import { useEffect, useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import shoppingCartIcon from '@/assets/images/icons/shopping-cart.svg';
import { useGetCartQuery } from '@/store/api/shopApi';

/**
 * Reusable floating cart button (48×48). Navigates to Shop cart.
 * Can be used on Shop home and other shop pages.
 * Displays cart item count from API (updates on add/remove/update).
 * Badge pops (scale up then back) when count increases.
 */
export function FloatingCartButton() {
  const navigate = useNavigate();
  const { data: cart } = useGetCartQuery();
  const items = cart?.items ?? [];
  const count = items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
  const prevCountRef = useRef(null);
  const [isPopping, setIsPopping] = useState(false);

  useEffect(() => {
    const prev = prevCountRef.current;
    prevCountRef.current = count;
    if (prev !== null && count > prev) {
      setIsPopping(true);
      const t = setTimeout(() => setIsPopping(false), 400);
      return () => clearTimeout(t);
    }
  }, [count]);

  return (
    <button
      type="button"
      onClick={() => navigate('/shop/cart')}
      className="fixed right-4 bottom-20 z-30 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#DA9811] shadow-lg transition-opacity active:opacity-90"
      style={{ width: 48, height: 48 }}
      aria-label={count > 0 ? `Go to cart (${count} items)` : 'Go to cart'}
    >
      <span className="relative inline-flex items-center justify-center">
        <img
          src={shoppingCartIcon}
          alt=""
          className="h-6 w-6"
          width={24}
          height={24}
        />
        {count > 0 && (
          <span
            className={`absolute -top-3.5 -right-2.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-white px-1 py-0.5 text-[12px] leading-none font-bold text-[#DA9811] ${isPopping ? 'animate-badge-pop' : ''}`}
            aria-hidden
          >
            {count > 99 ? '99+' : count}
          </span>
        )}
      </span>
    </button>
  );
}
