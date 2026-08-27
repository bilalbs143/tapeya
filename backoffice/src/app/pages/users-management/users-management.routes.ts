import { Routes } from '@angular/router';

/** Lazy-loaded routes for Users Management (list, create/edit/delete user). */
export const UsersManagementRoutes: Routes = [
  {
    path: 'users',
    loadComponent: () => import('./users/users.component').then((m) => m.UsersComponent),
    data: {
      title: 'Users',
      icon: 'solar:users-group-two-rounded-line-duotone',
      hideBreadcrumb: true,
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Users Management' }, { title: 'Users' }],
    },
  },
];
