import { Link, useLocation } from 'react-router-dom';

import { UserAvatar } from '@/components/UserAvatar';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { BOTTOM_NAV_Z } from '@/lib/constants/layout';
import { handlePrimaryTabClick } from '@/lib/navigation/tabReselect';
import { useGetMeQuery } from '@/store/api/authApi';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';

const homeIcon = `${CLOUDFRONT_APP_BASE}/images/icons/home-navigation.svg`;
const reelsIcon = `${CLOUDFRONT_APP_BASE}/images/icons/reels-navigation-b.svg`;
const shopIcon = `${CLOUDFRONT_APP_BASE}/images/icons/shop-navigation.svg`;
const liveIcon = `${CLOUDFRONT_APP_BASE}/images/icons/live-navigation.svg`;

function isTabActive(pathname, tabPath) {
  return pathname === tabPath || pathname.startsWith(tabPath + '/');
}

function ProfileTabIcon({ avatarUrl, isActive }) {
  return (
    <UserAvatar
      src={avatarUrl}
      size="nav"
      className={`rounded-full ring-1 ring-white/25 transition-opacity duration-200 ${
        isActive ? 'opacity-100' : 'opacity-70 group-active:opacity-100'
      }`}
    />
  );
}

export function BottomNav() {
  const location = useLocation();
  const user = useAppSelector(selectUser);
  const { data: meResponse } = useGetMeQuery(undefined, {
    skip: !user?.id,
  });
  const profileUser = meResponse?.data ?? user;
  const avatarUrl = profileUser?.avatar_url || profileUser?.avatarUrl || null;

  const items = [
    { path: '/home', label: 'Home', icon: homeIcon },
    { path: '/shop', label: 'Shop', icon: shopIcon },
    { path: '/reels', label: 'Reels', icon: reelsIcon },
    { path: '/live', label: 'Live', icon: liveIcon },
    { path: '/profile', label: 'Profile', isProfile: true },
  ];

  const renderTab = ({ path, label, icon, isProfile }) => {
    const isActive = isTabActive(location.pathname, path);

    return (
      <Link
        key={path}
        to={path}
        onClick={(event) => handlePrimaryTabClick(event, location.pathname, path)}
        className="group relative flex h-[50px] min-w-12 flex-col items-center justify-center gap-1 rounded-xl px-1 transition-colors duration-200 focus-visible:outline-none"
        aria-current={isActive ? 'page' : undefined}
      >
        <span className="grid h-6 w-8 place-items-center">
          {isProfile ? (
            <ProfileTabIcon avatarUrl={avatarUrl} isActive={isActive} />
          ) : (
            <img
              src={icon}
              alt=""
              className={`h-[22px] w-[22px] shrink-0 object-contain transition-opacity duration-200 ${
                isActive ? 'opacity-100' : 'opacity-70 group-active:opacity-100'
              }`}
            />
          )}
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
