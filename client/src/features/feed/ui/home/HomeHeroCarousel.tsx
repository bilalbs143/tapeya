import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Swiper as SwiperInstance } from 'swiper';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { isHeroSlideInteractive, openHeroExternalUrl, resolveHeroSlideAction } from '@/features/feed/lib/heroSliderCta';
import { useHeroStoreLinks } from '@/features/feed/lib/useHeroStoreLinks';
import type { HomeHeroSlide } from '@/features/feed/model/homeSchemas';
import { interestRoutes } from '@/features/interest';

import { cn } from '@/shared/lib/cn';
import { Skeleton } from '@/shared/ui/states';

import 'swiper/css';

const AUTOPLAY_MS = 5000;
/** One ratio for mobile + desktop — same creative scales up with width (e.g. 1600×800). */
const HERO_ASPECT = 'aspect-[2/1]';

type HomeHeroCarouselProps = {
  slides: readonly HomeHeroSlide[];
  loading?: boolean | undefined;
  className?: string | undefined;
};

/** Home hero carousel — Swiper; CTAs via `resolveHeroSlideAction`. */
export function HomeHeroCarousel({ slides, loading = false, className }: HomeHeroCarouselProps) {
  const swiperRef = useRef<SwiperInstance | null>(null);
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const storeLinks = useHeroStoreLinks();

  const loopSlides = useMemo(() => {
    if (!slides.length) return [];
    const min = Math.max(slides.length * 3, 9);
    const out: { slide: HomeHeroSlide; key: string }[] = [];
    for (let i = 0; i < min; i++) {
      const slide = slides[i % slides.length];
      if (!slide) continue;
      out.push({ slide, key: `${slide.id}-${i}` });
    }
    return out;
  }, [slides]);

  if (loading) {
    return (
      <div className={cn('relative px-4 tab:px-0', className)}>
        <div className={cn('relative w-full overflow-hidden', HERO_ASPECT)}>
          <Skeleton className="absolute inset-0 h-full w-full rounded-sheet" />
        </div>
        <div className="mt-3 flex h-2 justify-center" aria-hidden>
          <span className="inline-block h-2 w-2" />
        </div>
      </div>
    );
  }

  if (!slides.length) return null;

  const showDots = slides.length > 1;

  function goTo(index: number) {
    const swiper = swiperRef.current;
    if (!swiper) return;
    if (typeof swiper.slideToLoop === 'function') swiper.slideToLoop(index);
    else swiper.slideTo(index);
    setActive(index);
  }

  function handleSlideTap(slide: HomeHeroSlide) {
    const action = resolveHeroSlideAction(slide, storeLinks, interestRoutes.form);
    if (action.kind === 'navigate') navigate(action.path);
    else if (action.kind === 'external') openHeroExternalUrl(action.url);
  }

  return (
    <div className={cn('relative px-4 tab:px-0', className)}>
      <div className={cn('relative w-full overflow-hidden', HERO_ASPECT)}>
        <Swiper
          modules={[Autoplay]}
          className="home-hero-swiper absolute inset-0 h-full w-full [&_.swiper-slide]:h-full"
          spaceBetween={12}
          slidesPerView={1}
          centeredSlides={false}
          loop={showDots}
          breakpoints={{
            900: {
              slidesPerView: 1.5,
              centeredSlides: true,
              spaceBetween: 16,
            },
          }}
          autoplay={
            showDots
              ? {
                  delay: AUTOPLAY_MS,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
              : false
          }
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onRealIndexChange={(swiper) => {
            setActive(swiper.realIndex % slides.length);
          }}
        >
          {loopSlides.map(({ slide, key }) => (
            <SwiperSlide key={key}>
              <HeroSlideCard slide={slide} onTap={() => handleSlideTap(slide)} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div
        className={cn('mt-3 flex h-2 justify-center gap-1.5', !showDots && 'invisible')}
        role={showDots ? 'tablist' : undefined}
        aria-label={showDots ? 'Hero slides' : undefined}
        aria-hidden={!showDots}
      >
        {showDots ? (
          slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-label={`Slide ${i + 1}`}
              aria-selected={i === active}
              onClick={() => goTo(i)}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                i === active ? 'bg-brand-hover w-4' : 'bg-border w-2'
              )}
            />
          ))
        ) : (
          <span className="inline-block h-2 w-2" />
        )}
      </div>
    </div>
  );
}

function HeroSlideCard({ slide, onTap }: { slide: HomeHeroSlide; onTap: () => void }) {
  const tappable = isHeroSlideInteractive(slide);
  const media = (
    <>
      <img
        src={slide.image}
        alt={slide.alt}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {tappable && slide.ctaLabel ? (
        <span className="bg-brand text-ink absolute right-3 bottom-3 z-10 inline-flex items-center rounded-chip px-4 py-1.5 text-2xs font-bold tracking-wide shadow-[0_10px_25px_rgba(0,0,0,0.35)]">
          {slide.ctaLabel}
        </span>
      ) : null}
    </>
  );

  if (tappable) {
    return (
      <button
        type="button"
        onClick={onTap}
        className="bg-page-deep relative block h-full w-full overflow-hidden rounded-sheet p-0 text-left"
        aria-label={slide.ctaLabel || slide.alt}
      >
        {media}
      </button>
    );
  }

  return <div className="bg-page-deep relative h-full w-full overflow-hidden rounded-sheet">{media}</div>;
}
