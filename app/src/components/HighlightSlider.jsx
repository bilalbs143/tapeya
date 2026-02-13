import 'swiper/css';

import { Link } from 'react-router-dom';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import highlight1 from '@/assets/images/standard/highlight-1.png';
import highlight2 from '@/assets/images/standard/highlight-2.jpg';

const SLIDES = [
  { id: 1, image: highlight1, alt: 'Highlight 1' },
  { id: 2, image: highlight2, alt: 'Highlight 2' },
  { id: 3, image: highlight1, alt: 'Highlight 3' },
];

export function HighlightSlider() {
  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between">
        <h2 className="text-[13px] font-bold tracking-wide text-[#A2A6AB] uppercase">
          Highlights
        </h2>
        <Link
          to="/highlights"
          className="text-[12px] font-bold text-[#DA9811] transition-opacity active:opacity-80"
        >
          View more
        </Link>
      </header>

      <Swiper
        modules={[Autoplay]}
        spaceBetween={12}
        slidesPerView={1.5}
        centeredSlides={false}
        initialSlide={0}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop
        grabCursor
        className="highlight-swiper -mx-4 px-4"
      >
        {SLIDES.map(({ id, image, alt }) => (
          <SwiperSlide key={id}>
            <div className="h-[160px] overflow-hidden rounded-[17px] sm:h-[180px]">
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
