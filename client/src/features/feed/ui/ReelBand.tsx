import { Link } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';
import { SectionLabel } from '@/shared/layout';
import { cn } from '@/shared/lib/cn';
import { Skeleton } from '@/shared/ui/states';

import type { ReelBandItem } from '../model/schemas';
import { feedRoutes } from '../routes';

type ReelBandProps = {
  reels?: ReelBandItem[];
  title?: string;
  to?: string;
  /** Feed interstitial (78×104 tiles). `false` gives the 118×198 stories band. */
  compact?: boolean;
  className?: string;
};

type ReelBandSkeletonProps = {
  compact?: boolean | undefined;
  className?: string | undefined;
  /** Tile count in the horizontal strip. */
  count?: number | undefined;
};

/** Horizontal reel strip — caller owns outer borders/spacing. */
export function ReelBand({
  reels = [],
  title = 'Reels',
  to = APP_PATHS.reels,
  compact = false,
  className,
}: ReelBandProps) {
  if (!reels.length) return null;

  return (
    <section className={cn(className)}>
      {compact ? (
        <div className="mb-2.5 flex items-baseline justify-between">
          <h2 className="text-2xs font-extrabold text-ink">{title}</h2>
          <Link to={to} className="text-brand-text text-3xs font-bold">
            View More
          </Link>
        </div>
      ) : (
        <SectionLabel
          as="h2"
          action={
            <Link to={to} className="text-brand-text text-3xs font-bold">
              View More ›
            </Link>
          }
        >
          {title}
        </SectionLabel>
      )}

      <ul className="no-scrollbar flex gap-2 overflow-x-auto">
        {reels.map((reel) => (
          <li key={reel.id} className="shrink-0">
            <Link
              to={feedRoutes.reel(reel.id)}
              aria-label={`Reel, ${reel.views.toLocaleString()} views`}
              className={cn(
                'relative block overflow-hidden bg-[image:var(--gradient-media-placeholder)]',
                compact ? 'h-[104px] w-[78px] rounded-icon' : 'h-[198px] w-[118px] rounded-card'
              )}
            >
              {reel.poster ? (
                <img
                  src={reel.poster}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : null}
              <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
              <span className="font-mono absolute bottom-1 left-1.5 text-4xs font-bold text-white">
                {reel.views.toLocaleString()}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ReelBandSkeleton({ compact = false, count = 4, className }: ReelBandSkeletonProps) {
  const tile = compact ? 'h-[104px] w-[78px] rounded-icon' : 'h-[198px] w-[118px] rounded-card';

  return (
    <div className={cn('border-border-subtle border-b px-4 py-3.5', className)} aria-hidden aria-busy="true">
      <div className="flex items-baseline gap-2 pb-2">
        <Skeleton className="h-2.5 w-14" />
        <span className="flex-1" />
        <Skeleton className="h-2.5 w-16" />
      </div>
      <ul className="no-scrollbar flex gap-2 overflow-hidden">
        {Array.from({ length: count }, (_, i) => (
          <li key={i} className="shrink-0">
            <Skeleton className={tile} />
          </li>
        ))}
      </ul>
    </div>
  );
}
