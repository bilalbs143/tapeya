import 'swiper/css';

import { Link } from 'react-router-dom';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import liveImg1 from '@/assets/images/standard/live-img-1.png';
import liveImg2 from '@/assets/images/standard/live-img-2.png';
import liveImg3 from '@/assets/images/standard/live-img-3.png';
import liveImg4 from '@/assets/images/standard/live-img-4.png';

const SLIDES = [
  { id: 1, image: liveImg1, alt: 'Live match 1' },
  { id: 2, image: liveImg2, alt: 'Live match 2' },
  { id: 3, image: liveImg3, alt: 'Live match 3' },
  { id: 4, image: liveImg4, alt: 'Live match 4' },
  { id: 5, image: liveImg1, alt: 'Live match 5' },
  { id: 6, image: liveImg2, alt: 'Live match 6' },
];

export function LiveMatchSlider() {
  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full bg-red-500"
            aria-hidden
          />
          <h2 className="text-[13px] font-bold tracking-wide text-[#A2A6AB] uppercase md:text-[16px]">
            Live now
          </h2>
        </div>
        <Link
          to="/live"
          className="text-[12px] font-bold text-[#DA9811] transition-opacity active:opacity-80 md:text-[16px]"
        >
          View more
        </Link>
      </header>

      <Swiper
        modules={[Autoplay]}
        spaceBetween={15}
        slidesPerView={4}
        breakpoints={{
          768: { slidesPerView: 4.5 },
        }}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop
        grabCursor
        className="live-match-swiper -mx-4 px-4"
      >
        {SLIDES.map(({ id, image, alt }) => (
          <SwiperSlide key={id}>
            <div className="h-[116px] overflow-hidden rounded-[17px] md:h-[260px]">
              <img
                src={image}
                alt={alt}
                className="h-full w-full object-cover"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
