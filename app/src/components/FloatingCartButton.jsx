import { useEffect, useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { BOTTOM_NAV_HEIGHT, FLOATING_CART_Z } from '@/lib/constants/layout';
import { useGetCartQuery } from '@/store/api/shopApi';

const shoppingCartIcon = `${CLOUDFRONT_APP_BASE}/images/icons/shopping-cart.svg`;

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

  if (items.length === 0) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => navigate('/shop/cart')}
      className="fixed right-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#DA9811] shadow-lg transition-opacity active:opacity-90"
      style={{ bottom: BOTTOM_NAV_HEIGHT, zIndex: FLOATING_CART_Z }}
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
            className={`absolute -top-3.5 -right-2.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white px-1 py-0.5 text-[12px] leading-none font-bold text-[#DA9811] ${
              isPopping ? 'animate-badge-pop' : ''
            }`}
            aria-hidden
          >
            {count > 99 ? '99+' : count}
          </span>
        )}
      </span>
    </button>
  );
}
