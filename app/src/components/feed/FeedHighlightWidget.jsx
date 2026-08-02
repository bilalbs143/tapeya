import 'swiper/css';

import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';

import { FIXTURE_BG_IMAGE } from '@/lib/constants/assets';
import { formatHighlightDuration } from '@/pages/highlights/highlightsUtils';

function FeedHighlightCard({ highlight }) {
  const title = highlight.title || 'Highlight';
  const subtitle = highlight.tournament?.tournament_name || highlight.description;
  const duration = formatHighlightDuration(highlight.duration);

  return (
    <Link
      to={`/highlights/${highlight.id}`}
      state={{ highlight }}
      className="group/highlight block h-full min-w-0 rounded-[14px] focus-visible:outline-none"
      aria-label={`Watch ${title}`}
    >
      <div className="bg-surface-deep relative aspect-4/3 overflow-hidden rounded-[14px] border border-white/8">
        <img
          src={highlight.thumbnailUrl || FIXTURE_BG_IMAGE}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover/highlight:scale-105"
          onError={(event) => {
            if (event.currentTarget.src !== FIXTURE_BG_IMAGE) {
              event.currentTarget.src = FIXTURE_BG_IMAGE;
            }
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent" />
        {duration ? (
          <span className="absolute bottom-1.5 left-1.5 bg-black/75 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm sm:text-[11px]">
            {duration}
          </span>
        ) : null}
      </div>

      <div className="pt-2">
        <p className="line-clamp-2 text-[12px] leading-snug font-bold text-white sm:text-[14px]">{title}</p>
        {subtitle ? <p className="text-muted mt-1 line-clamp-1 text-[10px] sm:text-[12px]">{subtitle}</p> : null}
      </div>
    </Link>
  );
}

/**
 * Compact highlight recommendation inserted between social posts.
 *
 * @param {{ highlights: Array<object> }} props
 */
export function FeedHighlightWidget({ highlights }) {
  if (!highlights.length) return null;

  return (
    <section className="bg-surface overflow-hidden px-4 py-3.5">
      <header className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[15px] font-bold text-white sm:text-[16px]">Match Highlights</p>
        <Link to="/highlights" className="text-brand shrink-0 text-[12px] font-semibold transition-opacity hover:opacity-80">
          View More
        </Link>
      </header>

      <Swiper slidesPerView={2} spaceBetween={10} grabCursor className="w-full">
        {highlights.slice(0, 3).map((highlight) => (
          <SwiperSlide key={highlight.id} className="h-auto!">
            <FeedHighlightCard highlight={highlight} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
