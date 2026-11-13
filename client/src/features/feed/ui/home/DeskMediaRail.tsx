import { Link } from 'react-router-dom';

import { entertainmentPaths, useGetDramaSerialsQuery } from '@/features/entertainment';
import { useGetHomeHighlightsQuery } from '@/features/feed/api/homeApi';

import { APP_PATHS } from '@/shared/config/paths';
import { SectionLabel } from '@/shared/layout';
import { Card } from '@/shared/ui/Card';

import { MediaPosterChip } from './MediaPosterChip';

/**
 * Always-on desk widgets — highlights + entertainment
 * (shop “Gear near you” is `DeskGearRail`).
 */
export function DeskMediaRail() {
  const { data: highlights = [] } = useGetHomeHighlightsQuery({ perPage: 4 });
  const { data: serials = [] } = useGetDramaSerialsQuery({ perPage: 6 });

  const highlightItems = highlights.slice(0, 2);
  const serialItems = serials.slice(0, 3);

  return (
    <>
      {highlightItems.length ? (
        <Card className="rounded-card p-3.5">
          <SectionLabel
            action={
              <Link to={APP_PATHS.highlights} className="text-brand-text text-3xs font-bold">
                View More ›
              </Link>
            }
          >
            Match highlights
          </SectionLabel>
          <div className="mt-1 flex gap-3">
            {highlightItems.map((h) => (
              <Link key={h.id} to={`${APP_PATHS.highlights}/${h.id}`} className="min-w-0 flex-1">
                <span className="bg-page relative block aspect-video overflow-hidden rounded-panel">
                  {h.poster ? <img src={h.poster} alt="" className="h-full w-full object-cover" /> : null}
                  <MediaPosterChip>Highlights</MediaPosterChip>
                </span>
                <p className="mt-1.5 line-clamp-2 text-2xs font-bold text-ink">{h.caption}</p>
              </Link>
            ))}
          </div>
        </Card>
      ) : null}

      {serialItems.length ? (
        <Card className="rounded-card p-3.5">
          <SectionLabel
            action={
              <Link to={entertainmentPaths.list()} className="text-brand-text text-3xs font-bold">
                View More ›
              </Link>
            }
          >
            Entertainment
          </SectionLabel>
          <div className="mt-1 flex gap-3">
            {serialItems.map((serial) => (
              <Link
                key={serial.id}
                to={entertainmentPaths.detail(serial.id)}
                className="min-w-0 flex-1"
                aria-label={`Open ${serial.title}`}
              >
                <span className="border-border-subtle bg-page relative block aspect-show-poster overflow-hidden rounded-panel border">
                  {serial.poster ? <img src={serial.poster} alt="" className="h-full w-full object-cover" /> : null}
                  <MediaPosterChip>Entertainment</MediaPosterChip>
                </span>
              </Link>
            ))}
          </div>
        </Card>
      ) : null}
    </>
  );
}
