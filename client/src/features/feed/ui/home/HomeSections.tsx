import { Link } from 'react-router-dom';

import { type DramaSerial, entertainmentPaths } from '@/features/entertainment';
import type { HomeHighlight, HomeProduct } from '@/features/feed/model/homeSchemas';
import { shopPaths } from '@/features/shop';

import { APP_PATHS } from '@/shared/config/paths';
import { SectionLabel } from '@/shared/layout';
import { HScroll } from '@/shared/ui/HScroll';

export function ProductsRail({
  products = [],
  title = 'Popular Products',
}: {
  products?: HomeProduct[] | undefined;
  title?: string | undefined;
}) {
  if (!products.length) return null;
  return (
    <div className="flex flex-col gap-2.5">
      <SectionLabel
        className="px-4"
        action={
          <Link to={APP_PATHS.shop} className="text-brand-text text-3xs font-bold">
            View More ›
          </Link>
        }
      >
        {title}
      </SectionLabel>
      <HScroll bleed={false} className="gap-3">
        {products.map((p) => (
          <Link
            key={p.id}
            to={shopPaths.product({ slug: p.slug, vendorSlug: p.vendorSlug })}
            className="border-border-subtle w-36 shrink-0 overflow-hidden rounded-card border"
          >
            <span className="bg-page relative block aspect-square overflow-hidden">
              {p.image ? <img src={p.image} alt="" className="h-full w-full object-cover" /> : null}
              {p.badge ? (
                <span className="bg-danger absolute top-1.5 left-1.5 rounded-full px-1.5 py-0.5 text-4xs font-bold text-white">
                  {p.badge}
                </span>
              ) : null}
            </span>
            <p className="mt-1.5 truncate px-2 text-2xs font-bold text-ink">{p.name}</p>
            <p className="text-dim font-mono px-2 pb-2 text-4xs">{p.price}</p>
          </Link>
        ))}
      </HScroll>
    </div>
  );
}

export function HighlightsRail({ highlights = [] }: { highlights?: HomeHighlight[] | undefined }) {
  if (!highlights.length) return null;
  return (
    <div className="flex flex-col gap-2.5">
      <SectionLabel
        className="px-4"
        action={
          <Link to={APP_PATHS.highlights} className="text-brand-text text-3xs font-bold">
            View More ›
          </Link>
        }
      >
        Match highlights
      </SectionLabel>
      <HScroll bleed={false} className="gap-3">
        {highlights.map((h) => {
          const inner = (
            <>
              <span className="bg-page relative block aspect-video overflow-hidden rounded-panel">
                {h.poster ? <img src={h.poster} alt="" className="h-full w-full object-cover" /> : null}
                <span className="bg-brand/85 absolute top-1.5 left-1.5 rounded-full px-2 py-0.5 text-4xs font-bold text-white">
                  HIGHLIGHTS
                </span>
              </span>
              <p className="mt-1.5 line-clamp-2 text-2xs font-bold text-ink">{h.caption}</p>
            </>
          );
          return (
            <Link key={h.id} to={`${APP_PATHS.highlights}/${h.id}`} className="w-40 shrink-0">
              {inner}
            </Link>
          );
        })}
      </HScroll>
    </div>
  );
}

/** Explore-tab entertainment rail. */
export function EntertainmentRail({
  serials = [],
  title = 'Entertainment',
}: {
  serials?: DramaSerial[] | undefined;
  title?: string | undefined;
}) {
  if (!serials.length) return null;
  return (
    <div className="flex flex-col gap-2.5">
      <SectionLabel
        className="px-4"
        action={
          <Link to={entertainmentPaths.list()} className="text-brand-text text-3xs font-bold">
            View More ›
          </Link>
        }
      >
        {title}
      </SectionLabel>
      <HScroll bleed={false} className="gap-3">
        {serials.slice(0, 6).map((serial) => (
          <Link
            key={serial.id}
            to={entertainmentPaths.detail(serial.id)}
            className="w-28 shrink-0"
            aria-label={`Open ${serial.title}`}
          >
            <span className="border-border-subtle bg-page relative block aspect-show-poster overflow-hidden rounded-panel border">
              {serial.poster ? <img src={serial.poster} alt="" className="h-full w-full object-cover" /> : null}
              <span className="bg-brand/85 absolute top-1.5 left-1.5 rounded-full px-1.5 py-0.5 text-4xs font-bold tracking-eyebrow text-white uppercase">
                Entertainment
              </span>
            </span>
          </Link>
        ))}
      </HScroll>
    </div>
  );
}
