import { Link } from 'react-router-dom';

import { NavbarIconBadge } from '@/components/navbar/NavbarIconBadge';
import { useCartItemCount } from '@/hooks/shop/useCartItemCount';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { formatCountBadge } from '@/lib/utils/displayUtils';

const shoppingCartIcon = `${CLOUDFRONT_APP_BASE}/images/icons/product-cart-icon.svg`;

function cartSummaryLabel(count) {
  const itemWord = count === 1 ? 'Item' : 'Items';
  return `You Have ${count} ${itemWord}`;
}

export function NavbarCartButton() {
  const { count, isPopping, hasItems } = useCartItemCount();
  const badgeLabel = formatCountBadge(count);

  if (!hasItems) {
    return null;
  }

  const summary = cartSummaryLabel(count);

  return (
    <Link
      to="/shop/cart"
      className="bg-surface relative flex h-9 max-w-[min(100%,14rem)] shrink-0 items-center gap-2 rounded-full px-3 transition-colors hover:bg-zinc-700 active:bg-zinc-600"
      aria-label={`Cart, ${summary}`}
    >
      <img src={shoppingCartIcon} alt="" className="h-3.5 w-3.5 shrink-0 object-contain brightness-0 invert" />
      <span className="truncate text-[11px] leading-none font-medium text-white sm:text-[12px]">{summary}</span>
      <NavbarIconBadge label={badgeLabel} animatePop={isPopping} />
    </Link>
  );
}
