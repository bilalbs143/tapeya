import { Link, useLocation } from 'react-router-dom';

import { BOTTOM_NAV_Z } from '@/lib/constants/layout';
import logo from '@/assets/images/logos/tapya-t.svg';
import shopIcon from '@/assets/images/icons/shop-navigation.svg';
import scoreIcon from '@/assets/images/icons/score-bottom.svg';
import profileIcon from '@/assets/images/icons/profile.svg';
import upcomingIcon from '@/assets/images/icons/upcoming-bottom.svg';

function isTabActive(pathname, tabPath) {
  return pathname === tabPath || pathname.startsWith(tabPath + '/');
}

export function BottomNav() {
  const location = useLocation();

  const items = [
    { path: '/shop', label: 'Shop', icon: shopIcon },
    { path: '/scorecard', label: 'Score', icon: scoreIcon },
    { path: '/upcoming-tournaments', label: 'Upcoming', icon: upcomingIcon },
    { path: '/profile', label: 'Profile', icon: profileIcon },
  ];

  const renderTab = ({ path, label, icon }) => {
    const isActive = isTabActive(location.pathname, path);

    return (
      <Link
        key={path}
        to={path}
        className="flex flex-col items-center gap-1"
        aria-current={isActive ? 'page' : undefined}
      >
        <img
          src={icon}
          alt=""
          className="h-6 w-6 shrink-0 object-contain"
        />
        <span
          className="text-[13px] font-medium text-[#A2A6AB]"
        >
          {label}
        </span>
      </Link>
    );
  };

  const isLogoActive = isTabActive(location.pathname, '/home');
  const shopItem = items.find((i) => i.path === '/shop');
  const scoreItem = items.find((i) => i.path === '/scorecard');
  const upcomingItem = items.find((i) => i.path === '/upcoming-tournaments');
  const profileItem = items.find((i) => i.path === '/profile');

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

        {upcomingItem ? renderTab(upcomingItem) : null}
        {profileItem ? renderTab(profileItem) : null}
      </div>
    </nav>
  );
}
