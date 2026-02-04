import { NavItem } from './nav-item.model';

/** Shared nav/sidebar menu data for both vertical and horizontal layouts. */
export const navItems: NavItem[] = [
  {
    navCap: 'Main Menu',
  },
  {
    displayName: 'Cricket Dashboard',
    iconName: 'solar:home-angle-line-duotone',
    route: '/starter',
  },
  {
    displayName: 'eCommerce Dashboard',
    iconName: 'solar:cart-large-2-line-duotone',
    route: '/ecommerce',
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
        displayName: 'Blocked Users',
        iconName: 'tabler:point',
        route: '/users/blocked',
      },
      {
        displayName: 'Login History',
        iconName: 'tabler:point',
        route: '/users/login-history',
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
