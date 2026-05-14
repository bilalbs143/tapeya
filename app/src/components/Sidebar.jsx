import { useEffect, useMemo, useRef, useState } from 'react';

import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useNativeStoreVersionInfo } from '@/hooks/useNativeStoreVersionInfo';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
// import starMatchIcon from '@/assets/images/icons/star-match.svg';
import { calculateProfileStrength } from '@/lib/profileStrength';
import { addSavedProfile } from '@/lib/savedProfiles';
import { useGetMeQuery } from '@/store/api/authApi';
import { useGetSidebarInterestCampaignQuery } from '@/store/api/tournamentInterestApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectAuthUserAndToken } from '@/store/selectors';
import { clearCredentials } from '@/store/slices/authSlice';

const logoutIcon = `${CLOUDFRONT_APP_BASE}/images/icons/logout.svg`;
const myOrderIcon = `${CLOUDFRONT_APP_BASE}/images/icons/my-order.svg`;
const homeIcon = `${CLOUDFRONT_APP_BASE}/images/logos/tapya-t.svg`;
const requestTournamentIcon = `${CLOUDFRONT_APP_BASE}/images/icons/request-tournament.svg`;
const supportIcon = `${CLOUDFRONT_APP_BASE}/images/icons/support.svg`;
const topPlayersIcon = `${CLOUDFRONT_APP_BASE}/images/icons/top-players.svg`;
const interestCampaignIcon = `${CLOUDFRONT_APP_BASE}/images/icons/interest-campaign.svg`;
const defaultAvatar = `${CLOUDFRONT_APP_BASE}/images/standard/default-avatar.png`;

const MENU_ITEMS = [
  { label: 'Home', icon: homeIcon, path: '/home' },
  {
    label: 'My Tournaments',
    icon: requestTournamentIcon,
    path: '/organizer/tournaments',
    organizerOnly: true,
  },
  { label: 'My Orders', icon: myOrderIcon, path: '/shop/orders' },
  {
    label: 'Request Tournament',
    icon: requestTournamentIcon,
    path: '/tournament-request',
  },
  // {
  //   label: 'Start Match',
  //   icon: starMatchIcon,
  //   path: '/organizer/scoring/start-match',
  // },
  /* { label: 'Drafting', path: '/drafting' }, */
  /* { label: 'Go live', comingSoon: true }, */
  /* { label: 'Toss', comingSoon: true }, */
  { label: 'Top Players', icon: topPlayersIcon, path: '/ranking' },
  /* { label: 'Top Sponsors', comingSoon: true }, */
  /* { label: 'Profiles', comingSoon: true }, */
  { label: 'Support', icon: supportIcon, path: '/support' },
  { label: 'Logout', icon: logoutIcon },
];

const overlay = (open) =>
  `fixed inset-0 z-[60] bg-black/50 transition-opacity duration-200 lg:hidden ${
    open ? 'opacity-100' : 'pointer-events-none opacity-0'
  }`;

const panel = (open) =>
  `fixed left-0 top-0 z-[70] h-full w-[280px] flex flex-col border-r border-[#FFFFFF12] bg-[#10110EA3] backdrop-blur-[26.5px] transition-transform duration-200 ease-out lg:translate-x-0 ${
    open ? 'translate-x-0' : '-translate-x-full'
  }`;

const menuBtn =
  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-white transition-colors hover:bg-[#DA9811]';

export function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const overlayRef = useRef(null);
  const { user, accessToken } = useAppSelector(selectAuthUserAndToken);
  const { data: meResponse } = useGetMeQuery(undefined, {
    skip: !user?.id,
  });
  const { data: sidebarInterestPayload } = useGetSidebarInterestCampaignQuery();
  const sidebarCampaign = sidebarInterestPayload?.campaign ?? null;
  /** Same merge as Profile page / ProfileHeader — live /me data when available */
  const profileUser = meResponse?.data ?? user;
  const strength = profileUser ? calculateProfileStrength(profileUser) : 0;

  const {
    isNativeMobile: showNativeVersions,
    installedVersion,
    configuredVersion,
  } = useNativeStoreVersionInfo();

  const hasOrganizerRole = useMemo(() => {
    const roles = profileUser?.roles;
    if (!roles || !Array.isArray(roles)) return false;
    return roles.some((r) => r?.slug === 'organizer');
  }, [profileUser]);
  const navItems = useMemo(() => {
    const filtered = MENU_ITEMS.filter((item) => {
      if (item.label === 'Logout') return false;
      if (item.organizerOnly && !hasOrganizerRole) return false;
      return true;
    });
    const slug = sidebarCampaign?.slug;
    if (!slug) return filtered;
    const afterRequestIdx = filtered.findIndex((i) => i.path === '/tournament-request');
    const interestRow = {
      label: sidebarCampaign.tournament_name?.trim() || 'Interest',
      icon: interestCampaignIcon,
      path: `/interest/${slug}`,
    };
    if (afterRequestIdx === -1) {
      return [...filtered, interestRow];
    }
    return [
      ...filtered.slice(0, afterRequestIdx + 1),
      interestRow,
      ...filtered.slice(afterRequestIdx + 1),
    ];
  }, [hasOrganizerRole, sidebarCampaign]);
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 1024,
  );

  const isActivePath = (path) => {
    if (!path) return false;
    const current = location?.pathname ?? '';
    return current === path || current.startsWith(`${path}/`);
  };

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    setIsDesktop(mq.matches);
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

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

      <aside
        aria-hidden={!open && !isDesktop}
        className={panel(open)}
        style={{ backgroundColor: '#10110EA3' }}
        inert={!open && !isDesktop ? '' : undefined}
      >
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <Link
              to="/profile"
              onClick={onClose}
              className="flex gap-3 rounded-lg transition-colors hover:bg-white/5 focus:outline-none"
            >
              <img
                src={profileUser?.avatar_url || defaultAvatar}
                alt=""
                className="h-[44px] w-[44px] shrink-0 rounded-full border border-white object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-bold text-white">
                  {profileUser?.name || profileUser?.nickname || 'Profile'}
                </p>
                <p className="truncate text-[12px] font-medium text-[#A2A6AB]">
                  {profileUser?.email || profileUser?.phone || ''}
                </p>
              </div>
            </Link>

            {profileUser && strength < 100 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="h-[4px] flex-1 overflow-hidden rounded-full bg-zinc-600">
                  <div
                    className="h-full rounded-full bg-[#DA9811]"
                    style={{ width: `${strength}%` }}
                  />
                </div>
                <span className="shrink-0 text-[14px] font-bold text-white italic">
                  {strength}% Complete
                </span>
              </div>
            )}

            <div className="h-px w-full bg-[linear-gradient(to_right,#00000000,#FFFFFF33,#00000000)]" />

            <nav className="flex flex-col gap-1 pt-4">
              {navItems.map(({ label, icon, path }) =>
                path ? (
                  <Link
                    key={path}
                    to={path}
                    title={label}
                    onClick={onClose}
                    className={`group ${menuBtn} ${isActivePath(path) ? 'bg-[#DA9811]' : ''}`}
                  >
                    <img
                      src={icon}
                      alt=""
                      className={`h-5 w-5 shrink-0 ${
                        isActivePath(path) ? 'brightness-0 filter' : ''
                      } group-hover:brightness-0 group-hover:filter`}
                    />
                    <span
                      className={`min-w-0 truncate text-[16px] font-medium ${
                        isActivePath(path) ? 'text-[#080807]' : 'text-[#A2A6AB]'
                      } group-hover:text-[#080807]`}
                    >
                      {label}
                    </span>
                  </Link>
                ) : (
                  <button
                    key={label}
                    type="button"
                    className={`${menuBtn} hover:bg-transparent`}
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

          <div className="mt-auto">
            {showNativeVersions && (
              <div className="border-t border-white/[0.06] px-3 py-2 lg:hidden">
                <p
                  className="text-center text-[9px] leading-snug tracking-tight text-[#55585e]"
                  title="Installed app version | Version from system settings"
                >
                  <span className="tabular-nums opacity-90">
                    {installedVersion || '—'}
                  </span>
                  <span className="select-none px-1 opacity-35" aria-hidden>
                    |
                  </span>
                  <span className="tabular-nums opacity-90">
                    {configuredVersion || '—'}
                  </span>
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full cursor-pointer items-center justify-center gap-2 bg-[#DA9811] py-4"
            >
              <img
                src={logoutIcon}
                alt=""
                className="h-8 w-8 shrink-0 brightness-0 filter"
              />
              <span className="text-[16px] leading-none font-bold text-[#080807]">
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
