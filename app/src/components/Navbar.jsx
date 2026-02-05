import logo from '@/assets/images/logos/tapya-t.svg';
import notificationIcon from '@/assets/images/icons/notification-icon.svg';
import hamburgerIcon from '@/assets/images/icons/hamburger-icon.svg';

const iconBtn =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#141412] transition-colors hover:bg-zinc-700';

export function Navbar({ onMenuClick }) {
  return (
    <nav className="flex items-center justify-between px-4 py-5">
      <a href="/" className="shrink-0" aria-label="Tapeya home">
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
