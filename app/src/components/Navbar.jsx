import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import hamburgerIcon from '@/assets/images/icons/hamburger-icon.svg';
import notificationIcon from '@/assets/images/icons/notification-icon.svg';
import logo from '@/assets/images/logos/tapya-t.svg';
import {
  NAVBAR_HEIGHT,
  NAVBAR_SCROLL_THRESHOLD,
  NAVBAR_Z,
} from '@/lib/constants/layout';

const iconBtn =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#141412] transition-colors hover:bg-zinc-700';

export function Navbar({ onMenuClick }) {
  const [scrolled, setScrolled] = useState(false);

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
      className={`fixed top-0 right-0 left-0 flex items-center justify-between px-4 transition-colors duration-300 ${
        scrolled ? 'bg-black' : 'bg-transparent'
      }`}
      style={{ height: NAVBAR_HEIGHT, zIndex: NAVBAR_Z }}
    >
      <Link to="/home" className="shrink-0" aria-label="Tapeya home">
        <img src={logo} alt="" className="h-8 w-auto" />
      </Link>

      <div className="flex items-center gap-2">
        <Link
          to="/notification-center"
          className={iconBtn}
          aria-label="Notifications"
        >
          <img src={notificationIcon} alt="" className="h-3.5 w-3.5" />
        </Link>

        <button
          type="button"
          className={iconBtn}
          aria-label="Menu"
          onClick={onMenuClick}
        >
          <img src={hamburgerIcon} alt="" className="h-3 w-[17px]" />
        </button>
      </div>
    </nav>
  );
}
