import { Link } from 'react-router-dom';

import { cn } from '@/shared/lib/cn';

import { shopPaths } from '../lib/shopPaths';
import type { ShopBrand } from '../model/schemas';

type BrandRailProps = {
  brands?: ShopBrand[] | undefined;
  className?: string | undefined;
};

export function BrandRail({ brands = [], className }: BrandRailProps) {
  if (!brands.length) return null;

  return (
    <div className={cn('no-scrollbar flex gap-2 overflow-x-auto', className)}>
      {brands.map((b) => {
        const to = b.slug ? shopPaths.brand(b.slug) : shopPaths.home();
        return (
          <Link
            key={b.id}
            to={to}
            className="border-border-subtle bg-surface hover:border-border focus-visible:outline-brand flex shrink-0 items-center gap-2 rounded-chip border py-1.5 pr-3 pl-1.5 focus-visible:outline-2"
          >
            {b.logoUrl ? (
              <img src={b.logoUrl} alt="" className="h-7 w-7 shrink-0 rounded-icon object-cover" />
            ) : (
              <span className="bg-surface-raised text-muted grid h-7 w-7 shrink-0 place-items-center rounded-icon text-3xs font-bold">
                {b.name.slice(0, 1)}
              </span>
            )}
            <span className="text-2xs leading-normal font-bold whitespace-nowrap text-body">{b.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
