import 'swiper/css';

import { Link } from 'react-router-dom';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { LiveStreamThumbnail } from '@/components/live/LiveStreamThumbnail';
import { LIVE_STREAM_SLIDER_ASPECT_CLASS } from '@/lib/constants/streamThumbnail.constants';
import { liveBroadcastPath } from '@/lib/utils/liveStreamUtils';

/**
 * @param {object} props
 * @param {Array<{ streamId: number, thumbnail_url?: string|null, title: string, stream?: { status?: string } }>} props.streams
 * @param {boolean} [props.showViewMore]
 */
export function LiveMatchSlider({ streams = [], showViewMore = true }) {
  if (!streams.length) {
    return null;
  }

  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" aria-hidden />
          <h2 className="text-muted text-[13px] font-bold tracking-wide uppercase md:text-[16px]">Live Now</h2>
        </div>
        {showViewMore && (
          <Link to="/live" className="text-brand text-[12px] font-bold transition-opacity active:opacity-80 md:text-[16px]">
            View More
          </Link>
        )}
      </header>

      <Swiper
        modules={[Autoplay]}
        spaceBetween={12}
        slidesPerView={1.55}
        breakpoints={{
          480: { slidesPerView: 2.45 },
          768: { slidesPerView: 3.45 },
          1024: { slidesPerView: 4.6 },
        }}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop={streams.length > 1}
        grabCursor
        className="live-match-swiper -mx-4 px-4 [&_.swiper-slide]:h-auto"
      >
        {streams.map((item) => {
          const isLive = item.stream?.status === 'live';
          const watchPath = liveBroadcastPath(item.streamId);

          return (
            <SwiperSlide key={item.streamId}>
              <Link to={watchPath} className="group relative block w-full overflow-hidden rounded-[17px]">
                <LiveStreamThumbnail
                  src={item.thumbnail_url}
                  alt={item.title}
                  aspectClass={LIVE_STREAM_SLIDER_ASPECT_CLASS}
                  compactFallback
                  imageClassName="transition-transform duration-300 group-active:scale-[1.02]"
                />
                <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="pointer-events-none absolute right-2 bottom-2 left-2 z-20">
                  {isLive && (
                    <span className="mb-1 inline-block rounded bg-[#E53935] px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">
                      Live
                    </span>
                  )}
                  <p className="line-clamp-2 text-[12px] font-semibold text-white md:text-[14px]">{item.title}</p>
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}
