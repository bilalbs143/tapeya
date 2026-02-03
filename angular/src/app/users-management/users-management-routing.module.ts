import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'blocked-users',
    loadChildren: () => import('./blocked-users/blocked-users.module').then((m) => m.BlockedUsersModule),
  },

  {
    path: 'current-login-sessions',
    loadChildren: () => import('./current-login-sessions/current-login-sessions.module').then((m) => m.CurrentLoginSessionsModule),
  },

  {
    path: 'login-history',
    loadChildren: () => import('./login-history/login-history.module').then((m) => m.LoginHistoryModule),
  },

  {
    path: 'membership-requests',
    loadChildren: () => import('./membership-requests/membership-requests.module').then((m) => m.MembershipRequestsModule),
  },

  {
    path: 'users',
    loadChildren: () => import('./users/users.module').then((m) => m.UsersModule),
  },

  {
    path: 'referral-downline',
    loadChildren: () => import('./referral-downline/referral-downline.module').then((m) => m.ReferralDownlineModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersManagementRoutingModule {}
