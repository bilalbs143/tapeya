import { Link } from 'react-router-dom';

import quickMatchExploreIcon from '@/assets/images/icons/quick-match-explore.svg';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { EXPLORE_CATEGORIES } from '@/lib/constants/navigation';

const highlightsIcon = `${CLOUDFRONT_APP_BASE}/images/icons/highlights.svg`;
const liveScoreIcon = `${CLOUDFRONT_APP_BASE}/images/icons/live-score.svg`;
const rankingsIcon = `${CLOUDFRONT_APP_BASE}/images/icons/rankings.svg`;
const upcomingIcon = `${CLOUDFRONT_APP_BASE}/images/icons/upcoming.svg`;

const PATH_TO_ICON = {
  '/quick-match': quickMatchExploreIcon,
  '/scorecard': liveScoreIcon,
  '/ranking': rankingsIcon,
  '/upcoming-tournaments': upcomingIcon,
  '/highlights': highlightsIcon,
};

export function ExploreCategories() {
  return (
    <section className="space-y-3">
      <h2 className="text-muted text-[13px] font-bold tracking-wide uppercase md:text-[16px]">
        <span>Explore</span>
      </h2>
      <div className="mx-auto grid w-full max-w-[560px] grid-cols-5 gap-1.5 sm:gap-2.5">
        {EXPLORE_CATEGORIES.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            className="group flex min-w-0 flex-col items-center gap-1.5 text-center focus-visible:outline-none active:opacity-80"
          >
            <span className="bg-surface group-hover:bg-surface-raised group-focus-visible:ring-brand/50 grid aspect-square w-full max-w-16 place-items-center rounded-[18px] border border-white/6 shadow-[0_6px_18px_rgba(0,0,0,0.22)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-white/10 group-focus-visible:ring-2 group-focus-visible:outline-none sm:max-w-18">
              <img
                src={PATH_TO_ICON[path]}
                alt=""
                className="h-6 w-6 shrink-0 object-contain transition-transform duration-200 group-hover:scale-110 sm:h-7 sm:w-7"
              />
            </span>
            <span className="w-full text-center text-[10px] leading-none font-semibold tracking-tight whitespace-nowrap text-white/90 sm:text-[11px]">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
