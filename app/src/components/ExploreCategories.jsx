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
      <h2 className="text-[13px] font-bold tracking-wide text-[#A2A6AB] uppercase">
        Explore
      </h2>
      <div className="grid grid-cols-4 gap-3">
        {EXPLORE_CATEGORIES.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            className="flex h-[78px] w-[78px] flex-col items-center justify-center gap-2 rounded-[17px] bg-[#141412] transition-colors duration-200 ease-out hover:bg-[#1c1c1a] active:opacity-90"
          >
            <img
              src={PATH_TO_ICON[path]}
              alt=""
              className="h-5 w-5 shrink-0 object-contain"
            />
            <span className="text-center text-[11px] font-bold text-white">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
