import { useEffect, useState } from 'react';

import { Link, useLocation } from 'react-router-dom';

import { NavbarCartButton } from '@/components/navbar/NavbarCartButton';
import { NavbarIconBadge } from '@/components/navbar/NavbarIconBadge';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { LG_MEDIA_QUERY, NAVBAR_HEIGHT, NAVBAR_SCROLL_THRESHOLD, NAVBAR_Z } from '@/lib/constants/layout';
import { NAVBAR_ICON_BTN_CLASS } from '@/lib/constants/navbar';
import { BOTTOM_NAV_ITEMS } from '@/lib/constants/navigation';
import { formatCountBadge } from '@/lib/utils/displayUtils';
import { isHeroNavbarPath } from '@/lib/utils/routeUtils';
import { useGetNotificationUnreadCountQuery } from '@/store/api/notificationApi';
import { useAppSelector } from '@/store/hooks';

const hamburgerIcon = `${CLOUDFRONT_APP_BASE}/images/icons/hamburger-icon.svg`;
const notificationIcon = `${CLOUDFRONT_APP_BASE}/images/icons/notification-icon.svg`;
const profileIcon = `${CLOUDFRONT_APP_BASE}/images/icons/profile.svg`;
const scoreIcon = `${CLOUDFRONT_APP_BASE}/images/icons/score-bottom.svg`;
const shopNavIcon = `${CLOUDFRONT_APP_BASE}/images/icons/shop-navigation.svg`;
const upcomingIcon = `${CLOUDFRONT_APP_BASE}/images/icons/upcoming-bottom.svg`;
const logo = `${CLOUDFRONT_APP_BASE}/images/logos/tapya-t.svg`;

const DESKTOP_NAV_PATH_TO_ICON = {
  '/shop': shopNavIcon,
  '/scorecard': scoreIcon,
  '/upcoming-tournaments': upcomingIcon,
  '/profile': profileIcon,
};

function isTabActive(pathname, tabPath) {
  return pathname === tabPath || pathname.startsWith(tabPath + '/');
}

export function Navbar({ onMenuClick }) {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const accessToken = useAppSelector((s) => s.auth?.accessToken);
  const { data: unreadData } = useGetNotificationUnreadCountQuery(undefined, {
    skip: !accessToken,
  });
  const unreadCount = Math.max(0, unreadData?.unreadCount ?? 0);
  const badgeLabel = formatCountBadge(unreadCount);
  const isDesktop = useMediaQuery(LG_MEDIA_QUERY);

  // Re-run on pathname change so scrolled resets correctly when navigating
  // back to a hero page that starts at scroll position 0.
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > NAVBAR_SCROLL_THRESHOLD;
      setScrolled((prev) => (prev === isScrolled ? prev : isScrolled));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Non-hero pages are always solid — no transparent phase.
  const alwaysSolid = !isHeroNavbarPath(location.pathname, isDesktop);

  return (
    <nav
      className={`lg:border-surface-border fixed top-0 right-0 left-0 flex items-center justify-between border-b border-transparent px-4 transition-colors duration-300 lg:left-[280px] ${
        scrolled || alwaysSolid ? 'bg-black lg:bg-black' : 'bg-transparent lg:bg-transparent'
      }`}
      style={{
        // paddingTop pushes the navbar *content* (logo, icons) below the status
        // bar while the navbar background extends all the way to the screen edge,
        // covering the status bar area gracefully (viewport-fit=cover).
        paddingTop: 'env(safe-area-inset-top)',
        height: `calc(${NAVBAR_HEIGHT}px + env(safe-area-inset-top))`,
        zIndex: NAVBAR_Z,
      }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4 lg:gap-6">
        <Link to="/home" className="shrink-0" aria-label="Tapeya Home">
          <img src={logo} alt="" className="h-8 w-auto" />
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-1 lg:flex lg:gap-6">
          {BOTTOM_NAV_ITEMS.map(({ path, label }) => {
            const isActive = isTabActive(location.pathname, path);
            const icon = DESKTOP_NAV_PATH_TO_ICON[path];
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center gap-0.5 transition-opacity hover:opacity-100 lg:flex-row lg:items-center lg:gap-2 lg:opacity-100 ${isActive ? 'opacity-100' : 'opacity-70'}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <img src={icon} alt="" className="h-5 w-5 shrink-0 object-contain lg:h-4 lg:w-4" />
                <span className={`text-[13px] font-medium ${isActive ? 'text-brand' : 'text-muted'}`}>{label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <NavbarCartButton />

        <Link
          to="/notification-center"
          className={`${NAVBAR_ICON_BTN_CLASS} relative`}
          aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        >
          <img src={notificationIcon} alt="" className="h-3.5 w-3.5" />
          <NavbarIconBadge label={badgeLabel} />
        </Link>

        <button type="button" className={`${NAVBAR_ICON_BTN_CLASS} lg:hidden`} aria-label="Menu" onClick={onMenuClick}>
          <img src={hamburgerIcon} alt="" className="h-3 w-[17px]" />
        </button>
      </div>
    </nav>
  );
}
