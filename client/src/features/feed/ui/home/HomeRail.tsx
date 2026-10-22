import { Link } from 'react-router-dom';

import type { HomeNextMatch, HomeProduct } from '@/features/feed/model/homeSchemas';
import { shopPaths } from '@/features/shop';

import { APP_PATHS } from '@/shared/config/paths';
import { SectionLabel } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { toast } from '@/shared/ui/toast';

type HomeRailProps = {
  nextMatch?: HomeNextMatch | null | undefined;
  products?: HomeProduct[] | undefined;
  /** tab–desk: next match only (rail folded into the feed column). */
  compact?: boolean | undefined;
};

/** Desktop home rail — next match, optional shop picks. */
export function HomeRail({ nextMatch, products = [], compact = false }: HomeRailProps) {
  const hasContent = Boolean(nextMatch) || (!compact && products.length > 0);
  if (!hasContent && compact) return null;

  return (
    <>
      {nextMatch ? (
        <Card className="rounded-card p-3.5">
          <p className="font-mono text-dim text-4xs leading-normal font-bold tracking-eyebrow uppercase">
            Your next match
          </p>
          <p className="mt-2.5 text-body-sm font-extrabold text-ink">vs {nextMatch.opponent.name}</p>
          <p className="text-dim font-mono mt-1 text-4xs font-medium tracking-[.04em] uppercase">
            {nextMatch.date} · {nextMatch.time} · {nextMatch.venue}
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              className="h-9 flex-1 rounded-field text-xs leading-normal font-bold"
              onClick={() => toast({ title: 'Squad Confirmation Is Coming Soon', tone: 'info' })}
            >
              Confirm XI
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="h-9 rounded-field px-3.5 text-xs leading-normal font-semibold"
              asChild
            >
              <Link to={APP_PATHS.matches}>Details</Link>
            </Button>
          </div>
        </Card>
      ) : null}

      {!compact && products.length ? (
        <Card className="rounded-card p-3.5">
          <SectionLabel
            action={
              <Link to={APP_PATHS.shop} className="text-brand-text text-2xs font-semibold">
                Shop
              </Link>
            }
          >
            Gear near you
          </SectionLabel>
          <div className="mt-1 flex flex-col gap-3">
            {products.slice(0, 2).map((p) => (
              <Link
                key={p.id}
                to={shopPaths.product({ slug: p.slug, vendorSlug: p.vendorSlug })}
                className="flex gap-2.5"
              >
                <span className="bg-page block h-14 w-14 shrink-0 overflow-hidden rounded-field">
                  {p.image ? <img src={p.image} alt="" className="h-full w-full object-cover" /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-xs leading-normal font-bold text-ink">{p.name}</span>
                  <span className="text-dim mt-0.5 block text-4xs">{p.vendor || p.brand || 'Nearby'}</span>
                  <span className="font-mono text-body mt-1 block text-xs leading-normal font-bold">{p.price}</span>
                </span>
              </Link>
            ))}
          </div>
        </Card>
      ) : null}

      {compact ? null : (
        <p className="text-dim px-1 pt-1 text-3xs leading-relaxed">
          <Link to={APP_PATHS.support} className="hover:text-ink">
            Help
          </Link>
          {' · '}
          <Link to={APP_PATHS.support} className="hover:text-ink">
            Support
          </Link>
          <br />
          <span className="font-mono mt-1 inline-block text-4xs tracking-[.04em]">© 2026 Tapeya</span>
        </p>
      )}
    </>
  );
}
