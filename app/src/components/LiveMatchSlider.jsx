import 'swiper/css';

import { Link } from 'react-router-dom';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { liveBroadcastPath } from '@/lib/utils/liveStreamUtils';

/**
 * @param {object} props
 * @param {Array<{ id: number, tournament_id: number, thumbnail_url?: string|null, matchId: string, stream?: { status?: string } }>} props.matches
 * @param {boolean} [props.showViewMore]
 */
export function LiveMatchSlider({ matches = [], showViewMore = true }) {
  if (!matches.length) {
    return null;
  }

  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" aria-hidden />
          <h2 className="text-muted text-[13px] font-bold tracking-wide uppercase md:text-[16px]">Live now</h2>
        </div>
        {showViewMore && (
          <Link to="/live" className="text-brand text-[12px] font-bold transition-opacity active:opacity-80 md:text-[16px]">
            View more
          </Link>
        )}
      </header>

      <Swiper
        modules={[Autoplay]}
        spaceBetween={15}
        slidesPerView={1.35}
        breakpoints={{
          480: { slidesPerView: 2.2 },
          768: { slidesPerView: 3.2 },
          1024: { slidesPerView: 4 },
        }}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop={matches.length > 1}
        grabCursor
        className="live-match-swiper -mx-4 px-4"
      >
        {matches.map((match) => {
          const isLive = match.stream?.status === 'live';
          const watchPath = liveBroadcastPath(match.id);

          return (
            <SwiperSlide key={match.id}>
              <Link to={watchPath} className="group relative block h-[116px] overflow-hidden rounded-[17px] md:h-[200px]">
                {match.thumbnail_url ? (
                  <img
                    src={match.thumbnail_url}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-300 group-active:scale-[1.02]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1A1A18] to-[#2C2418] px-3">
                    <p className="line-clamp-2 text-center text-[13px] font-semibold text-white">{match.matchId}</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute right-2 bottom-2 left-2">
                  {isLive && (
                    <span className="mb-1 inline-block rounded bg-[#E53935] px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">
                      Live
                    </span>
                  )}
                  <p className="line-clamp-2 text-[12px] font-semibold text-white md:text-[14px]">{match.matchId}</p>
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}
