import { NavItem } from '../../vertical/sidebar/nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'Home',
  },
  {
    displayName: 'Dashboards',
    iconName: 'solar:home-linear',
    route: 'dashboards',
    children: [
      {
        displayName: 'Analytical',
        iconName: 'tabler:point',
        route: 'dashboards/dashboard1',
      },
      {
        displayName: 'eCommerce',
        iconName: 'tabler:point',
        route: 'dashboards/dashboard2',
      },
    ],
  },
  {
    displayName: 'Frontend pages',
    iconName: 'solar:document-linear',
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
    displayName: 'Apps',
    iconName: 'solar:archive-down-linear',
    route: 'apps',
    ddType: '',
    children: [
      {
        displayName: 'Chat',
        iconName: 'tabler:point',
        route: 'apps/chat',
      },
      {
        displayName: 'Calendar',
        iconName: 'tabler:point',
        route: 'apps/calendar',
      },
      {
        displayName: 'Email',
        iconName: 'tabler:point',
        route: 'apps/email/inbox',
      },
      {
        displayName: 'Contacts',
        iconName: 'tabler:point',
        route: 'apps/contacts',
      },
      {
        displayName: 'Contact List',
        iconName: 'tabler:point',
        route: 'apps/contact-list',
      },
      {
        displayName: 'Courses',
        iconName: 'tabler:point',
        route: 'apps/courses',
      },
      {
        displayName: 'Employee',
        iconName: 'tabler:point',
        route: 'apps/employee',
      },
      {
        displayName: 'Notes',
        iconName: 'tabler:point',
        route: 'apps/notes',
      },
      {
        displayName: 'Tickets',
        iconName: 'tabler:point',
        route: 'apps/tickets',
      },
      {
        displayName: 'Invoice',
        iconName: 'tabler:point',
        route: 'apps/invoice',
      },
      {
        displayName: 'ToDo',
        iconName: 'tabler:point',
        route: 'apps/todo',
      },
      {
        displayName: 'Kanban',
        iconName: 'tabler:point',
        route: 'apps/kanban',
      },
      {
        displayName: 'Blog',
        iconName: 'tabler:point',
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
        displayName: 'User Profile',
        iconName: 'tabler:point',
        route: 'apps/profile-details',
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
        iconName: 'tabler:point',
        route: 'apps/product',
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
    ],
  },
  {
    displayName: 'Ui',
    iconName: 'solar:widget-linear',
    route: 'ui-components',
    ddType: '',
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
    displayName: 'Pages',
    iconName: 'solar:book-linear',
    route: 'theme-pages',
    ddType: '',
    children: [
      {
        displayName: 'Treeview',
        iconName: 'tabler:point',
        route: 'theme-pages/treeview',
      },
      {
        displayName: 'Pricing',
        iconName: 'tabler:point',
        route: 'theme-pages/pricing',
      },
      {
        displayName: 'Account Setting',
        iconName: 'tabler:point',
        route: 'theme-pages/account-setting',
      },
      {
        displayName: 'FAQ',
        iconName: 'tabler:point',
        route: 'theme-pages/faq',
      },
      {
        displayName: 'Landingpage',
        iconName: 'tabler:point',
        route: 'landingpage',
      },
      {
        displayName: 'Widgets',
        iconName: 'tabler:point',
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
        displayName: 'Charts',
        iconName: 'tabler:point',
        route: 'charts',
        children: [
          {
            displayName: 'Line',
            iconName: 'tabler:point',
            route: '/charts/line',
          },
          {
            displayName: 'Gredient',
            iconName: 'tabler:point',
            route: '/charts/gredient',
          },
          {
            displayName: 'Area',
            iconName: 'tabler:point',
            route: '/charts/area',
          },
          {
            displayName: 'Candlestick',
            iconName: 'tabler:point',
            route: '/charts/candlestick',
          },
          {
            displayName: 'Column',
            iconName: 'tabler:point',
            route: '/charts/column',
          },
          {
            displayName: 'Doughnut & Pie',
            iconName: 'tabler:point',
            route: '/charts/doughnut-pie',
          },
          {
            displayName: 'Radialbar & Radar',
            iconName: 'tabler:point',
            route: '/charts/radial-radar',
          },
        ],
      },
      {
        displayName: 'Auth',
        iconName: 'tabler:point',
        route: '/',
        children: [
          {
            displayName: 'Login',
            iconName: 'tabler:point',
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
            iconName: 'tabler:point',
            route: '/authentication',
            children: [
              {
                displayName: 'Login 1',
                iconName: 'tabler:point',
                route: '/authentication/side-register',
              },
              {
                displayName: 'Boxed Login',
                iconName: 'tabler:point',
                route: '/authentication/boxed-register',
              },
            ],
          },
          {
            displayName: 'Forgot Password',
            iconName: 'tabler:point',
            route: '/authentication',
            children: [
              {
                displayName: 'Side Forgot Password',
                iconName: 'tabler:point',
                route: '/authentication/side-forgot-pwd',
              },
              {
                displayName: 'Boxed Forgot Password',
                iconName: 'tabler:point',
                route: '/authentication/boxed-forgot-pwd',
              },
            ],
          },
          {
            displayName: 'Two Steps',
            iconName: 'tabler:point',
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
            iconName: 'tabler:point',
            route: '/authentication/error',
          },
          {
            displayName: 'Maintenance',
            iconName: 'tabler:point',
            route: '/authentication/maintenance',
          },
        ],
      },
    ],
  },
  {
    displayName: 'Forms',
    iconName: 'solar:documents-linear',
    route: 'forms',
    ddType: '',
    children: [
      {
        displayName: 'Form elements',
        iconName: 'tabler:point',
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
        iconName: 'tabler:point',
        route: '/forms/form-layouts',
      },
      {
        displayName: 'Form Horizontal',
        iconName: 'tabler:point',
        route: '/forms/form-horizontal',
      },
      {
        displayName: 'Form Vertical',
        iconName: 'tabler:point',
        route: '/forms/form-vertical',
      },
      {
        displayName: 'Form Wizard',
        iconName: 'tabler:point',
        route: '/forms/form-wizard',
      },
      {
        displayName: 'Toastr',
        iconName: 'tabler:point',
        route: '/forms/form-toastr',
      },
      {
        displayName: 'Editor',
        iconName: 'tabler:point',
        route: '/forms/form-editor',
      },
    ],
  },
  {
    displayName: 'Tables',
    iconName: 'solar:sidebar-minimalistic-linear',
    route: 'tables',
    ddType: '',
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
      {
        displayName: 'Data table',
        iconName: 'tabler:point',
        route: '/datatable/kichen-sink',
      },
    ],
  },
];
