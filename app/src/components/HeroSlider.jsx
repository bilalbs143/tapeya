import 'swiper/css';
import 'swiper/css/pagination';

import { Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { useGetHeroSlidersQuery } from '@/store/api/heroSliderApi';

const AUTOPLAY_DELAY_MS = 5000;

export function HeroSlider() {
  const { data: slides = [], isLoading } = useGetHeroSlidersQuery();

  if (isLoading) {
    return (
      <div className="h-[160px] animate-pulse overflow-hidden rounded-[17px] bg-[#141412] lg:h-[250px]" />
    );
  }

  const list =
    Array.isArray(slides) && slides.length > 0
      ? slides.filter((s) => s?.image_mobile)
      : null;
  if (!list?.length) return null;

  return (
    <Swiper
      modules={[Autoplay, Pagination]}
      spaceBetween={16}
      slidesPerView={1}
      autoplay={{ delay: AUTOPLAY_DELAY_MS, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      loop={list.length > 1}
      className="hero-swiper"
    >
      {list.map((slide) => {
        const mobileSrc = slide.image_mobile;
        const desktopSrc = slide.image_desktop || slide.image_mobile;
        return (
          <SwiperSlide key={slide.id}>
            <div className="h-[160px] overflow-hidden rounded-[17px] lg:h-[250px]">
              <picture className="block h-full w-full">
                {slide.image_desktop ? (
                  <source media="(min-width: 1024px)" srcSet={desktopSrc} />
                ) : null}
                <img
                  src={mobileSrc}
                  alt={slide.alt ?? slide.title ?? ''}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </picture>
            </div>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}
