import { useEffect, useState } from 'react';

import hamburgerIcon from '@/assets/images/icons/hamburger-icon.svg';
import notificationIcon from '@/assets/images/icons/notification-icon.svg';
import logo from '@/assets/images/logos/tapya-t.svg';

const iconBtn =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#141412] transition-colors hover:bg-zinc-700';

const SCROLL_THRESHOLD = 20;

export function Navbar({ onMenuClick }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // run once in case page loads scrolled
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 right-0 left-0 z-50 flex h-16 items-center justify-between px-4 transition-colors duration-300 ${
        scrolled ? 'bg-black' : 'bg-transparent'
      }`}
    >
      <a href="/home" className="shrink-0" aria-label="Tapeya home">
        <img src={logo} alt="" className="h-8 w-auto" />
      </a>
      <div className="flex items-center gap-2">
        <button type="button" className={iconBtn} aria-label="Notifications">
          <img src={notificationIcon} alt="" className="h-3.5 w-3.5" />
        </button>
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
