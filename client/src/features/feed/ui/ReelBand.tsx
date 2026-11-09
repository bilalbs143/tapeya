import { Link } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';
import { SectionLabel } from '@/shared/layout';
import { cn } from '@/shared/lib/cn';
import { HScroll } from '@/shared/ui/HScroll';
import { SKELETON, Skeleton } from '@/shared/ui/states';

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
        <div className="mb-2.5 flex items-baseline justify-between px-4">
          <h2 className="text-2xs font-extrabold text-ink">{title}</h2>
          <Link to={to} className="text-brand-text text-3xs font-bold">
            View More
          </Link>
        </div>
      ) : (
        <SectionLabel
          as="h2"
          className="px-4"
          action={
            <Link to={to} className="text-brand-text text-3xs font-bold">
              View More ›
            </Link>
          }
        >
          {title}
        </SectionLabel>
      )}

      <HScroll as="ul" bleed={false} className="gap-2">
        {reels.map((reel) => {
          const handle = reel.nickname ? `@${reel.nickname}` : null;
          const showHandle = Boolean(handle) && handle !== reel.name;
          return (
            <li key={reel.id} className="shrink-0">
              <Link
                to={feedRoutes.reel(reel.id)}
                aria-label={`Watch reel by ${reel.name}`}
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
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className="absolute inset-x-1.5 bottom-1.5 min-w-0">
                  <span className="block truncate text-4xs font-semibold text-white">{reel.name}</span>
                  {showHandle ? (
                    <span className="mt-px block truncate text-4xs font-medium text-white/70">{handle}</span>
                  ) : null}
                </span>
              </Link>
            </li>
          );
        })}
      </HScroll>
    </section>
  );
}

export function ReelBandSkeleton({ compact = false, count, className }: ReelBandSkeletonProps) {
  const tile = compact ? 'h-[104px] w-[78px] rounded-icon' : 'h-[198px] w-[118px] rounded-card';
  const tiles = count ?? (compact ? SKELETON.reelBandCompact : SKELETON.reelBand);

  return (
    <div className={cn('border-border-subtle border-b py-3.5', className)} aria-hidden aria-busy="true">
      <div className="flex items-baseline gap-2 px-4 pb-2">
        <Skeleton className="h-2.5 w-14" />
        <span className="flex-1" />
        <Skeleton className="h-2.5 w-16" />
      </div>
      <HScroll as="ul" bleed={false} className="gap-2 overflow-hidden">
        {Array.from({ length: tiles }, (_, i) => (
          <li key={i} className="shrink-0">
            <Skeleton className={tile} />
          </li>
        ))}
      </HScroll>
    </div>
  );
}
