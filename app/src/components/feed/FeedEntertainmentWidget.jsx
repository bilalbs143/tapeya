import 'swiper/css';

import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';

import { FIXTURE_BG_IMAGE } from '@/lib/constants/assets';

function FeedEntertainmentCard({ item }) {
  const title = item.title || 'Entertainment';
  const subtitle = [item.provider, `${item.episodesCount ?? 0} episodes`].filter(Boolean).join(' · ');

  return (
    <Link
      to={`/entertainment/${item.id}`}
      className="group/entertainment block h-full min-w-0 rounded-[14px] focus-visible:outline-none"
      aria-label={`Open ${title}`}
    >
      <div className="bg-surface-deep relative aspect-[2/3] overflow-hidden rounded-[14px] border border-white/8">
        <img
          src={item.poster || FIXTURE_BG_IMAGE}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover/entertainment:scale-105"
          onError={(event) => {
            if (event.currentTarget.src !== FIXTURE_BG_IMAGE) {
              event.currentTarget.src = FIXTURE_BG_IMAGE;
            }
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-transparent" />
        <span className="bg-brand/90 absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[9px] font-bold whitespace-nowrap text-white">
          ENTERTAINMENT
        </span>
      </div>
      <div className="pt-2">
        <p className="line-clamp-2 text-[12px] leading-snug font-bold text-white sm:text-[14px]">{title}</p>
        <p className="text-muted mt-1 line-clamp-1 text-[10px] sm:text-[12px]">{subtitle}</p>
      </div>
    </Link>
  );
}

export function FeedEntertainmentWidget({ entertainments }) {
  if (!entertainments?.length) return null;

  return (
    <section className="bg-surface overflow-hidden px-4 py-3.5">
      <header className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[15px] font-bold text-white sm:text-[16px]">Entertainment</p>
        <Link to="/entertainment" className="text-brand shrink-0 text-[12px] font-semibold transition-opacity hover:opacity-80">
          View More
        </Link>
      </header>
      <Swiper slidesPerView={2.35} spaceBetween={10} grabCursor className="w-full">
        {entertainments.slice(0, 6).map((item) => (
          <SwiperSlide key={item.id} className="h-auto!">
            <FeedEntertainmentCard item={item} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
