import { Link, useLocation } from 'react-router-dom';

import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { BOTTOM_NAV_Z } from '@/lib/constants/layout';

const homeIcon = `${CLOUDFRONT_APP_BASE}/images/icons/home-navigation.svg`;
const profileIcon = `${CLOUDFRONT_APP_BASE}/images/icons/profile.svg`;
const reelsIcon = `${CLOUDFRONT_APP_BASE}/images/icons/reels-navigation-b.svg`;
const shopIcon = `${CLOUDFRONT_APP_BASE}/images/icons/shop-navigation.svg`;
const upcomingIcon = `${CLOUDFRONT_APP_BASE}/images/icons/upcoming-bottom.svg`;

function isTabActive(pathname, tabPath) {
  return pathname === tabPath || pathname.startsWith(tabPath + '/');
}

export function BottomNav() {
  const location = useLocation();

  const items = [
    { path: '/shop', label: 'Shop', icon: shopIcon },
    { path: '/reels', label: 'Reels', icon: reelsIcon },
    { path: '/home', label: 'Home', icon: homeIcon },
    { path: '/upcoming-tournaments', label: 'Upcoming', icon: upcomingIcon },
    { path: '/profile', label: 'Profile', icon: profileIcon },
  ];

  const renderTab = ({ path, label, icon }) => {
    const isActive = isTabActive(location.pathname, path);

    return (
      <Link
        key={path}
        to={path}
        className="group relative flex h-[50px] min-w-12 flex-col items-center justify-center gap-1 rounded-xl px-1 transition-colors duration-200 focus-visible:outline-none"
        aria-current={isActive ? 'page' : undefined}
      >
        <span className="grid h-6 w-8 place-items-center">
          <img
            src={icon}
            alt=""
            className={`h-[22px] w-[22px] shrink-0 object-contain transition-opacity duration-200 ${
              isActive ? 'opacity-100' : 'opacity-70 group-active:opacity-100'
            }`}
          />
        </span>
        <span
          className={`max-w-full truncate text-[11px] leading-none font-medium tracking-[0.01em] transition-colors duration-200 ${
            isActive ? 'text-brand' : 'text-muted'
          }`}
        >
          {label}
        </span>
        <span
          aria-hidden
          className={`bg-brand absolute bottom-0 h-0.5 rounded-full transition-all duration-200 ${
            isActive ? 'w-4 opacity-100' : 'w-0 opacity-0'
          }`}
        />
      </Link>
    );
  };

  return (
    <nav
      data-app-bottom-nav=""
      className="bg-surface/98 fixed right-0 bottom-0 left-0 border-t border-white/6 px-2 pt-1 shadow-[0_-6px_20px_rgba(0,0,0,0.24)] backdrop-blur-xl"
      style={{
        paddingBottom: 'max(6px, env(safe-area-inset-bottom))',
        zIndex: BOTTOM_NAV_Z,
      }}
      aria-label="Bottom navigation"
    >
      <div className="grid h-[54px] w-full grid-cols-5 items-center justify-items-center">{items.map(renderTab)}</div>
    </nav>
  );
}
