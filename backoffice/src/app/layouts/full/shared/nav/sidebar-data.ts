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
    displayName: 'Events Management',
    iconName: 'solar:calendar-date-line-duotone',
    children: [
      {
        displayName: 'Events',
        iconName: 'tabler:point',
        route: '/events-management/events',
      },
      {
        displayName: 'Event Requests',
        iconName: 'tabler:point',
        route: '/events-management/event-requests',
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
