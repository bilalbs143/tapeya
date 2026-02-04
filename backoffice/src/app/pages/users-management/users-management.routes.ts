import { Routes } from '@angular/router';

export const UsersManagementRoutes: Routes = [
  {
    path: 'users',
    loadComponent: () => import('./users/users.component').then((m) => m.UsersComponent),
    data: {
      title: 'Users',
      urls: [{ title: 'Dashboard', url: '/starter' }, { title: 'Users Management' }, { title: 'Users' }],
    },
  },
];
