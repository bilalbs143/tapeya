import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'Home',
  },
  {
    displayName: 'Analytical',
    iconName: 'solar:widget-line-duotone',
    route: '/dashboards/dashboard1',
  },
  {
    displayName: 'eCommerce',
    iconName: 'solar:cart-line-duotone',
    route: '/dashboards/dashboard2',
  },
  {
    displayName: 'Frontend pages',
    iconName: 'solar:home-angle-line-duotone',
    route: 'front-pages',
    children: [
      {
        displayName: 'Home Page',
        iconName: 'tabler:point',
        route: 'front-pages/homepage',
      },
      {
        displayName: 'About Us',
        iconName: 'tabler:point',
        route: 'front-pages/about',
      },
      {
        displayName: 'Blog',
        iconName: 'tabler:point',
        route: 'front-pages/blog',
      },
      {
        displayName: 'Blog Details',
        iconName: 'tabler:point',
        route: 'front-pages/blog-details',
      },
      {
        displayName: 'Portfolio',
        iconName: 'tabler:point',
        route: 'front-pages/portfolio',
      },
      {
        displayName: 'Pricing',
        iconName: 'tabler:point',
        route: 'front-pages/pricing',
      },
      {
        displayName: 'Contact',
        iconName: 'tabler:point',
        route: 'front-pages/contact',
      }
    ]
  },
  {
    navCap: 'Apps',
  },
  {
    displayName: 'Chat',
    iconName: 'solar:chat-round-line-line-duotone',
    route: 'apps/chat',
  },
  {
    displayName: 'Calendar',
    iconName: 'solar:calendar-mark-line-duotone',
    route: 'apps/calendar',
  },
  {
    displayName: 'Email',
    iconName: 'solar:letter-line-duotone',
    route: 'apps/email/inbox',
  },
  {
    displayName: 'Kanban',
    iconName: 'solar:clapperboard-edit-line-duotone',
    route: 'apps/kanban',
  },
  {
    displayName: 'User Profile',
    iconName: 'solar:user-circle-line-duotone',
    route: 'apps/profile-details',
    chip: true,
    chipClass: 'bg-primary text-white',
    chipContent: 'New',
    children: [
      {
        displayName: 'Profile',
        iconName: 'tabler:point',
        route: 'apps/profile-details/profile',
      },
      {
        displayName: 'Followers',
        iconName: 'tabler:point',
        route: 'apps/profile-details/followers',
      },
      {
        displayName: 'Friends',
        iconName: 'tabler:point',
        route: 'apps/profile-details/friends',
      },
      {
        displayName: 'Gellary',
        iconName: 'tabler:point',
        route: 'apps/profile-details/gallery',
      },
    ],
  },
  {
    displayName: 'Ecommerce',
    iconName: 'solar:cart-5-line-duotone',
    route: 'apps/product',
    chip: true,
    chipClass: 'bg-primary text-white',
    chipContent: 'New',
    children: [
      {
        displayName: 'Product List',
        iconName: 'tabler:point',
        route: 'apps/product/product-list',
      },
      {
        displayName: 'Add Product',
        iconName: 'tabler:point',
        route: 'apps/product/add-product',
      },
      {
        displayName: 'Edit Product',
        iconName: 'tabler:point',
        route: 'apps/product/edit-product',
      },
      {
        displayName: 'Shop',
        iconName: 'tabler:point',
        route: 'apps/product/shop',
      },
    ],
  },
  {
    displayName: 'Contacts',
    iconName: 'solar:phone-line-duotone',
    route: 'apps/contacts',
  },
  {
    displayName: 'Courses',
    iconName: 'solar:book-bookmark-line-duotone',
    route: 'apps/courses',
  },
  {
    displayName: 'Employee',
    iconName: 'solar:user-id-line-duotone',
    route: 'apps/employee',
  },
  {
    displayName: 'Notes',
    iconName: 'solar:document-text-line-duotone',
    route: 'apps/notes',
  },
  {
    displayName: 'Tickets',
    iconName: 'solar:ticket-sale-line-duotone',
    route: 'apps/tickets',
  },
  {
    displayName: 'Contact List',
    iconName: 'solar:phone-line-duotone',
    route: 'apps/contact-list',
  },
  {
    displayName: 'Invoice',
    iconName: 'solar:bill-list-line-duotone',
    route: 'apps/invoice',
    children: [
      {
        displayName: 'List',
        iconName: 'tabler:point',
        route: 'apps/invoice/list',
      },
      {
        displayName: 'Detail',
        iconName: 'tabler:point',
        route: 'apps/invoice/viewInvoice/101',
      },
      {
        displayName: 'Create',
        iconName: 'tabler:point',
        route: 'apps/invoice/addInvoice',
      },
      {
        displayName: 'Edit',
        iconName: 'tabler:point',
        route: 'apps/invoice/editinvoice/101',
      },
    ],
  },
  {
    displayName: 'ToDo',
    iconName: 'solar:airbuds-case-minimalistic-line-duotone',
    route: 'apps/todo',
  },
  {
    displayName: 'Blog',
    iconName: 'solar:widget-4-line-duotone',
    route: 'apps/blog',
    children: [
      {
        displayName: 'Post',
        iconName: 'tabler:point',
        route: 'apps/blog/post',
      },
      {
        displayName: 'Detail',
        iconName: 'tabler:point',
        route: 'apps/blog/detail/Early Black Friday Amazon deals: cheap TVs, headphones, laptops',
      },
    ],
  },
  {
    navCap: 'Pages',
  },
  {
    displayName: 'Roll Base Access',
    iconName: 'solar:lock-password-unlocked-line-duotone',
    route: 'apps/permission',
  },
  {
    displayName: 'Treeview',
    iconName: 'solar:bill-line-duotone',
    route: 'theme-pages/treeview',
  },
  {
    displayName: 'Pricing',
    iconName: 'solar:dollar-minimalistic-line-duotone',
    route: 'theme-pages/pricing',
  },
  {
    displayName: 'Account Setting',
    iconName: 'solar:accessibility-line-duotone',
    route: 'theme-pages/account-setting',
  },
  {
    displayName: 'FAQ',
    iconName: 'solar:question-square-line-duotone',
    route: 'theme-pages/faq',
  },
  {
    displayName: 'Landingpage',
    iconName: 'solar:layers-minimalistic-line-duotone',
    route: 'landingpage',
  },
  {
    displayName: 'Widgets',
    iconName: 'solar:widget-2-line-duotone',
    route: 'widgets',
    children: [
      {
        displayName: 'Cards',
        iconName: 'tabler:point',
        route: 'widgets/cards',
      },
      {
        displayName: 'Banners',
        iconName: 'tabler:point',
        route: 'widgets/banners',
      },
      {
        displayName: 'Charts',
        iconName: 'tabler:point',
        route: 'widgets/charts',
      },
    ],
  },
  {
    navCap: 'Forms',
  },
  {
    displayName: 'Form elements',
    iconName: 'solar:password-minimalistic-input-line-duotone',
    route: 'forms/forms-elements',
    children: [
      {
        displayName: 'Autocomplete',
        iconName: 'tabler:point',
        route: 'forms/forms-elements/autocomplete',
      },
      {
        displayName: 'Button',
        iconName: 'tabler:point',
        route: 'forms/forms-elements/button',
      },
      {
        displayName: 'Checkbox',
        iconName: 'tabler:point',
        route: 'forms/forms-elements/checkbox',
      },
      {
        displayName: 'Radio',
        iconName: 'tabler:point',
        route: 'forms/forms-elements/radio',
      },
      {
        displayName: 'Datepicker',
        iconName: 'tabler:point',
        route: 'forms/forms-elements/datepicker',
      },
    ],
  },
  {
    displayName: 'Form Layouts',
    iconName: 'solar:file-text-line-duotone',
    route: '/forms/form-layouts',
  },
  {
    displayName: 'Form Horizontal',
    iconName: 'solar:align-horizonta-spacing-line-duotone',
    route: '/forms/form-horizontal',
  },
  {
    displayName: 'Form Vertical',
    iconName: 'solar:align-vertical-spacing-line-duotone',
    route: '/forms/form-vertical',
  },
  {
    displayName: 'Form Wizard',
    iconName: 'solar:archive-minimalistic-line-duotone',
    route: '/forms/form-wizard',
  },
  {
    displayName: 'Toastr',
    iconName: 'solar:notification-lines-remove-line-duotone',
    route: '/forms/form-toastr',
  },
  {
    displayName: 'Editor',
    iconName: 'solar:clapperboard-edit-line-duotone',
    route: '/forms/form-editor',
    chip: true,
    chipClass: 'bg-primary text-white',
    chipContent: 'New',
  },
  {
    navCap: 'Tables',
  },
  {
    displayName: 'Tables',
    iconName: 'solar:tablet-line-duotone',
    route: 'tables',
    children: [
      {
        displayName: 'Basic Table',
        iconName: 'tabler:point',
        route: 'tables/basic-table',
      },
      {
        displayName: 'Dynamic Table',
        iconName: 'tabler:point',
        route: 'tables/dynamic-table',
      },
      {
        displayName: 'Expand Table',
        iconName: 'tabler:point',
        route: 'tables/expand-table',
      },
      {
        displayName: 'Filterable Table',
        iconName: 'tabler:point',
        route: 'tables/filterable-table',
      },
      {
        displayName: 'Footer Row Table',
        iconName: 'tabler:point',
        route: 'tables/footer-row-table',
      },
      {
        displayName: 'HTTP Table',
        iconName: 'tabler:point',
        route: 'tables/http-table',
      },
      {
        displayName: 'Mix Table',
        iconName: 'tabler:point',
        route: 'tables/mix-table',
      },
      {
        displayName: 'Multi Header Footer',
        iconName: 'tabler:point',
        route: 'tables/multi-header-footer-table',
      },
      {
        displayName: 'Pagination Table',
        iconName: 'tabler:point',
        route: 'tables/pagination-table',
      },
      {
        displayName: 'Row Context Table',
        iconName: 'tabler:point',
        route: 'tables/row-context-table',
      },
      {
        displayName: 'Selection Table',
        iconName: 'tabler:point',
        route: 'tables/selection-table',
      },
      {
        displayName: 'Sortable Table',
        iconName: 'tabler:point',
        route: 'tables/sortable-table',
      },
      {
        displayName: 'Sticky Column',
        iconName: 'tabler:point',
        route: 'tables/sticky-column-table',
      },
      {
        displayName: 'Sticky Header Footer',
        iconName: 'tabler:point',
        route: 'tables/sticky-header-footer-table',
      },
    ],
  },
  {
    displayName: 'Data table',
    iconName: 'solar:database-line-duotone',
    route: '/datatable/kichen-sink',
  },
  {
    navCap: 'Chart',
  },
  {
    displayName: 'Line',
    iconName: 'solar:align-top-line-duotone',
    route: '/charts/line',
  },
  {
    displayName: 'Gredient',
    iconName: 'solar:bolt-circle-line-duotone',
    route: '/charts/gredient',
  },
  {
    displayName: 'Area',
    iconName: 'solar:chart-square-line-duotone',
    route: '/charts/area',
  },
  {
    displayName: 'Candlestick',
    iconName: 'solar:align-left-line-duotone',
    route: '/charts/candlestick',
  },
  {
    displayName: 'Column',
    iconName: 'solar:chart-2-line-duotone',
    route: '/charts/column',
  },
  {
    displayName: 'Doughnut & Pie',
    iconName: 'solar:pie-chart-2-line-duotone',
    route: '/charts/doughnut-pie',
  },
  {
    displayName: 'Radialbar & Radar',
    iconName: 'solar:align-vertical-center-line-duotone',
    route: '/charts/radial-radar',
  },
  {
    navCap: 'UI',
  },
  {
    displayName: 'Ui Components',
    iconName: 'solar:share-circle-line-duotone',
    route: 'ui-components',
    children: [
      {
        displayName: 'Badge',
        iconName: 'tabler:point',
        route: 'ui-components/badge',
      },
      {
        displayName: 'Expansion Panel',
        iconName: 'tabler:point',
        route: 'ui-components/expansion',
      },
      {
        displayName: 'Chips',
        iconName: 'tabler:point',
        route: 'ui-components/chips',
      },
      {
        displayName: 'Dialog',
        iconName: 'tabler:point',
        route: 'ui-components/dialog',
      },
      {
        displayName: 'Lists',
        iconName: 'tabler:point',
        route: 'ui-components/lists',
      },
      {
        displayName: 'Divider',
        iconName: 'tabler:point',
        route: 'ui-components/divider',
      },
      {
        displayName: 'Menu',
        iconName: 'tabler:point',
        route: 'ui-components/menu',
      },
      {
        displayName: 'Paginator',
        iconName: 'tabler:point',
        route: 'ui-components/paginator',
      },
      {
        displayName: 'Progress Bar',
        iconName: 'tabler:point',
        route: 'ui-components/progress',
      },
      {
        displayName: 'Progress Spinner',
        iconName: 'tabler:point',
        route: 'ui-components/progress-spinner',
      },
      {
        displayName: 'Ripples',
        iconName: 'tabler:point',
        route: 'ui-components/ripples',
      },
      {
        displayName: 'Slide Toggle',
        iconName: 'tabler:point',
        route: 'ui-components/slide-toggle',
      },
      {
        displayName: 'Slider',
        iconName: 'tabler:point',
        route: 'ui-components/slider',
      },
      {
        displayName: 'Snackbar',
        iconName: 'tabler:point',
        route: 'ui-components/snackbar',
      },
      {
        displayName: 'Tabs',
        iconName: 'tabler:point',
        route: 'ui-components/tabs',
      },
      {
        displayName: 'Toolbar',
        iconName: 'tabler:point',
        route: 'ui-components/toolbar',
      },
      {
        displayName: 'Tooltips',
        iconName: 'tabler:point',
        route: 'ui-components/tooltips',
      },
    ],
  },
  {
    navCap: 'Auth',
  },
  {
    displayName: 'Login',
    iconName: 'solar:lock-keyhole-minimalistic-line-duotone',
    route: '/authentication',
    children: [
      {
        displayName: 'Login 1',
        iconName: 'tabler:point',
        route: '/authentication/login',
      },
      {
        displayName: 'Boxed Login',
        iconName: 'tabler:point',
        route: '/authentication/boxed-login',
      },
    ],
  },
  {
    displayName: 'Register',
    iconName: 'solar:user-plus-rounded-line-duotone',
    route: '/authentication',
    children: [
      {
        displayName: 'Side Register',
        iconName: 'tabler:point',
        route: '/authentication/side-register',
      },
      {
        displayName: 'Boxed Register',
        iconName: 'tabler:point',
        route: '/authentication/boxed-register',
      },
    ],
  },
  {
    displayName: 'Forgot Password',
    iconName: 'solar:password-outline',
    route: '/authentication',
    children: [
      {
        displayName: 'Side Forgot Pwd',
        iconName: 'tabler:point',
        route: '/authentication/side-forgot-pwd',
      },
      {
        displayName: 'Boxed Forgot Pwd',
        iconName: 'tabler:point',
        route: '/authentication/boxed-forgot-pwd',
      },
    ],
  },
  {
    displayName: 'Two Steps',
    iconName: 'solar:siderbar-line-duotone',
    route: '/authentication',
    children: [
      {
        displayName: 'Side Two Steps',
        iconName: 'tabler:point',
        route: '/authentication/side-two-steps',
      },
      {
        displayName: 'Boxed Two Steps',
        iconName: 'tabler:point',
        route: '/authentication/boxed-two-steps',
      },
    ],
  },
  {
    displayName: 'Error',
    iconName: 'solar:bug-minimalistic-line-duotone',
    route: '/authentication/error',
  },
  {
    displayName: 'Maintenance',
    iconName: 'solar:settings-line-duotone',
    route: '/authentication/maintenance',
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
