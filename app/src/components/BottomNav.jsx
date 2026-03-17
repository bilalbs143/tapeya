import { Link, useLocation } from 'react-router-dom';

import feedNavIcon from '@/assets/images/icons/feed-navigation.svg';
import liveNavIcon from '@/assets/images/icons/live-navigation.svg';
import reelsNavIcon from '@/assets/images/icons/reels-navigation.svg';
import liveScoreIcon from '@/assets/images/icons/score-card-request.svg';
import shopNavIcon from '@/assets/images/icons/shop-navigation.svg';
import { BOTTOM_NAV_Z } from '@/lib/constants/layout';
import { BOTTOM_NAV_ITEMS } from '@/lib/constants/navigation';

const PATH_TO_ICON = {
  '/shop': shopNavIcon,
  '/live-score': liveScoreIcon,
  '/live': liveNavIcon,
  '/feed': feedNavIcon,
  '/reels': reelsNavIcon,
};

function isTabActive(pathname, tabPath) {
  return pathname === tabPath || pathname.startsWith(tabPath + '/');
}

export function BottomNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed right-0 bottom-0 left-0 flex items-center justify-around rounded-tl-[17px] rounded-tr-[17px] bg-[#141412] px-2 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.2)]"
      style={{ zIndex: BOTTOM_NAV_Z }}
      aria-label="Bottom navigation"
    >
      {BOTTOM_NAV_ITEMS.map(({ path, label }) => {
        const isActive = isTabActive(location.pathname, path);
        const icon = PATH_TO_ICON[path];

        return (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center gap-1 transition-opacity active:opacity-80 ${isActive ? 'opacity-100' : 'opacity-70'}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <img
              src={icon}
              alt=""
              className="h-6 w-6 shrink-0 object-contain"
            />
            <span
              className={`text-[13px] font-medium ${isActive ? 'text-[#DA9811]' : 'text-[#A2A6AB]'}`}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
