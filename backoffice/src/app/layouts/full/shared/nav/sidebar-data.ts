import type { AuthUser } from 'src/app/models/auth.models';

import { NavItem } from './nav-item.model';

/**
 * Section grouping (Overview / Operations / Workspace)
 * with the original Tapeya menu labels and routes.
 */
export const navItems: NavItem[] = [
  { navCap: 'Overview' },
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

  { navCap: 'Operations' },
  {
    displayName: 'Tournaments Management',
    iconName: 'solar:calendar-date-line-duotone',
    children: [
      {
        displayName: 'Tournaments',
        route: '/tournaments-management/tournaments',
      },
      {
        displayName: 'Tournament Requests',
        route: '/tournaments-management/tournament-requests',
      },
      {
        displayName: 'Quick Matches',
        route: '/tournaments-management/quick-matches',
      },
      {
        displayName: 'Teams',
        route: '/tournaments-management/teams',
      },
      {
        displayName: 'Interest Campaigns',
        route: '/tournaments-management/interest-campaigns',
      },
    ],
  },
  {
    displayName: 'Content Management',
    iconName: 'solar:gallery-line-duotone',
    children: [
      {
        displayName: 'Hero Slider',
        route: '/content-management/hero-slider',
      },
      {
        displayName: 'Static Pages',
        route: '/content-management/static-pages',
      },
      {
        displayName: 'Highlights',
        route: '/content-management/highlights',
      },
      {
        displayName: 'Posts',
        route: '/content-management/posts',
      },
      {
        displayName: 'Post Reports',
        route: '/content-management/post-reports',
      },
    ],
  },
  {
    displayName: 'Users Management',
    iconName: 'solar:users-group-two-rounded-line-duotone',
    children: [
      {
        displayName: 'Users',
        route: '/users-management/users',
      },
      {
        displayName: 'Players Management',
        route: '/players-management/players',
      },
    ],
  },
  {
    displayName: 'Live Streams',
    iconName: 'solar:videocamera-record-line-duotone',
    route: '/live-streams-management/live-streams',
  },
  {
    displayName: 'Shop',
    iconName: 'solar:cart-large-2-line-duotone',
    children: [
      {
        displayName: 'Brands',
        route: '/shop-management/brands',
      },
      {
        displayName: 'Categories',
        route: '/shop-management/categories',
      },
      {
        displayName: 'Vendors',
        route: '/shop-management/vendors',
      },
      {
        displayName: 'Products',
        route: '/shop-management/products',
      },
      {
        displayName: 'Orders',
        route: '/shop-management/orders',
      },
    ],
  },

  { navCap: 'Workspace' },
  {
    displayName: 'Notifications',
    iconName: 'solar:bell-line-duotone',
    route: '/notifications',
  },
  {
    displayName: 'Support',
    iconName: 'solar:chat-round-call-line-duotone',
    route: '/support',
  },
  {
    displayName: 'Engagement',
    iconName: 'solar:chat-round-dots-line-duotone',
    children: [
      {
        displayName: 'Push Notifications',
        route: '/engagement/push-notifications',
      },
      {
        displayName: 'Push Templates',
        route: '/engagement/push-notification-templates',
      },
    ],
  },
  {
    displayName: 'Settings',
    iconName: 'solar:settings-line-duotone',
    children: [
      {
        displayName: 'System Settings',
        route: '/settings/system-settings',
      },
    ],
  },
];

/** Sidebar for Broadcast Operator staff — flat top-level links (small menu). */
export const broadcastStaffNavItems: NavItem[] = [
  { navCap: 'Overview' },
  {
    displayName: 'Dashboard',
    iconName: 'solar:home-angle-line-duotone',
    route: '/dashboard',
  },
  { navCap: 'Operations' },
  {
    displayName: 'Tournaments Management',
    iconName: 'solar:calendar-date-line-duotone',
    route: '/tournaments-management/tournaments',
  },
  {
    displayName: 'Teams Management',
    iconName: 'solar:users-group-two-rounded-line-duotone',
    route: '/tournaments-management/teams',
  },
  {
    displayName: 'Players Management',
    iconName: 'solar:user-id-line-duotone',
    route: '/players-management/players',
  },
  {
    displayName: 'Live Streams',
    iconName: 'solar:videocamera-record-line-duotone',
    route: '/live-streams-management/live-streams',
  },
];

export function getVisibleNavItems(user: AuthUser | null): NavItem[] {
  if (user?.is_broadcast_staff && !user.is_admin) {
    return broadcastStaffNavItems;
  }

  return navItems;
}
