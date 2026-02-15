import { Link, useLocation } from 'react-router-dom';

import feedNavIcon from '@/assets/images/icons/feed-navigation.svg';
import liveNavIcon from '@/assets/images/icons/live-navigation.svg';
import reelsNavIcon from '@/assets/images/icons/reels-navigation.svg';
import liveScoreIcon from '@/assets/images/icons/score-card-request.svg';
import shopNavIcon from '@/assets/images/icons/shop-navigation.svg';

const ITEMS = [
  { path: '/shop', label: 'Shop', icon: shopNavIcon },
  { path: '/live-score', label: 'Score', icon: liveScoreIcon },
  { path: '/live', label: 'Live', icon: liveNavIcon },
  { path: '/feed', label: 'Feed', icon: feedNavIcon },
  { path: '/reels', label: 'Reels', icon: reelsNavIcon },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed right-0 bottom-0 left-0 z-40 flex items-center justify-around rounded-tl-[17px] rounded-tr-[17px] bg-[#141412] px-2 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.2)]"
      aria-label="Bottom navigation"
    >
      {ITEMS.map(({ path, label, icon }) => {
        const isActive =
          path === '/shop'
            ? location.pathname === path ||
              location.pathname.startsWith('/shop/')
            : location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            className="flex flex-col items-center gap-1 transition-opacity active:opacity-80"
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
          >
            <img
              src={icon}
              alt=""
              className="h-6 w-6 shrink-0 object-contain"
              aria-hidden
            />
            <span className="text-[13px] font-medium text-[#A2A6AB]">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
