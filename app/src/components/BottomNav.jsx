import { Link, useLocation } from 'react-router-dom';

import feedNavIcon from '@/assets/images/icons/feed-navigation.svg';
import liveNavIcon from '@/assets/images/icons/live-navigation.svg';
import reelsNavIcon from '@/assets/images/icons/reels-navigation.svg';
import liveScoreIcon from '@/assets/images/icons/score-card-request.svg';
import shopNavIcon from '@/assets/images/icons/shop-navigation.svg';
import { BOTTOM_NAV_Z } from '@/lib/constants/layout';
import { BOTTOM_NAV_ITEMS } from '@/lib/constants/navigation';
import logo from '@/assets/images/logos/tapya-t.svg';

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

  const shopItem = BOTTOM_NAV_ITEMS.find((i) => i.path === '/shop');
  const scoreItem = BOTTOM_NAV_ITEMS.find((i) => i.path === '/live-score');
  const feedItem = BOTTOM_NAV_ITEMS.find((i) => i.path === '/feed');
  const reelsItem = BOTTOM_NAV_ITEMS.find((i) => i.path === '/reels');

  // Mobile bottom bar should be a strict 5-slot layout, with the Live tab
  // replaced by the centered circular logo (no "Live" label).
  const renderTab = ({ path, label }) => {
    const isActive = isTabActive(location.pathname, path);
    const icon = PATH_TO_ICON[path];

    return (
      <Link
        key={path}
        to={path}
        className={`flex flex-col items-center gap-1 transition-opacity active:opacity-80 ${
          isActive ? 'opacity-100' : 'opacity-70'
        }`}
        aria-current={isActive ? 'page' : undefined}
      >
        <img
          src={icon}
          alt=""
          className="h-6 w-6 shrink-0 object-contain"
        />
        <span
          className={`text-[13px] font-medium ${
            isActive ? 'text-[#DA9811]' : 'text-[#A2A6AB]'
          }`}
        >
          {label}
        </span>
      </Link>
    );
  };

  const isLogoActive = isTabActive(location.pathname, '/home');

  return (
    <nav
      className="fixed right-0 bottom-0 left-0 rounded-tl-[17px] rounded-tr-[17px] bg-[#141412] px-2 py-2 shadow-[0_-2px_10px_rgba(0,0,0,0.2)]"
      style={{ zIndex: BOTTOM_NAV_Z }}
      aria-label="Bottom navigation"
    >
      <div className="grid w-full grid-cols-5 items-center justify-items-center">
        {shopItem ? renderTab(shopItem) : null}
        {scoreItem ? renderTab(scoreItem) : null}

        {/* Center logo — lifted above the bar with a black border ring */}
        <Link
          to="/home"
          aria-current={isLogoActive ? 'page' : undefined}
          className={`-translate-y-6 flex items-center justify-center transition-opacity active:opacity-80 ${
            isLogoActive ? 'opacity-100' : 'opacity-90'
          }`}
        >
          <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full outline-[6px] outline-black outline-offset-0 bg-[#003C71]">
            <img
              src={logo}
              alt="Tapeya"
              className="h-[25px] w-auto ml-1 object-contain"
            />
          </div>
        </Link>

        {feedItem ? renderTab(feedItem) : null}
        {reelsItem ? renderTab(reelsItem) : null}
      </div>
    </nav>
  );
}
