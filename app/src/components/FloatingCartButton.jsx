import { useNavigate } from 'react-router-dom';

import shoppingCartIcon from '@/assets/images/icons/shopping-cart.svg';

/**
 * Reusable floating cart button (48×48). Navigates to My Orders.
 * Can be used on Shop home and other shop pages.
 */
export function FloatingCartButton() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate('/shop/orders')}
      className="fixed right-4 bottom-20 z-30 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#DA9811] shadow-lg transition-opacity active:opacity-90"
      style={{ width: 48, height: 48 }}
      aria-label="Go to my orders"
    >
      <img
        src={shoppingCartIcon}
        alt=""
        className="h-6 w-6"
        width={24}
        height={24}
      />
    </button>
  );
}
