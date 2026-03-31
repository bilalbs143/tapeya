import { useEffect, useState } from 'react';

import { Link, useLocation } from 'react-router-dom';

import hamburgerIcon from '@/assets/images/icons/hamburger-icon.svg';
import notificationIcon from '@/assets/images/icons/notification-icon.svg';
import profileIcon from '@/assets/images/icons/profile.svg';
import scoreIcon from '@/assets/images/icons/score-bottom.svg';
import shopNavIcon from '@/assets/images/icons/shop-navigation.svg';
import upcomingIcon from '@/assets/images/icons/upcoming-bottom.svg';
import logo from '@/assets/images/logos/tapya-t.svg';
import {
  NAVBAR_HEIGHT,
  NAVBAR_SCROLL_THRESHOLD,
  NAVBAR_Z,
} from '@/lib/constants/layout';
import { BOTTOM_NAV_ITEMS } from '@/lib/constants/navigation';

const iconBtn =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#141412] transition-colors hover:bg-zinc-700';

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

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > NAVBAR_SCROLL_THRESHOLD;
      setScrolled((prev) => (prev === isScrolled ? prev : isScrolled));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 right-0 left-0 flex items-center justify-between border-b border-transparent px-4 transition-colors duration-300 lg:left-[280px] lg:border-[#1A1A1A] lg:bg-black ${
        scrolled ? 'bg-black' : 'bg-transparent'
      }`}
      style={{ height: NAVBAR_HEIGHT, zIndex: NAVBAR_Z }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4 lg:gap-6">
        <Link to="/home" className="shrink-0" aria-label="Tapeya home">
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
                className={`flex flex-col items-center gap-0.5 transition-opacity hover:opacity-100 lg:flex-row lg:items-center lg:gap-2 lg:opacity-100 ${
                  isActive ? 'opacity-100' : 'opacity-70'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <img
                  src={icon}
                  alt=""
                  className="h-5 w-5 shrink-0 object-contain lg:h-4 lg:w-4"
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
          })}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Link
          to="/notification-center"
          className={iconBtn}
          aria-label="Notifications"
        >
          <img src={notificationIcon} alt="" className="h-3.5 w-3.5" />
        </Link>

        <button
          type="button"
          className={`${iconBtn} lg:hidden`}
          aria-label="Menu"
          onClick={onMenuClick}
        >
          <img src={hamburgerIcon} alt="" className="h-3 w-[17px]" />
        </button>
      </div>
    </nav>
  );
}
