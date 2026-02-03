import { NavItem } from '../full/vertical/sidebar/nav-item/nav-item';

export const navItemsAdmin: NavItem[] = [
  {
    displayName: 'DASHBOARD',
    iconName: 'home',
    route: '/',
  },
  {
    displayName: 'AGENTS_MANAGEMENT',
    iconName: 'hierarchy-3',
    route: '',
    children: [
      {
        displayName: 'AGENTS',
        iconName: 'point',
        route: '/agents-management/agents',
        permissions: 'agent.view',
      },
      {
        displayName: 'HIERARCHY',
        iconName: 'point',
        route: '/agents-management/hierarchy',
      },
    ],
  },
  {
    displayName: 'USERS_MANAGEMENT',
    iconName: 'users',
    route: '',
    children: [
      {
        displayName: 'USERS',
        iconName: 'point',
        route: 'users-management/users',
      },
      {
        displayName: 'MEMBERSHIP_REQUESTS',
        iconName: 'point',
        route: '/users-management/membership-requests',
      },
      {
        displayName: 'LOGIN_HISTORY',
        iconName: 'point',
        route: '/users-management/login-history',
      },
      {
        displayName: 'CURRENT_LOGIN_SESSIONS',
        iconName: 'point',
        route: '/users-management/current-login-sessions',
      },
      {
        displayName: 'BLOCKED_USERS',
        iconName: 'point',
        route: '/users-management/blocked-users',
      },
      {
        displayName: 'REFERRAL_DOWNLINE',
        iconName: 'point',
        route: '/users-management/referral-downline',
      },
    ],
  },
  {
    displayName: 'BETS_MANAGEMENT',
    iconName: 'cards',
    route: '',
    children: [
      {
        displayName: 'BETS_HISTORY',
        iconName: 'point',
        route: '/bets-management/bets-history',
      },
    ],
  },
  {
    displayName: 'TRANSACTIONS_HISTORY',
    iconName: 'wallet',
    route: '',
    children: [
      {
        displayName: 'MONEY',
        iconName: 'point',
        route: '/transactions-history/money',
      },
      {
        displayName: 'POINTS',
        iconName: 'point',
        route: '/transactions-history/points',
      },
      {
        displayName: 'COUPON_POINTS',
        iconName: 'point',
        route: '/transactions-history/coupon-points',
      },
      {
        displayName: 'ROLLING_MONEY',
        iconName: 'point',
        route: '/transactions-history/rolling-money',
      },
      {
        displayName: 'LOSING_MONEY',
        iconName: 'point',
        route: '/transactions-history/losing-money',
      },
    ],
  },
  {
    displayName: 'TRANSACTIONS_REQUESTS',
    iconName: 'currency-won',
    route: '',
    children: [
      {
        displayName: 'MONEY_DEPOSIT',
        iconName: 'point',
        route: 'transactions-requests/money-recharge',
      },
      {
        displayName: 'MONEY_WITHDRAW',
        iconName: 'point',
        route: '/transactions-requests/money-withdraw',
      },
      {
        displayName: 'POINTS_EXCHANGE',
        iconName: 'point',
        route: '/transactions-requests/points-exchange',
      },
      {
        displayName: 'COUPON_POINTS_EXCHANGE',
        iconName: 'point',
        route: '/transactions-requests/coupon-points-exchange',
      },
      {
        displayName: 'ROLLING_MONEY_WITHDRAW',
        iconName: 'point',
        route: '/transactions-requests/rolling-money-withdraw',
      },
      {
        displayName: 'LOSING_MONEY_WITHDRAW',
        iconName: 'point',
        route: '/transactions-requests/losing-money-withdraw',
      },
    ],
  },
  {
    displayName: 'SETTLEMENTS_MANAGEMENT',
    iconName: 'adjustments-alt',
    route: '',
    children: [
      {
        displayName: 'DAILY_SETTLEMENTS',
        iconName: 'point',
        route: '/settlements-management/daily-settlements',
      },
      {
        displayName: 'MONTHLY_SETTLEMENTS',
        iconName: 'point',
        route: '/settlements-management/monthly-settlements',
      },
    ],
  },
  {
    displayName: 'SERVICE_CENTRE',
    iconName: 'hours-24',
    route: '',
    children: [
      {
        displayName: 'CUSTOMER_INQUIRES',
        iconName: 'point',
        route: '/service-centre/customer-inquires',
      },
      // {
      //   displayName: 'QUICK_ACCOUNT_INQUIRIES',
      //   iconName: 'point',
      //   route: '/service-centre/quick-account-inquiries',
      // },
      {
        displayName: 'NOTES_MANAGEMENT',
        iconName: 'point',
        route: '/service-centre/notes-management',
      },
      {
        displayName: 'FAQS_MANAGEMENT',
        iconName: 'point',
        route: '/service-centre/faqs-management',
      },
      {
        displayName: 'ANNOUNCEMENTS_MANAGEMENT',
        iconName: 'point',
        route: '/service-centre/announcements-management',
      },
      {
        displayName: 'POPUPS_MANAGEMENT',
        iconName: 'point',
        route: '/service-centre/popups-management',
      },
      {
        displayName: 'TEMPLATES_MANAGEMENT',
        iconName: 'point',
        route: '/service-centre/templates-management',
      },
    ],
  },
  {
    displayName: 'BANK_MANAGEMENT',
    iconName: 'building-bank',
    route: '',
    children: [
      {
        displayName: 'BANKS',
        iconName: 'point',
        route: '/banks-management/banks',
      },
      {
        displayName: 'BANK_ACCOUNTS',
        iconName: 'point',
        route: '/banks-management/bank-accounts',
      },
    ],
  },
  {
    displayName: 'SETTINGS',
    iconName: 'settings-cog',
    route: '',
    children: [
      {
        displayName: 'MEMBERSHIP_BONUSES',
        iconName: 'point',
        route: '/settings/membership-bonuses',
      },
      {
        displayName: 'ADDITIONAL_BONUSES',
        iconName: 'point',
        route: '/settings/additional-bonuses',
      },
      {
        displayName: 'SYSTEM_SETTINGS',
        iconName: 'point',
        route: '/settings/system-settings',
      },
      {
        displayName: 'BLACKLISTED_IPS_MANAGEMENT',
        iconName: 'point',
        route: '/settings/blacklisted-ips-management',
      },
      {
        displayName: 'WHITELISTED_IPS_MANAGEMENT',
        iconName: 'point',
        route: '/settings/whitelisted-ips-management',
      },
      {
        displayName: 'SOUNDS_MANAGEMENT',
        iconName: 'point',
        route: '/settings/sounds-management',
      },
      {
        displayName: 'SOUND_SETTINGS',
        iconName: 'point',
        route: '/settings/sound-settings',
      },
      {
        displayName: 'ADMIN_PROFILE',
        iconName: 'point',
        route: '/settings/admin-profile',
      },
    ],
  },
  {
    displayName: 'PROMOTION_MANAGEMENT',
    iconName: 'coins',
    route: '',
    children: [
      {
        displayName: 'PROMOTIONS',
        iconName: 'point',
        route: '/promotions-management/promotions',
      },
      {
        displayName: 'MEMBERS_PROMOTIONS',
        iconName: 'point',
        route: '/promotions-management/members-promotions',
      },
    ],
  },
];

export const navItemsAgent: NavItem[] = [
  {
    displayName: 'DASHBOARD',
    iconName: 'home',
    route: '/',
  },
  {
    displayName: 'AGENTS_MANAGEMENT',
    iconName: 'hierarchy-3',
    route: '',
    children: [
      {
        displayName: 'AGENTS',
        iconName: 'point',
        route: '/agents-management/agents',
        permissions: 'agent.view',
      },
      {
        displayName: 'HIERARCHY',
        iconName: 'point',
        route: '/agents-management/hierarchy',
      },
    ],
  },
  {
    displayName: 'USERS_MANAGEMENT',
    iconName: 'users',
    route: '',
    children: [
      {
        displayName: 'USERS',
        iconName: 'point',
        route: 'users-management/users',
      },
      {
        displayName: 'MEMBERSHIP_REQUESTS',
        iconName: 'point',
        route: '/users-management/membership-requests',
      },
      {
        displayName: 'LOGIN_HISTORY',
        iconName: 'point',
        route: '/users-management/login-history',
      },
      {
        displayName: 'CURRENT_LOGIN_SESSIONS',
        iconName: 'point',
        route: '/users-management/current-login-sessions',
      },
      {
        displayName: 'BLOCKED_USERS',
        iconName: 'point',
        route: '/users-management/blocked-users',
      },
      {
        displayName: 'REFERRAL_DOWNLINE',
        iconName: 'point',
        route: '/users-management/referral-downline',
      },
    ],
  },
  {
    displayName: 'BETS_MANAGEMENT',
    iconName: 'cards',
    route: '',
    children: [
      {
        displayName: 'BETS_HISTORY',
        iconName: 'point',
        route: '/bets-management/bets-history',
      },
    ],
  },
  {
    displayName: 'TRANSACTIONS_HISTORY',
    iconName: 'wallet',
    route: '',
    children: [
      {
        displayName: 'MONEY',
        iconName: 'point',
        route: '/transactions-history/money',
      },
      {
        displayName: 'POINTS',
        iconName: 'point',
        route: '/transactions-history/points',
      },
      {
        displayName: 'COUPON_POINTS',
        iconName: 'point',
        route: '/transactions-history/coupon-points',
      },
      {
        displayName: 'ROLLING_MONEY',
        iconName: 'point',
        route: '/transactions-history/rolling-money',
      },
      {
        displayName: 'LOSING_MONEY',
        iconName: 'point',
        route: '/transactions-history/losing-money',
      },
    ],
  },
  {
    displayName: 'TRANSACTIONS_REQUESTS',
    iconName: 'currency-won',
    route: '',
    children: [
      {
        displayName: 'MONEY_DEPOSIT',
        iconName: 'point',
        route: 'transactions-requests/money-recharge',
      },
      {
        displayName: 'MONEY_WITHDRAW',
        iconName: 'point',
        route: '/transactions-requests/money-withdraw',
      },
      {
        displayName: 'POINTS_EXCHANGE',
        iconName: 'point',
        route: '/transactions-requests/points-exchange',
      },
      {
        displayName: 'COUPON_POINTS_EXCHANGE',
        iconName: 'point',
        route: '/transactions-requests/coupon-points-exchange',
      },
      {
        displayName: 'ROLLING_MONEY_WITHDRAW',
        iconName: 'point',
        route: '/transactions-requests/rolling-money-withdraw',
      },
      {
        displayName: 'LOSING_MONEY_WITHDRAW',
        iconName: 'point',
        route: '/transactions-requests/losing-money-withdraw',
      },
    ],
  },
  {
    displayName: 'SETTLEMENTS_MANAGEMENT',
    iconName: 'adjustments-alt',
    route: '',
    children: [
      {
        displayName: 'DAILY_SETTLEMENTS',
        iconName: 'point',
        route: '/settlements-management/daily-settlements',
      },
      {
        displayName: 'MONTHLY_SETTLEMENTS',
        iconName: 'point',
        route: '/settlements-management/monthly-settlements',
      },
    ],
  },
];
