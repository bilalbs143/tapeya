import { Link } from 'react-router-dom';

import liveIcon from '@/assets/images/icons/live-icon.svg';
import liveScoreIcon from '@/assets/images/icons/live-score.svg';
import rankingsIcon from '@/assets/images/icons/rankings.svg';
import shopIcon from '@/assets/images/icons/shop.svg';
import upcomingIcon from '@/assets/images/icons/upcoming.svg';
import draftingIcon from '@/assets/images/icons/drafting.svg';
import reelsIcon from '@/assets/images/icons/reels.svg';
import highlightsIcon from '@/assets/images/icons/highlights.svg';

const CATEGORIES = [
  { id: 'live', label: 'Live', path: '/live', icon: liveIcon },
  { id: 'live-score', label: 'Live Score', path: '/live-score', icon: liveScoreIcon },
  { id: 'rankings', label: 'Rankings', path: '/rankings', icon: rankingsIcon },
  { id: 'shop', label: 'Shop', path: '/shop', icon: shopIcon },
  { id: 'upcoming', label: 'Upcoming', path: '/upcoming', icon: upcomingIcon },
  { id: 'drafting', label: 'Drafting', path: '/drafting', icon: draftingIcon },
  { id: 'reels', label: 'Reels', path: '/reels', icon: reelsIcon },
  { id: 'highlights', label: 'Highlights', path: '/highlights', icon: highlightsIcon },
];

const ITEM_STYLE = {
  height: 78,
  width: 78,
  borderRadius: 17,
};

export function ExploreCategories() {
  return (
    <section className="space-y-4">
      <h2 className="text-[13px] font-bold uppercase tracking-wide text-[#A2A6AB]">
        Explore
      </h2>
      <div className="grid grid-cols-4 gap-3">
        {CATEGORIES.map(({ id, label, path, icon }) => (
          <Link
            key={id}
            to={path}
            className="flex flex-col items-center justify-center gap-2 bg-[#141412] transition-colors duration-200 ease-out hover:bg-[#1c1c1a] active:opacity-90"
            style={ITEM_STYLE}
            aria-label={label}
          >
            <img src={icon} alt="" className="h-5 w-5 shrink-0 object-contain" />
            <span className="text-center text-[11px] font-bold text-white">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
