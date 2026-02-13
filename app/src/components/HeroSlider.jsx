import 'swiper/css';
import 'swiper/css/pagination';

import { Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import heroImage from '@/assets/images/standard/hero-slider-image.png';

const SLIDES = [1, 2];

export function HeroSlider() {
  return (
    <Swiper
      modules={[Autoplay, Pagination]}
      spaceBetween={16}
      slidesPerView={1}
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      loop
      className="hero-swiper"
    >
      {SLIDES.map((id) => (
        <SwiperSlide key={id}>
          <div className="h-[160px] overflow-hidden rounded-[17px]">
            <img
              src={heroImage}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
