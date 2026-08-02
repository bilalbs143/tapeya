import 'swiper/css';

import { useMemo } from 'react';

import { Link } from 'react-router-dom';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { MatchCard } from '@/components/scorecard/MatchCard';
import { useLiveScoreChannels } from '@/hooks/useLiveScoreChannels';
import { normaliseLiveScores } from '@/lib/utils/liveScoreUtils';
import { useGetLiveScoresQuery } from '@/store/api/liveApi';

function LiveIcon() {
  return (
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-transparent">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
        <rect x="3" y="4" width="2" height="4" rx="1" fill="white" className="live-icon-bar" style={{ animationDelay: '0ms' }} />
        <rect
          x="7"
          y="3"
          width="2"
          height="6"
          rx="1"
          fill="#E53935"
          className="live-icon-bar"
          style={{ animationDelay: '200ms' }}
        />
      </svg>
    </div>
  );
}

/**
 * Home carousel of in-progress open-tournament cricket scores.
 * Hidden when the feed is empty (no skeleton).
 */
export function HomeLiveScoreSlider() {
  const { data: rows = [] } = useGetLiveScoresQuery(undefined, {
    pollingInterval: 60_000,
  });

  useLiveScoreChannels(rows);

  const matches = useMemo(() => normaliseLiveScores(rows), [rows]);

  if (matches.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LiveIcon />
          <h2 className="text-muted text-[13px] font-bold tracking-wide uppercase md:text-[16px]">Live Score</h2>
        </div>
        <Link to="/scorecard" className="text-brand text-[12px] font-bold transition-opacity active:opacity-80 md:text-[16px]">
          View More
        </Link>
      </header>

      <Swiper
        modules={[Autoplay]}
        spaceBetween={12}
        slidesPerView={1.15}
        breakpoints={{
          480: { slidesPerView: 1.35 },
          768: { slidesPerView: 2.15 },
          1024: { slidesPerView: 2.6 },
        }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={matches.length > 1}
        grabCursor
        className="home-live-score-swiper -mx-4 px-4 [&_.swiper-slide]:h-auto"
      >
        {matches.map((match) => (
          <SwiperSlide key={match.id}>
            <MatchCard
              match={match}
              showScheduleTableLinks={false}
              to={`/scorecard/${match.tournament_id}/match/${match.id}`}
              compact
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
