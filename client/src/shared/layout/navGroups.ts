import { APP_PATHS } from '@/shared/config/paths';
import type { NavIconKey } from '@/shared/ui/icons';

export type NavItem = {
  to: string;
  label: string;
  icon: NavIconKey;
  liveDot?: boolean | undefined;
  badge?: number | undefined;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export function isActivePath(pathname: string, to: string): boolean {
  if (!pathname || !to) return false;
  if (to === '/') return pathname === '/';
  return pathname === to || pathname.startsWith(`${to}/`);
}

/** Side menu groups for phone drawer and desktop SideNav. */
export function buildNavGroups(opts?: {
  hasStore?: boolean | undefined;
  ordersBadge?: number | undefined;
}): NavGroup[] {
  const hasStore = Boolean(opts?.hasStore);
  const ordersBadge = opts?.ordersBadge;

  return [
    {
      label: 'Main',
      items: [
        { to: APP_PATHS.home, label: 'Home', icon: 'home' },
        { to: APP_PATHS.scorecard, label: 'Score', icon: 'score', liveDot: true },
      ],
    },
    {
      label: 'Play',
      items: [
        { to: APP_PATHS.quickMatch, label: 'Quick Match', icon: 'quick' },
        { to: APP_PATHS.matches, label: 'My Matches', icon: 'matches' },
        { to: APP_PATHS.tournaments, label: 'My Tournaments', icon: 'tournaments' },
        { to: APP_PATHS.tournamentCreate, label: 'Create Tournament', icon: 'create' },
      ],
    },
    {
      label: 'You',
      items: [
        { to: APP_PATHS.stats, label: 'My Stats', icon: 'stats' },
        { to: APP_PATHS.ranking, label: 'Top Players', icon: 'players' },
      ],
    },
    {
      label: 'Shop',
      items: [
        { to: APP_PATHS.shopOrders, label: 'My Orders', icon: 'orders', badge: ordersBadge },
        hasStore
          ? { to: APP_PATHS.seller, label: 'Seller Hub', icon: 'seller' }
          : { to: APP_PATHS.sellerApply, label: 'Become a Seller', icon: 'seller' },
      ],
    },
    {
      label: 'Help',
      items: [{ to: APP_PATHS.support, label: 'Support', icon: 'support' }],
    },
  ];
}
