import { Link } from 'react-router-dom';

import { cn } from '@/shared/lib/cn';
import { CartIcon } from '@/shared/ui/icons';

import { useGetShopCartQuery } from '../api/shopApi';
import { shopPaths } from '../lib/shopPaths';

export function CartLink({ className }: { className?: string | undefined }) {
  const { data } = useGetShopCartQuery();
  const count = data?.itemsCount ?? 0;

  return (
    <Link
      to={shopPaths.cart()}
      aria-label={count ? `Cart, ${count} items` : 'Cart'}
      className={cn(
        'text-body hover:text-ink focus-visible:outline-brand relative grid h-9 w-9 place-items-center rounded-icon focus-visible:outline-2',
        className
      )}
    >
      <CartIcon size="md" strokeWidth={1.9} className="h-5 w-5" />
      {count > 0 ? (
        <span className="bg-brand absolute top-0.5 right-0.5 grid h-4 min-w-4 place-items-center rounded-full px-0.5 text-4xs font-bold text-white">
          {count > 99 ? '99+' : count}
        </span>
      ) : null}
    </Link>
  );
}
