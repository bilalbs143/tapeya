import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';

export const routes: Routes = [
  {
    path: '',
    component: FullComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: '/starter',
        pathMatch: 'full',
      },
      {
        path: 'starter',
        loadChildren: () => import('./pages/pages.routes').then((m) => m.PagesRoutes),
      },
      {
        path: 'content-management',
        loadChildren: () =>
          import('./pages/content-management/content-management.routes').then((m) => m.ContentManagementRoutes),
      },
      {
        path: 'users-management',
        loadChildren: () =>
          import('./pages/users-management/users-management.routes').then((m) => m.UsersManagementRoutes),
      },
      {
        path: 'shop-management',
        loadChildren: () =>
          import('./pages/shop-management/shop-management.routes').then((m) => m.ShopManagementRoutes),
      },
      {
        path: 'events-management',
        loadChildren: () =>
          import('./pages/events-management/events-management.routes').then((m) => m.EventsManagementRoutes),
      },
      {
        path: 'sample-page',
        loadChildren: () => import('./pages/pages.routes').then((m) => m.PagesRoutes),
      },
    ],
  },
  {
    path: '',
    component: BlankComponent,
    children: [
      {
        path: 'authentication',
        loadChildren: () => import('./pages/authentication/authentication.routes').then((m) => m.AuthenticationRoutes),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'authentication/error',
  },
];
