import 'swiper/css';

import { Link } from 'react-router-dom';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { LiveStreamChip } from '@/components/live/LiveStreamChip';
import { LiveStreamThumbnail } from '@/components/live/LiveStreamThumbnail';
import { OfficialBadge } from '@/components/OfficialBadge';
import { LIVE_STREAM_SLIDER_ASPECT_CLASS } from '@/lib/constants/streamThumbnail.constants';
import { liveBroadcastPath, liveNowHost } from '@/lib/utils/liveStreamUtils';

/**
 * Home “Live Now” carousel — compact cards with creator (or Tapeya) + stream title.
 *
 * @param {object} props
 * @param {Array<object>} props.streams — rows from {@link normaliseLiveStreams}
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
        {showViewMore ? (
          <Link to="/live" className="text-brand text-[12px] font-bold transition-opacity active:opacity-80 md:text-[16px]">
            View More
          </Link>
        ) : null}
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
          const host = liveNowHost(item);
          const title = item.title?.trim() || '';
          const headline = `${host.name} is live now`;

          return (
            <SwiperSlide key={item.streamId}>
              <Link
                to={liveBroadcastPath(item.streamId)}
                className="group relative block w-full overflow-hidden rounded-[17px]"
                aria-label={headline}
              >
                <LiveStreamThumbnail
                  src={item.thumbnail_url}
                  alt={title || headline}
                  aspectClass={LIVE_STREAM_SLIDER_ASPECT_CLASS}
                  compactFallback
                  imageClassName="transition-transform duration-300 group-active:scale-[1.02]"
                />
                <div className="pointer-events-none absolute inset-0 z-10 bg-linear-to-t from-black/85 via-black/25 to-transparent" />
                {isLive ? <LiveStreamChip className="absolute top-2 left-2 z-20" /> : null}
                <div className="pointer-events-none absolute right-2 bottom-2 left-2 z-20">
                  <div className="flex min-w-0 items-center gap-1">
                    <p className="truncate text-[12px] text-white md:text-[13px]">
                      <span className="font-bold">{host.name}</span>
                      {isLive ? <span className="font-normal text-white/80"> is live now</span> : null}
                    </p>
                    <OfficialBadge isOfficial={host.isOfficial} size="sm" />
                  </div>
                  {title ? <p className="mt-0.5 line-clamp-1 text-[11px] text-white/75 md:text-[12px]">{title}</p> : null}
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}
