import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'Home',
  },
  {
    displayName: 'Starter',
    iconName: 'solar:home-angle-line-duotone',
    route: '/starter',
  },
  {
    displayName: 'Login',
    iconName: 'solar:lock-keyhole-unlocked-outline',
    route: '/authentication/login',
  },
  {
    navCap: 'Other',
  },
  {
    displayName: 'Menu Level',
    iconName: 'solar:align-horizontal-center-line-duotone',
    route: '/menu-level',
    children: [
      {
        displayName: 'Menu 1',
        iconName: 'tabler:point',
        route: '/menu-1',
        children: [
          {
            displayName: 'Menu 1',
            iconName: 'tabler:point',
            route: '/menu-1',
          },

          {
            displayName: 'Menu 2',
            iconName: 'tabler:point',
            route: '/menu-2',
          },
        ],
      },

      {
        displayName: 'Menu 2',
        iconName: 'tabler:point',
        route: '/menu-2',
      },
    ],
  },
  {
    displayName: 'Disabled',
    iconName: 'solar:bookmark-circle-line-duotone',
    route: '/disabled',
    disabled: true,
  },
  {
    displayName: 'Chip',
    iconName: 'solar:branching-paths-up-line-duotone',
    route: '/',
    chip: true,
    chipClass: 'bg-primary text-white',
    chipContent: '9',
  },
  {
    displayName: 'Outlined',
    iconName: 'solar:add-square-line-duotone',
    route: '/',
    chip: true,
    chipClass: 'bg-primary text-white',
    chipContent: 'Outlined',
  },
  {
    displayName: 'External Link',
    iconName: 'solar:link-round-angle-bold-duotone',
    route: 'https://www.google.com/',
    external: true,
  },
];
