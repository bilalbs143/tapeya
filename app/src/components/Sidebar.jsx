import { useEffect, useRef } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import draftingIcon from '@/assets/images/icons/drafting-icon.svg';
import goLiveIcon from '@/assets/images/icons/go-live.svg';
import logoutIcon from '@/assets/images/icons/logout.svg';
import myOrderIcon from '@/assets/images/icons/my-order.svg';
import profilesIcon from '@/assets/images/icons/profiles.svg';
import requestTournamentIcon from '@/assets/images/icons/request-tournament.svg';
import starMatchIcon from '@/assets/images/icons/star-match.svg';
import supportIcon from '@/assets/images/icons/support.svg';
import topPlayersIcon from '@/assets/images/icons/top-players.svg';
import topSponsorsIcon from '@/assets/images/icons/top-sponsers.svg';
import tossIcon from '@/assets/images/icons/toss.svg';
import defaultAvatar from '@/assets/images/standard/default-avatar.png';
import { addSavedProfile } from '@/lib/savedProfiles';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectAuthUserAndToken } from '@/store/selectors';
import { clearCredentials } from '@/store/slices/authSlice';

const MENU_ITEMS = [
  {
    label: 'Request Tournament',
    icon: requestTournamentIcon,
    path: '/tournament-request',
  },
  {
    label: 'Start Match',
    icon: starMatchIcon,
    path: '/organizer/scoring/start-match',
  },
  { label: 'Drafting', icon: draftingIcon, path: '/drafting' },
  { label: 'My Orders', icon: myOrderIcon, path: '/shop/orders' },
  { label: 'Go live', icon: goLiveIcon, comingSoon: true },
  { label: 'Toss', icon: tossIcon, comingSoon: true },
  { label: 'Top Players', icon: topPlayersIcon, path: '/ranking' },
  { label: 'Top Sponsors', icon: topSponsorsIcon, comingSoon: true },
  { label: 'Profiles', icon: profilesIcon, comingSoon: true },
  {
    label: 'My Tournaments',
    icon: requestTournamentIcon,
    path: '/organizer/tournaments',
  },
  { label: 'Support', icon: supportIcon, comingSoon: true },
  { label: 'Logout', icon: logoutIcon },
];

const overlay = (open) =>
  `fixed inset-0 z-[60] bg-black/50 transition-opacity duration-200 ${
    open ? 'opacity-100' : 'pointer-events-none opacity-0'
  }`;

const panel = (open) =>
  `fixed left-0 top-0 z-[70] h-full w-[280px] flex flex-col border-r border-[#FFFFFF12] bg-[#10110EA3] backdrop-blur-[26.5px] transition-transform duration-200 ease-out ${
    open ? 'translate-x-0' : '-translate-x-full'
  }`;

const menuBtn =
  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-white transition-colors hover:bg-white/10';

export function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const overlayRef = useRef(null);
  const { user, accessToken } = useAppSelector(selectAuthUserAndToken);

  useEffect(() => {
    if (
      !open &&
      overlayRef.current &&
      document.activeElement?.closest?.('aside')
    ) {
      overlayRef.current.focus({ preventScroll: true });
    }
  }, [open]);

  const handleLogout = () => {
    if (user?.phone && accessToken) {
      addSavedProfile({
        id: user.id,
        name: user.name,
        nickname: user.nickname,
        phone: user.phone,
        email: user.email,
        accessToken,
      });
    }
    dispatch(clearCredentials());
    onClose();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <button
        ref={overlayRef}
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className={overlay(open)}
        tabIndex={open ? 0 : -1}
      />

      <aside aria-hidden={!open} className={panel(open)} inert={!open}>
        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
          <Link
            to="/profile"
            onClick={onClose}
            className="flex gap-3 rounded-lg transition-colors hover:bg-white/5 focus:ring-2 focus:ring-white/20 focus:outline-none"
          >
            <img
              src={user?.avatar_url || defaultAvatar}
              alt=""
              className="h-[44px] w-[44px] shrink-0 rounded-full border border-white object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-bold text-white">
                {user?.name || user?.nickname || 'Profile'}
              </p>
              <p className="truncate text-[12px] font-medium text-[#A2A6AB]">
                {user?.email || user?.phone || ''}
              </p>
            </div>
          </Link>

          <div className="mt-2 flex items-center gap-2 pb-6">
            <div className="h-[4px] flex-1 overflow-hidden rounded-full bg-zinc-600">
              <div className="h-full w-[70%] rounded-full bg-[#DA9811]" />
            </div>
            <span className="shrink-0 text-[14px] font-bold text-white italic">
              70% Complete
            </span>
          </div>

          <div className="h-px w-full bg-[linear-gradient(to_right,#00000000,#FFFFFF33,#00000000)]" />

          <nav className="flex flex-col gap-1 pt-4">
            {MENU_ITEMS.map(({ label, icon, path, comingSoon }) =>
              label === 'Logout' ? (
                <button
                  key={label}
                  type="button"
                  onClick={handleLogout}
                  className={menuBtn}
                >
                  <img src={icon} alt="" className="h-5 w-5 shrink-0" />
                  <span className="text-[16px] font-medium text-[#A2A6AB]">
                    {label}
                  </span>
                </button>
              ) : path ? (
                <Link
                  key={label}
                  to={path}
                  onClick={onClose}
                  className={menuBtn}
                >
                  <img src={icon} alt="" className="h-5 w-5 shrink-0" />
                  <span className="text-[16px] font-medium text-[#A2A6AB]">
                    {label}
                  </span>
                </Link>
              ) : (
                <button
                  key={label}
                  type="button"
                  className={menuBtn}
                  disabled
                  aria-disabled="true"
                  aria-label={`${label} (coming soon)`}
                >
                  <img
                    src={icon}
                    alt=""
                    className="h-5 w-5 shrink-0 opacity-60"
                  />
                  <span className="text-[16px] font-medium text-[#A2A6AB] opacity-60">
                    {label}
                  </span>
                </button>
              ),
            )}
          </nav>
        </div>
      </aside>
    </>
  );
}
