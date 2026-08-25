import 'swiper/css';

import { useState } from 'react';

import { Browser } from '@capacitor/browser';
import { useNavigate } from 'react-router-dom';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { useDialog } from '@/context/DialogContext';
import { useNativeStoreVersionInfo } from '@/hooks/useNativeStoreVersionInfo';
import { useWebStoreLinks } from '@/hooks/useWebStoreLinks';
import { useGetHeroSlidersQuery } from '@/store/api/heroSliderApi';
import { LoaderBlock } from '@/ui/Loader';

const AUTOPLAY_DELAY_MS = 5000;

/** Shared box for loader + slides so Home doesn’t jump when images replace the spinner.
 * Mobile: 16/5 made ~15.5% taller (10% then +5%). Desktop stays 16/5 (1920×600). */
const HERO_ASPECT_CLASS = 'aspect-[640/254] lg:aspect-[16/5]';

const isDesktopOnLoad = typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;

function isHttpUrl(url) {
  return /^https?:\/\//i.test(url);
}

function toInAppPath(url) {
  if (!url) return null;
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  if (!isHttpUrl(url)) return null;
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}${parsed.hash}` || '/';
  } catch {
    return null;
  }
}

function isInteractive(slide) {
  if (slide.cta_type === 'url') return Boolean(slide.cta_url);
  if (slide.cta_type === 'dialog') return Boolean(slide.cta_dialog_key);
  return Boolean(slide.cta_url && slide.cta_label);
}

export function HeroSlider() {
  const { data: slides = [], isLoading } = useGetHeroSlidersQuery();
  const [activeIndex, setActiveIndex] = useState(0);
  const { openDialog } = useDialog();
  const navigate = useNavigate();
  const storeLinks = useWebStoreLinks();
  const nativeStore = useNativeStoreVersionInfo();

  const list = !isLoading && Array.isArray(slides) && slides.length > 0 ? slides.filter((s) => s?.image_mobile) : null;
  if (!isLoading && !list?.length) return null;

  const MIN_ITEMS = list ? Math.max(list.length * 3, 9) : 0;
  const loopItems = list ? Array.from({ length: MIN_ITEMS }, (_, i) => list[i % list.length]) : [];
  const showDots = Boolean(list && list.length > 1);

  const dialogPropsFor = (slide) => {
    switch (slide.cta_dialog_key) {
      case 'downloadApp':
        return {
          appStoreUrl: storeLinks.appStoreUrl,
          appStoreName: storeLinks.appStoreName,
          playStoreUrl: storeLinks.playStoreUrl,
          playStoreName: storeLinks.playStoreName,
        };
      case 'appUpdate':
        return { storeUrl: nativeStore.storeUrl, storeName: nativeStore.storeName };
      case 'interestCampaign':
        return { slug: slide.cta_dialog_param };
      default:
        return {};
    }
  };

  const handleSlideTap = (slide) => {
    if (slide.cta_type === 'dialog' && slide.cta_dialog_key) {
      openDialog(slide.cta_dialog_key, dialogPropsFor(slide));
      return;
    }

    const url = slide.cta_url;
    if (!url) return;

    if (slide.cta_target_blank !== false && isHttpUrl(url)) {
      Browser.open({ url });
      return;
    }

    const path = toInAppPath(url);
    if (path) navigate(path);
  };

  return (
    <div className="relative">
      {/* Fixed aspect shell — loader and slides share height so content below doesn’t jump */}
      <div className={`relative w-full overflow-hidden ${HERO_ASPECT_CLASS}`}>
        {isLoading ? (
          <LoaderBlock label="Loading banners" className="absolute inset-0" />
        ) : (
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
            onRealIndexChange={(swiper) => setActiveIndex(swiper.realIndex % list.length)}
            className="hero-swiper absolute inset-0 h-full w-full"
          >
            {loopItems.map((slide, index) => {
              const src = isDesktopOnLoad ? slide.image_desktop || slide.image_mobile : slide.image_mobile;
              const tappable = isInteractive(slide);
              const media = (
                <>
                  <img src={src} alt={slide.alt ?? slide.title ?? ''} className="absolute inset-0 h-full w-full object-cover" />
                  {tappable && slide.cta_label ? (
                    <span className="bg-brand text-ink absolute right-3 bottom-3 z-10 inline-flex items-center rounded-[6px] px-4 py-1.5 text-[12px] font-bold tracking-wide shadow-[0_10px_25px_rgba(0,0,0,0.6)]">
                      {slide.cta_label}
                    </span>
                  ) : null}
                </>
              );

              return (
                <SwiperSlide key={`${slide.id}-${index}`} className="h-full!">
                  {tappable ? (
                    <button
                      type="button"
                      onClick={() => handleSlideTap(slide)}
                      className="relative block h-full w-full overflow-hidden rounded-[17px] border-0 bg-transparent p-0 text-left"
                    >
                      {media}
                    </button>
                  ) : (
                    <div className="relative h-full w-full overflow-hidden rounded-[17px]">{media}</div>
                  )}
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}
      </div>

      {/* Always reserve dots row height so pagination appearing doesn’t nudge the feed */}
      <div className={`mt-3 flex h-2 justify-center gap-1.5 ${showDots ? '' : 'invisible'}`} aria-hidden={!showDots}>
        {showDots ? (
          list.map((_, i) => (
            <span
              key={i}
              className={`inline-block h-2 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-4 bg-[#FDB022]' : 'w-2 bg-white/40'}`}
            />
          ))
        ) : (
          <span className="inline-block h-2 w-2" />
        )}
      </div>
    </div>
  );
}
