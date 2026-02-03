import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BlankComponent } from './layouts/blank/blank.component';
import { ChildComponent } from './layouts/child/child.component';
import { FullComponent } from './layouts/full/full.component';
import { AuthGuard } from './shared/auth/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    component: FullComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
      },
      {
        path: 'agents-management',
        loadChildren: () => import('./agents-management/agents-management.module').then((m) => m.AgentsManagementModule),
      },
      {
        path: 'bets-management',
        loadChildren: () => import('./bets-management/bets-management.module').then((m) => m.BetsManagementModule),
      },
      {
        path: 'service-centre',
        loadChildren: () => import('./service-centre/service-centre.module').then((m) => m.ServiceCentreModule),
      },
      {
        path: 'settings',
        loadChildren: () => import('./settings/settings.module').then((m) => m.SettingsModule),
      },
      {
        path: 'settlements-management',
        loadChildren: () => import('./settlements-management/settlements-management.module').then((m) => m.SettlementsManagementModule),
      },
      {
        path: 'users-management',
        loadChildren: () => import('./users-management/users-management.module').then((m) => m.UsersManagementModule),
      },
      {
        path: 'transactions-requests',
        loadChildren: () => import('./transactions-requests/transactions-requests.module').then((m) => m.TransactionsRequestsModule),
      },
      {
        path: 'transactions-history',
        loadChildren: () => import('./transactions-history/transactions-history.module').then((m) => m.TransactionsHistoryModule),
      },
      {
        path: 'banks-management',
        loadChildren: () => import('./banks-management/banks-management.module').then((m) => m.BanksManagementModule),
      },
      {
        path: 'promotions-management',
        loadChildren: () => import('./promotions-management/promotions.module').then((m) => m.PromotionsModule),
      },
      {
        path: 'bank-management',
        redirectTo: 'banks-management',
        pathMatch: 'full',
      },
    ],
  },

  {
    path: '',
    component: BlankComponent,
    children: [
      {
        path: 'authentication',
        loadChildren: () => import('./pages/authentication/authentication.module').then((m) => m.AuthenticationModule),
      },
    ],
  },

  {
    path: '',
    component: ChildComponent,
    children: [
      {
        path: ':userType/details/:id',
        loadChildren: () => import('./user-details/user-details.module').then((m) => m.UserDetailsModule),
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'authentication/error',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
