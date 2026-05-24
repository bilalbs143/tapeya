import { Link } from 'react-router-dom';

import { NavbarIconBadge } from '@/components/navbar/NavbarIconBadge';
import { useCartItemCount } from '@/hooks/shop/useCartItemCount';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { NAVBAR_ICON_BTN_CLASS } from '@/lib/constants/navbar';
import { formatCountBadge } from '@/lib/utils/badgeUtils';

const shoppingCartIcon = `${CLOUDFRONT_APP_BASE}/images/icons/product-cart-icon.svg`;

export function NavbarCartButton() {
  const { count, isPopping, hasItems } = useCartItemCount();
  const badgeLabel = formatCountBadge(count);

  if (!hasItems) {
    return null;
  }

  return (
    <Link
      to="/shop/cart"
      className={`${NAVBAR_ICON_BTN_CLASS} relative`}
      aria-label={count > 0 ? `Cart, ${count} items` : 'Cart'}
    >
      <img src={shoppingCartIcon} alt="" className="h-3.5 w-3.5 object-contain brightness-0 invert" />
      <NavbarIconBadge label={badgeLabel} animatePop={isPopping} />
    </Link>
  );
}
