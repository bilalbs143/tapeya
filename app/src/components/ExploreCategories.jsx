import { Link } from 'react-router-dom';

import draftingIcon from '@/assets/images/icons/drafting.svg';
import highlightsIcon from '@/assets/images/icons/highlights.svg';
import liveIcon from '@/assets/images/icons/live-icon.svg';
import liveScoreIcon from '@/assets/images/icons/live-score.svg';
import rankingsIcon from '@/assets/images/icons/rankings.svg';
import reelsIcon from '@/assets/images/icons/reels.svg';
import shopIcon from '@/assets/images/icons/shop.svg';
import upcomingIcon from '@/assets/images/icons/upcoming.svg';
import { EXPLORE_CATEGORIES } from '@/lib/constants/navigation';

const PATH_TO_ICON = {
  '/live': liveIcon,
  '/scorecard': liveScoreIcon,
  '/ranking': rankingsIcon,
  '/shop': shopIcon,
  '/upcoming-tournaments': upcomingIcon,
  '/drafting': draftingIcon,
  '/reels': reelsIcon,
  '/highlights': highlightsIcon,
};

export function ExploreCategories() {
  return (
    <section className="space-y-4">
      <h2 className="text-[13px] font-bold tracking-wide text-[#A2A6AB] uppercase md:text-[16px]">
        <span>Explore</span>
      </h2>
      <div className="grid grid-cols-4 gap-3 md:grid-cols-4 md:gap-4">
        {EXPLORE_CATEGORIES.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            className="flex min-h-[90px] w-full flex-col items-center justify-center gap-2 rounded-[17px] bg-[#141412] transition-colors duration-200 ease-out hover:bg-[#1c1c1a] active:opacity-90 md:h-auto md:min-h-[72px] md:flex-row md:items-center md:gap-3 md:px-4 md:hover:bg-[#2C2C2C]"
          >
            <img
              src={PATH_TO_ICON[path]}
              alt=""
              className="h-5 w-5 shrink-0 object-contain md:h-8 md:w-8"
            />
            <span className="text-center text-[11px] font-bold text-white md:text-left md:text-[14px] md:font-medium">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
