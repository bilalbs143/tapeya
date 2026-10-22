import { Link } from 'react-router-dom';

import { cn } from '@/shared/lib/cn';
import { CommentIcon } from '@/shared/ui/icons';

import { shopPaths } from '../lib/shopPaths';
import type { ShopVendorBrief } from '../model/schemas';

type SellerContactCardProps = {
  vendor: ShopVendorBrief | null | undefined;
  className?: string | undefined;
};

export function SellerContactCard({ vendor, className }: SellerContactCardProps) {
  if (!vendor) return null;

  const initials = vendor.storeName.slice(0, 2).toUpperCase();
  const wa = vendor.phone ? String(vendor.phone).replace(/\D/g, '') : null;
  const place = [vendor.city, vendor.country].filter(Boolean).join(', ');
  const storeTo = vendor.slug ? shopPaths.vendor(vendor.slug) : null;

  return (
    <section className={cn('border-border-subtle bg-surface rounded-card border p-3.5', className)}>
      <div className="flex items-start gap-3">
        <span className="bg-brand/16 text-brand-text grid h-10 w-10 shrink-0 place-items-center rounded-panel text-body-sm font-extrabold">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          {storeTo ? (
            <Link
              to={storeTo}
              className="hover:text-brand-text focus-visible:outline-brand truncate text-body-sm font-bold text-ink focus-visible:outline-2"
            >
              {vendor.storeName}
            </Link>
          ) : (
            <p className="truncate text-body-sm font-bold text-ink">{vendor.storeName}</p>
          )}
          {place ? <p className="text-dim font-mono mt-0.5 text-4xs tracking-[.06em] uppercase">{place}</p> : null}
        </div>
      </div>

      {vendor.phone || wa ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {vendor.phone ? (
            <a
              href={`tel:${vendor.phone}`}
              className="bg-surface-raised border-border-subtle hover:border-border focus-visible:outline-brand flex min-h-10 items-center justify-center gap-2 rounded-panel border text-2xs leading-normal font-bold text-body focus-visible:outline-2"
            >
              Call
            </a>
          ) : null}
          {wa ? (
            <a
              href={`https://wa.me/${wa}`}
              target="_blank"
              rel="noreferrer"
              className="border-positive/40 bg-positive/12 text-positive-2 hover:border-positive/70 focus-visible:outline-brand flex min-h-10 items-center justify-center gap-2 rounded-panel border text-2xs leading-normal font-bold focus-visible:outline-2"
            >
              <CommentIcon className="h-3.5 w-3.5" strokeWidth={2} />
              WhatsApp
            </a>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
