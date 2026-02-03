import { Toolbar } from 'ngx-editor';

export const Messages = {
  internetConnectionTitle: 'Internet Connection Error',
  internetConnectionDescription: 'Please check you internet connection.',
  internetConnectionBackTitle: 'Connected',
  internetConnectionBackDescription: 'You have active internet connection now.',
  validationErrorTitle: 'Warning!',
  validationErrorMessage: 'Validation Errors Occurred!',
  success: 'Success!',
  changedPasswordDescription: 'Password Changed Successfully.',
  incorrectOldPassword: 'Incorrect Password.',
  profileUpdated: 'Profile Updated Successfully.',
  noItemFound: 'No  item found',
  unAuthenticated: 'Unauthenticated',
  Error: 'Error!',
  ValidationError: 'Error!',
};

export const LANGUAGES: any[] = [
  {
    language: 'English',
    code: 'en',
    type: 'US',
    icon: '/assets/images/flag/icon-flag-en.svg',
  },
  {
    language: 'Indonesian',
    code: 'id',
    icon: '/assets/images/flag/icon-flag-id.svg',
  },
  {
    language: 'Korean',
    code: 'ko',
    icon: '/assets/images/flag/icon-flag-ko.svg',
  },
  {
    language: 'Malaysian',
    code: 'my',
    icon: '/assets/images/flag/icon-flag-my.svg',
  },
  {
    language: 'Thailand',
    code: 'th',
    icon: '/assets/images/flag/icon-flag-th.svg',
  },
  {
    language: 'Taiwan',
    code: 'tw',
    icon: '/assets/images/flag/icon-flag-tw.svg',
  },
  {
    language: 'Vietnamese',
    code: 'vn',
    icon: '/assets/images/flag/icon-flag-vn.svg',
  },
  {
    language: 'Japanese',
    code: 'jp',
    icon: '/assets/images/flag/icon-flag-jp.svg',
  },
];

export const PAGING = {
  perPage: 50,
  pageSizeOptions: [50, 100, 500, 1000],
};

export const USER_DETAILS_MENU = [
  {
    title: 'BASIC_INFO',
    link: '/basic-info',
  },
  {
    title: 'REFERRALS',
    link: '/referrals',
  },
  {
    title: 'MEMBERS',
    link: '/members',
  },
  {
    title: 'SETTINGS',
    link: '/settings',
  },
  {
    title: 'BET_HISTORY',
    link: '/bets-history',
  },
  {
    title: 'MONEY_DEPOSIT_HISTORY',
    link: '/money-recharge-history',
  },
  {
    title: 'MONEY_WITHDRAWAL_HISTORY',
    link: '/money-withdraw-history',
  },
  {
    title: 'HOLDING_MONEY_HISTORY',
    link: '/holding-money-history',
  },
  {
    title: 'POINTS_HISTORY',
    link: '/points-history',
  },
  {
    title: 'COUPON_POINTS_HISTORY',
    link: '/coupon-points-history',
  },
  {
    title: 'LOGIN_HISTORY',
    link: '/login-history',
  },
  {
    title: 'NOTES',
    link: '/notes',
  },
];

export const AGENT_DETAILS_MENU = [
  {
    title: 'BASIC_INFO',
    link: '/basic-info',
  },
  {
    title: 'SETTINGS',
    link: '/settings',
  },
  {
    title: 'MEMBERS',
    link: '/members',
  },
  {
    title: 'ROLLING_MONEY_WITHDRAWAL_HISTORY',
    link: '/rolling-money-withdrawal-history',
  },
  {
    title: 'ROLLING_MONEY_HISTORY',
    link: '/rolling-money-history',
  },
  {
    title: 'LOSING_MONEY_WITHDRAWAL_HISTORY',
    link: '/losing-money-withdrawal-history',
  },
  {
    title: 'LOSING_MONEY_HISTORY',
    link: '/losing-money-history',
  },
  {
    title: 'COUPON_POINTS_HISTORY',
    link: '/coupon-points-history',
  },
  {
    title: 'LOGIN_HISTORY',
    link: '/login-history',
  },
];

export const TABLE_LOADER = {
  'border-radius': '7px',
  height: '25px',
};

export const CARD_LOADER = {
  'border-radius': '7px',
  height: '25px',
};

const BANKS_OBJECT = {
  1: '산업은행',
  2: '기업은행',
  3: '국민은행',
  4: '수협은행',
  5: '농협은행',
  6: '우리은행',
  7: 'SC제일은행',
  8: '한국씨티은행',
  9: '대구은행',
  10: '부산은행',
  11: '광주은행',
  12: '제주은행',
  13: '전북은행',
  14: '경남은행',
  15: '새마을금고',
  16: '신협',
  17: 'HSBC은행',
  18: '우체국',
  19: '하나은행',
  20: '신한은행',
  21: '케이뱅크',
  22: '카카오뱅크',
};
export const BANKS = Object.entries(BANKS_OBJECT).map(([id, name]) => ({
  id: +id,
  name,
}));

export const BANK_ACCOUNT_TYPES = [
  { value: 'digital_wallet', label: 'DIGITAL_WALLET' },
  { value: 'bank', label: 'BANK' },
  { value: 'pulsa', label: 'PULSA' },
];

export const BETS_HISTORY_STATS_COLUMNS = {
  original: ['bet', 'win', 'refund_amount'],
  custom: ['highest_bet', 'highest_win', 'net_bet', 'bet_difference', 'net_bet_difference'],
};

export const TRANSACTIONS_REQUESTS_STATS_COLUMNS = {
  original: ['requested_money', 'approved_money'],
  custom: ['highest_approved_amount'],
};

export const USER_STATS_COLUMN = {
  original: ['coupon_points', 'points', 'holding_money', 'deposited_money', 'withdrawal_money'],
};

export const AGENTS_STATS_COLUMN = {
  original: ['losing_money', 'rolling_money', 'coupon_points'],
};

export const NGX_EDITOR_TOOLBAR: Toolbar = [
  ['bold', 'italic'],
  ['underline'],
  ['ordered_list', 'bullet_list'],
  [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
  ['link'],
  ['text_color', 'background_color'],
  ['align_left', 'align_center', 'align_right', 'align_justify'],
];
