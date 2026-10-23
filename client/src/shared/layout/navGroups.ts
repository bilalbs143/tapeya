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
  /** Pending / approved / suspended store — show Seller Hub (same as app `userHasVendorAccess`). */
  hasStore?: boolean | undefined;
  /** No shop_vendors row — show Become a Seller (same as app `userCanApplyAsSeller`). */
  canApplyAsSeller?: boolean | undefined;
  ordersBadge?: number | undefined;
}): NavGroup[] {
  const hasStore = Boolean(opts?.hasStore);
  const canApplyAsSeller = opts?.canApplyAsSeller ?? !hasStore;
  const ordersBadge = opts?.ordersBadge;

  const shopItems: NavItem[] = [{ to: APP_PATHS.shopOrders, label: 'My Orders', icon: 'orders', badge: ordersBadge }];
  if (hasStore) {
    shopItems.push({ to: APP_PATHS.seller, label: 'Seller Hub', icon: 'seller' });
  } else if (canApplyAsSeller) {
    shopItems.push({ to: APP_PATHS.sellerApply, label: 'Become a Seller', icon: 'seller' });
  }

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
      items: shopItems,
    },
    {
      label: 'Help',
      items: [{ to: APP_PATHS.support, label: 'Support', icon: 'support' }],
    },
  ];
}
