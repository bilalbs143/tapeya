import { Link } from 'react-router-dom';

import { cn } from '@/shared/lib/cn';
import { WhatsAppIcon } from '@/shared/ui/icons';

import { shopPaths } from '../lib/shopPaths';
import type { ShopVendorBrief } from '../model/schemas';

type SellerContactCardProps = {
  vendor: ShopVendorBrief | null | undefined;
  className?: string | undefined;
};

export function SellerContactCard({ vendor, className }: SellerContactCardProps) {
  if (!vendor) return null;

  const initials = vendor.storeName.slice(0, 2).toUpperCase();
  const phone = vendor.phone?.trim() || null;
  const wa = phone ? phone.replace(/\D/g, '') : null;
  const place = [vendor.city, vendor.country].filter(Boolean).join(', ');
  const storeTo = vendor.slug ? shopPaths.vendor(vendor.slug) : null;
  const actionCount = Number(Boolean(phone)) + Number(Boolean(wa));

  return (
    <section className={cn('border-border-subtle bg-surface rounded-card border p-3.5', className)}>
      <div className="flex items-center gap-3">
        <span className="bg-brand/16 text-brand-text grid h-11 w-11 shrink-0 place-items-center rounded-panel text-body-sm font-extrabold">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          {storeTo ? (
            <Link
              to={storeTo}
              className="hover:text-brand-text focus-visible:outline-brand block truncate text-body-sm font-bold text-ink focus-visible:outline-2"
            >
              {vendor.storeName}
            </Link>
          ) : (
            <p className="truncate text-body-sm font-bold text-ink">{vendor.storeName}</p>
          )}
          {phone ? (
            <a
              href={`tel:${phone}`}
              className="text-brand-text focus-visible:outline-brand mt-0.5 block truncate font-mono text-2xs font-bold tabular-nums focus-visible:outline-2"
            >
              {phone}
            </a>
          ) : null}
          {place ? <p className="text-dim mt-0.5 truncate text-3xs">{place}</p> : null}
        </div>
      </div>

      {actionCount > 0 ? (
        <div className={cn('mt-3 grid gap-2', actionCount > 1 ? 'grid-cols-2' : 'grid-cols-1')}>
          {phone ? (
            <a
              href={`tel:${phone}`}
              className="bg-surface-raised border-border-subtle hover:border-border focus-visible:outline-brand flex min-h-10 items-center justify-center rounded-panel border text-2xs leading-normal font-bold text-body focus-visible:outline-2"
            >
              Call
            </a>
          ) : null}
          {wa ? (
            <a
              href={`https://wa.me/${wa}`}
              target="_blank"
              rel="noreferrer"
              className="border-positive/40 bg-positive/12 text-positive-2 hover:border-positive/70 focus-visible:outline-brand flex min-h-10 items-center justify-center gap-1.5 rounded-panel border text-2xs leading-normal font-bold focus-visible:outline-2"
            >
              <WhatsAppIcon size="xs" />
              WhatsApp
            </a>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
