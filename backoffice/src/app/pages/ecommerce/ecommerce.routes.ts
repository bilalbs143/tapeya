import { Routes } from '@angular/router';

export const EcommerceRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ecommerce-dashboard/ecommerce-dashboard.component').then((m) => m.EcommerceDashboardComponent),
    data: {
      title: 'eCommerce Dashboard',
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'eCommerce Dashboard' }],
    },
  },
];
