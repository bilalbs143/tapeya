import type { AuthUser } from 'src/app/models/auth.models';

import { NavItem } from './nav-item.model';

/** Shared nav/sidebar menu data for both vertical and horizontal layouts. */
export const navItems: NavItem[] = [
  {
    navCap: 'Main Menu',
  },
  {
    displayName: 'Cricket Dashboard',
    iconName: 'solar:home-angle-line-duotone',
    route: '/dashboard',
  },
  {
    displayName: 'eCommerce Dashboard',
    iconName: 'solar:cart-large-2-line-duotone',
    route: '/ecommerce',
  },
  {
    displayName: 'Tournaments Management',
    iconName: 'solar:calendar-date-line-duotone',
    children: [
      {
        displayName: 'Tournaments',
        iconName: 'tabler:point',
        route: '/tournaments-management/tournaments',
      },
      {
        displayName: 'Tournament Requests',
        iconName: 'tabler:point',
        route: '/tournaments-management/tournament-requests',
      },
      {
        displayName: 'Teams',
        iconName: 'tabler:point',
        route: '/tournaments-management/teams',
      },
    ],
  },
  {
    displayName: 'Content Management',
    iconName: 'solar:gallery-line-duotone',
    children: [
      {
        displayName: 'Hero Slider',
        iconName: 'tabler:point',
        route: '/content-management/hero-slider',
      },
      {
        displayName: 'Static Pages',
        iconName: 'tabler:point',
        route: '/content-management/static-pages',
      },
    ],
  },
  {
    displayName: 'Users Management',
    iconName: 'solar:users-group-two-rounded-line-duotone',
    children: [
      {
        displayName: 'Users',
        iconName: 'tabler:point',
        route: '/users-management/users',
      },
      {
        displayName: 'Players Management',
        iconName: 'tabler:point',
        route: '/players-management/players',
      },
    ],
  },
  {
    displayName: 'Notifications',
    iconName: 'solar:bell-line-duotone',
    route: '/notifications',
  },
  {
    displayName: 'Shop',
    iconName: 'solar:cart-large-2-line-duotone',
    children: [
      {
        displayName: 'Brands',
        iconName: 'tabler:point',
        route: '/shop-management/brands',
      },
      {
        displayName: 'Categories',
        iconName: 'tabler:point',
        route: '/shop-management/categories',
      },
      {
        displayName: 'Products',
        iconName: 'tabler:point',
        route: '/shop-management/products',
      },
      {
        displayName: 'Orders',
        iconName: 'tabler:point',
        route: '/shop-management/orders',
      },
    ],
  },
  {
    displayName: 'Settings',
    iconName: 'solar:settings-line-duotone',
    children: [
      {
        displayName: 'System Settings',
        iconName: 'tabler:point',
        route: '/settings/system-settings',
      },
    ],
  },
];

/** Sidebar for Broadcast Operator staff — flat top-level links (small menu). */
export const broadcastStaffNavItems: NavItem[] = [
  {
    navCap: 'Main Menu',
  },
  {
    displayName: 'Dashboard',
    iconName: 'solar:home-angle-line-duotone',
    route: '/dashboard',
  },
  {
    displayName: 'Players Management',
    iconName: 'solar:user-id-line-duotone',
    route: '/players-management/players',
  },
  {
    displayName: 'Teams Management',
    iconName: 'solar:users-group-two-rounded-line-duotone',
    route: '/tournaments-management/teams',
  },
  {
    displayName: 'Tournaments Management',
    iconName: 'solar:calendar-date-line-duotone',
    route: '/tournaments-management/tournaments',
  },
];

export function getVisibleNavItems(user: AuthUser | null): NavItem[] {
  if (user?.is_broadcast_staff && !user.is_admin) {
    return broadcastStaffNavItems;
  }

  return navItems;
}
