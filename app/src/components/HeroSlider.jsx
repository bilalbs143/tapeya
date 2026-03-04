import 'swiper/css';
import 'swiper/css/pagination';

import { Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { useGetHeroSlidersQuery } from '@/store/api/heroSliderApi';

export function HeroSlider() {
  const { data: slides = [], isLoading } = useGetHeroSlidersQuery();

  if (isLoading) {
    return (
      <div className="h-[160px] animate-pulse overflow-hidden rounded-[17px] bg-[#141412]" />
    );
  }

  const list = Array.isArray(slides) && slides.length > 0 ? slides : null;
  if (!list) return null;

  return (
    <Swiper
      modules={[Autoplay, Pagination]}
      spaceBetween={16}
      slidesPerView={1}
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      loop={list.length > 1}
      className="hero-swiper"
    >
      {list.map((slide) => (
        <SwiperSlide key={slide.id}>
          <div className="h-[160px] overflow-hidden rounded-[17px]">
            <img
              src={slide.image}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
