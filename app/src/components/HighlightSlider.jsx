import 'swiper/css';

import { Link, useNavigate } from 'react-router-dom';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { HighlightCard } from '@/pages/highlights/components/HighlightCard';
import { useGetHighlightsQuery } from '@/store/api/highlightApi';

export function HighlightSlider() {
  const navigate = useNavigate();
  const { data: highlights = [] } = useGetHighlightsQuery({ per_page: 10 });

  if (highlights.length === 0) return null;

  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between">
        <h2 className="text-[13px] font-bold tracking-wide text-muted uppercase md:text-[16px]">Highlights</h2>
        <Link
          to="/highlights"
          className="text-[12px] font-bold text-brand transition-opacity active:opacity-80 md:text-[16px]"
        >
          View More
        </Link>
      </header>

      <Swiper
        modules={[Autoplay]}
        spaceBetween={12}
        slidesPerView={1.5}
        breakpoints={{ 768: { slidesPerView: 2.5 } }}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop={highlights.length > 2}
        grabCursor
        className="highlight-swiper -mx-4 px-4"
      >
        {highlights.map((highlight) => (
          <SwiperSlide key={highlight.id}>
            <HighlightCard highlight={highlight} onClick={(h) => navigate(`/highlights/${h.id}`, { state: { highlight: h } })} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
