import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';
import { backofficeScopeGuard } from './guards/backoffice-scope.guard';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';

export const routes: Routes = [
  {
    path: '',
    component: FullComponent,
    canActivate: [authGuard, backofficeScopeGuard],
    children: [
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./pages/dashboard/dashboard.routes').then((m) => m.dashboardRoutes),
      },
      {
        path: 'ecommerce',
        loadChildren: () => import('./pages/ecommerce/ecommerce.routes').then((m) => m.EcommerceRoutes),
      },
      {
        path: 'content-management',
        loadChildren: () => import('./pages/content-management/content-management.routes').then((m) => m.ContentManagementRoutes),
      },
      {
        path: 'users-management',
        loadChildren: () => import('./pages/users-management/users-management.routes').then((m) => m.UsersManagementRoutes),
      },
      {
        path: 'players-management',
        loadChildren: () => import('./pages/players-management/players-management.routes').then((m) => m.playersManagementRoutes),
      },
      {
        path: 'shop-management',
        loadChildren: () => import('./pages/shop-management/shop-management.routes').then((m) => m.ShopManagementRoutes),
      },
      {
        path: 'tournaments-management',
        loadChildren: () =>
          import('./pages/tournaments-management/tournaments-management.routes').then((m) => m.TournamentsManagementRoutes),
      },
      {
        path: 'notifications',
        loadChildren: () => import('./pages/notifications/notifications.routes').then((m) => m.NotificationsRoutes),
      },
      {
        path: 'support',
        loadChildren: () => import('./pages/support/support.routes').then((m) => m.SupportRoutes),
      },
      {
        path: 'engagement',
        loadChildren: () => import('./pages/engagement/engagement.routes').then((m) => m.EngagementRoutes),
      },
      {
        path: 'live-streams-management',
        loadChildren: () =>
          import('./pages/live-streams-management/live-streams-management.routes').then((m) => m.LiveStreamsManagementRoutes),
      },
      {
        path: 'settings',
        loadChildren: () => import('./pages/settings/settings.routes').then((m) => m.SettingsRoutes),
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
