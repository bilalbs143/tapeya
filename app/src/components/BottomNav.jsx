import { Link, useLocation } from 'react-router-dom';

import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { BOTTOM_NAV_Z } from '@/lib/constants/layout';

const profileIcon = `${CLOUDFRONT_APP_BASE}/images/icons/profile.svg`;
const scoreIcon = `${CLOUDFRONT_APP_BASE}/images/icons/score-bottom.svg`;
const shopIcon = `${CLOUDFRONT_APP_BASE}/images/icons/shop-navigation.svg`;
const upcomingIcon = `${CLOUDFRONT_APP_BASE}/images/icons/upcoming-bottom.svg`;
const logo = `${CLOUDFRONT_APP_BASE}/images/logos/tapya-t.svg`;

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
      <Link key={path} to={path} className="flex flex-col items-center gap-1" aria-current={isActive ? 'page' : undefined}>
        <img src={icon} alt="" className="h-6 w-6 shrink-0 object-contain" />
        <span className="text-[13px] font-medium text-muted">{label}</span>
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
      className="fixed right-0 bottom-0 left-0 rounded-tl-[17px] rounded-tr-[17px] bg-surface px-2 pt-1 shadow-[0_-2px_10px_rgba(0,0,0,0.2)]"
      style={{
        // Pad below the nav grid to cover the iPhone home indicator / Android
        // gesture bar so tab labels never disappear behind it.
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
        zIndex: BOTTOM_NAV_Z,
      }}
      aria-label="Bottom navigation"
    >
      <div className="grid w-full grid-cols-5 items-center justify-items-center">
        {shopItem ? renderTab(shopItem) : null}
        {scoreItem ? renderTab(scoreItem) : null}

        {/* Center logo — lifted above the bar with a black border ring */}
        <Link
          to="/home"
          aria-current={isLogoActive ? 'page' : undefined}
          className={`flex -translate-y-6 items-center justify-center transition-opacity active:opacity-80 ${isLogoActive ? 'opacity-100' : 'opacity-90'}`}
        >
          <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#003C71] outline-[6px] outline-offset-0 outline-black">
            <img src={logo} alt="Tapeya" className="ml-1 h-[25px] w-auto object-contain" />
          </div>
        </Link>

        {upcomingItem ? renderTab(upcomingItem) : null}
        {profileItem ? renderTab(profileItem) : null}
      </div>
    </nav>
  );
}
