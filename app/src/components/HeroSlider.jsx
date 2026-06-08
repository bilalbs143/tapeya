import 'swiper/css';

import { useState } from 'react';

import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { useGetHeroSlidersQuery } from '@/store/api/heroSliderApi';

const AUTOPLAY_DELAY_MS = 5000;

// Resolved once at module load — avoids <picture> clone issues in Swiper loop.
const isDesktopOnLoad = typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;

export function HeroSlider() {
  const { data: slides = [], isLoading } = useGetHeroSlidersQuery();
  const [activeIndex, setActiveIndex] = useState(0);

  if (isLoading) {
    return <div className="bg-surface aspect-[16/5] w-full animate-pulse overflow-hidden rounded-[17px]" />;
  }

  const list = Array.isArray(slides) && slides.length > 0 ? slides.filter((s) => s?.image_mobile) : null;
  if (!list?.length) return null;

  // Pad to at least 9 items so Swiper loop always has real slides (not just
  // internal clones) visible on both sides — fixes the blank-right-side bug
  // caused by Swiper 12 removing loopedSlides/loopAdditionalSlides.
  const MIN_ITEMS = Math.max(list.length * 3, 9);
  const loopItems = Array.from({ length: MIN_ITEMS }, (_, i) => list[i % list.length]);

  return (
    <div className="relative">
      <Swiper
        modules={[Autoplay]}
        spaceBetween={12}
        slidesPerView={1}
        centeredSlides={false}
        breakpoints={{
          1024: {
            slidesPerView: 1.4,
            centeredSlides: true,
            spaceBetween: 16,
          },
        }}
        autoplay={{
          delay: AUTOPLAY_DELAY_MS,
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
          stopOnLastSlide: false,
        }}
        loop
        // realIndex mod list.length gives the correct dot to highlight
        onRealIndexChange={(swiper) => setActiveIndex(swiper.realIndex % list.length)}
        className="hero-swiper"
      >
        {loopItems.map((slide, index) => {
          const src = isDesktopOnLoad ? slide.image_desktop || slide.image_mobile : slide.image_mobile;
          return (
            <SwiperSlide key={`${slide.id}-${index}`}>
              <div className="overflow-hidden rounded-[17px]">
                <img src={src} alt={slide.alt ?? slide.title ?? ''} className="block h-auto w-full" />
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Custom pagination: always shows list.length dots with correct active state */}
      {list.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {list.map((_, i) => (
            <span
              key={i}
              className={`inline-block h-2 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-4 bg-[#FDB022]' : 'w-2 bg-white/40'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
