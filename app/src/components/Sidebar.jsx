import { useEffect, useMemo, useRef, useState } from 'react';

import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useNativeStoreVersionInfo } from '@/hooks/useNativeStoreVersionInfo';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { addSavedProfile } from '@/lib/savedProfiles';
import { resolveOwnProfilePath } from '@/lib/share';
import { calculateProfileStrength } from '@/lib/utils/playerUtils';
import { userCanApplyAsSeller, userHasVendorAccess } from '@/lib/vendorAccess';
import { isNative } from '@/platform/platform';
import { useGetMeQuery } from '@/store/api/authApi';
import { useGetSidebarInterestCampaignQuery } from '@/store/api/tournamentInterestApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectAuthUserAndToken } from '@/store/selectors';
import { clearCredentials } from '@/store/slices/authSlice';

const logoutIcon = `${CLOUDFRONT_APP_BASE}/images/icons/logout.svg`;
const myOrderIcon = `${CLOUDFRONT_APP_BASE}/images/icons/my-order.svg`;
const homeIcon = `${CLOUDFRONT_APP_BASE}/images/logos/tapya-t.svg`;
const scoreIcon = `${CLOUDFRONT_APP_BASE}/images/icons/score-bottom.svg`;
const myTournamentsIcon = `${CLOUDFRONT_APP_BASE}/images/icons/my-tournaments.svg`;
const requestTournamentIcon = `${CLOUDFRONT_APP_BASE}/images/icons/request-tournament.svg`;
const supportIcon = `${CLOUDFRONT_APP_BASE}/images/icons/support.svg`;
const topPlayersIcon = `${CLOUDFRONT_APP_BASE}/images/icons/top-players.svg`;
const userStatsIcon = `${CLOUDFRONT_APP_BASE}/images/icons/user-stats.svg`;
const interestCampaignIcon = `${CLOUDFRONT_APP_BASE}/images/icons/interest-campaign.svg`;
const goLiveIcon = `${CLOUDFRONT_APP_BASE}/images/icons/voice-cricle-live.svg`;
const sellerHubIcon = `${CLOUDFRONT_APP_BASE}/images/icons/seller-hub.svg`;
const becomeASellerIcon = `${CLOUDFRONT_APP_BASE}/images/icons/become-a-seller.svg`;
const quickMatchIcon = `${CLOUDFRONT_APP_BASE}/images/icons/quick-match.svg`;
const myMatchesIcon = `${CLOUDFRONT_APP_BASE}/images/icons/my-matches.svg`;
const defaultAvatar = `${CLOUDFRONT_APP_BASE}/images/standard/default-avatar.png`;

/**
 * Sidebar nav grouped by job — Discover → Play → Tournaments → Career → Shop → Help.
 * Gated rows use requiresBroadcast / requiresVendor / requiresNoVendor.
 */
const MENU_SECTIONS = [
  {
    id: 'discover',
    items: [
      { label: 'Home', icon: homeIcon, path: '/home' },
      { label: 'Score', icon: scoreIcon, path: '/scorecard' },
    ],
  },
  {
    id: 'play',
    items: [
      { label: 'Quick Match', icon: quickMatchIcon, path: '/quick-match' },
      { label: 'My Matches', icon: myMatchesIcon, path: '/matches' },
      { label: 'Go Live', icon: goLiveIcon, path: '/live/go-live', requiresBroadcast: true },
    ],
  },
  {
    id: 'tournaments',
    items: [
      { label: 'My Tournaments', icon: myTournamentsIcon, path: '/organizer/tournaments' },
      { label: 'Request Tournament', icon: requestTournamentIcon, path: '/tournament-request' },
    ],
  },
  {
    id: 'career',
    items: [
      { label: 'My Stats', icon: userStatsIcon, path: '/stats' },
      { label: 'Top Players', icon: topPlayersIcon, path: '/ranking' },
    ],
  },
  {
    id: 'shop',
    items: [
      { label: 'My Orders', icon: myOrderIcon, path: '/shop/orders' },
      { label: 'Seller Hub', icon: sellerHubIcon, path: '/seller', requiresVendor: true },
      { label: 'Become a Seller', icon: becomeASellerIcon, path: '/seller/apply', requiresNoVendor: true },
    ],
  },
  {
    id: 'help',
    items: [{ label: 'Support', icon: supportIcon, path: '/support' }],
  },
];

function itemVisible(item, { canBroadcast, canAccessSellerHub, canApplyAsSeller }) {
  if (item.requiresBroadcast && !canBroadcast) return false;
  if (item.requiresVendor && !canAccessSellerHub) return false;
  if (item.requiresNoVendor && !canApplyAsSeller) return false;
  return true;
}

const overlay = (open) =>
  `fixed inset-0 z-[60] bg-black/50 transition-opacity duration-200 lg:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`;

const panel = (open) =>
  `fixed left-0 top-0 z-[70] h-full w-[280px] flex flex-col border-r border-[#FFFFFF12] bg-[#10110EA3] backdrop-blur-[26.5px] transition-transform duration-200 ease-out lg:translate-x-0 ${
    open ? 'translate-x-0' : '-translate-x-full'
  }`;

const menuBtn =
  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-white transition-colors hover:bg-brand';

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
  const ownProfilePath = resolveOwnProfilePath(profileUser?.id);

  const { isNativeMobile: showNativeVersions, installedVersion, configuredVersion } = useNativeStoreVersionInfo();

  const canBroadcast = isNative() && Boolean(profileUser?.can_broadcast);
  const canAccessSellerHub = userHasVendorAccess(profileUser);
  const canApplyAsSeller = userCanApplyAsSeller(profileUser);

  const navSections = useMemo(() => {
    const gates = { canBroadcast, canAccessSellerHub, canApplyAsSeller };
    const slug = sidebarCampaign?.slug;

    return MENU_SECTIONS.map((section) => {
      let items = section.items.filter((item) => itemVisible(item, gates));

      if (section.id === 'tournaments' && slug) {
        const interestRow = {
          label: sidebarCampaign.tournament_name?.trim() || 'Interest',
          icon: interestCampaignIcon,
          path: `/interest/${slug}`,
        };
        const requestIdx = items.findIndex((i) => i.path === '/tournament-request');
        if (requestIdx === -1) {
          items = [...items, interestRow];
        } else {
          items = [...items.slice(0, requestIdx + 1), interestRow, ...items.slice(requestIdx + 1)];
        }
      }

      return { ...section, items };
    }).filter((section) => section.items.length > 0);
  }, [sidebarCampaign, canBroadcast, canAccessSellerHub, canApplyAsSeller]);

  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);

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
    if (!open && overlayRef.current && document.activeElement?.closest?.('aside')) {
      overlayRef.current.focus({ preventScroll: true });
    }
  }, [open]);

  useEffect(() => {
    if (!open || isDesktop) return;

    const scrollY = window.scrollY;
    const { body, documentElement: html } = document;

    const prev = {
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
      htmlOverflow: html.style.overflow,
    };

    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';

    return () => {
      body.style.overflow = prev.bodyOverflow;
      body.style.position = prev.bodyPosition;
      body.style.top = prev.bodyTop;
      body.style.width = prev.bodyWidth;
      html.style.overflow = prev.htmlOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [open, isDesktop]);

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
        aria-label="Close Menu"
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
          <div className="flex-1 overflow-y-auto px-4 pb-6" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 24px)' }}>
            <Link
              to={ownProfilePath}
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
                <p className="text-muted truncate text-[12px] font-medium">
                  {profileUser?.nickname?.trim() ? `@${profileUser.nickname.trim()}` : profileUser?.phone || ''}
                </p>
              </div>
            </Link>

            {profileUser && strength < 100 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="h-[4px] flex-1 overflow-hidden rounded-full bg-zinc-600">
                  <div className="bg-brand h-full rounded-full" style={{ width: `${strength}%` }} />
                </div>
                <span className="shrink-0 text-[14px] font-bold text-white italic">{strength}% Complete</span>
              </div>
            )}

            <div className="h-px w-full bg-[linear-gradient(to_right,#00000000,#FFFFFF33,#00000000)]" />

            <nav className="flex flex-col gap-1 pt-4" aria-label="Main">
              {navSections
                .flatMap((section) => section.items)
                .map(({ label, icon, path }) => (
                  <Link
                    key={path}
                    to={path}
                    title={label}
                    onClick={onClose}
                    className={`group ${menuBtn} ${isActivePath(path) ? 'bg-brand' : ''}`}
                  >
                    <img
                      src={icon}
                      alt=""
                      className={`h-5 w-5 shrink-0 ${isActivePath(path) ? 'brightness-0 filter' : ''} group-hover:brightness-0 group-hover:filter`}
                    />
                    <span
                      className={`min-w-0 truncate text-[16px] font-medium ${isActivePath(path) ? 'text-ink' : 'text-muted'} group-hover:text-ink`}
                    >
                      {label}
                    </span>
                  </Link>
                ))}
            </nav>
          </div>

          <div className="mt-auto">
            {showNativeVersions && (
              <div className="border-t border-white/[0.06] px-3 py-2 lg:hidden">
                <p
                  className="text-center text-[9px] leading-snug tracking-tight text-[#55585E]"
                  title="Installed app version | Version from system settings"
                >
                  <span className="tabular-nums opacity-90">{installedVersion || '—'}</span>
                  <span className="px-1 opacity-35 select-none" aria-hidden>
                    |
                  </span>
                  <span className="tabular-nums opacity-90">{configuredVersion || '—'}</span>
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="bg-brand flex w-full cursor-pointer items-center justify-center gap-2 py-4"
            >
              <img src={logoutIcon} alt="" className="h-8 w-8 shrink-0 brightness-0 filter" />
              <span className="text-ink text-[16px] leading-none font-bold">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
