import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'basic-info',
    loadChildren: () => import('./basic-info/basic-info.module').then((m) => m.BasicInfoModule),
  },

  {
    path: 'basic-info-detailed',
    loadChildren: () => import('./basic-info-detailed/basic-info-detailed.module').then((m) => m.BasicInfoDetailedModule),
  },

  {
    path: 'referrals',
    loadChildren: () => import('./referrals/referrals.module').then((m) => m.ReferralsModule),
  },

  {
    path: 'members',
    loadChildren: () => import('./members/members.module').then((m) => m.MembersModule),
  },

  {
    path: 'bets-history',
    loadChildren: () => import('./bets-history/bets-history.module').then((m) => m.BetsHistoryModule),
  },

  {
    path: 'coupon-points-history',
    loadChildren: () => import('./coupon-points-history/coupon-points-history.module').then((m) => m.CouponPointsHistoryModule),
  },

  {
    path: 'money-recharge-history',
    loadChildren: () => import('./money-recharge-history/money-recharge-history.module').then((m) => m.MoneyRechargeHistoryModule),
  },

  {
    path: 'holding-money-history',
    loadChildren: () => import('./holding-money-history/holding-money-history.module').then((m) => m.HoldingMoneyHistoryModule),
  },

  {
    path: 'login-history',
    loadChildren: () => import('./login-history/login-history.module').then((m) => m.LoginHistoryModule),
  },

  {
    path: 'notes',
    loadChildren: () => import('./notes/notes.module').then((m) => m.NotesModule),
  },

  {
    path: 'points-history',
    loadChildren: () => import('./points-history/points-history.module').then((m) => m.PointsHistoryModule),
  },

  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then((m) => m.SettingsModule),
  },

  {
    path: 'money-withdraw-history',
    loadChildren: () => import('./withdrawal-history/withdrawal-history.module').then((m) => m.WithdrawalHistoryModule),
  },

  {
    path: 'rolling-money-withdrawal-history',
    loadChildren: () =>
      import('./rolling-money-withdrawal-history/rolling-money-withdrawal-history.module').then((m) => m.RollingMoneyWithdrawalHistoryModule),
  },

  {
    path: 'rolling-money-history',
    loadChildren: () => import('./rolling-money-history/rolling-money-history.module').then((m) => m.RollingMoneyHistoryModule),
  },

  {
    path: 'losing-money-withdrawal-history',
    loadChildren: () =>
      import('./losing-money-withdrawal-history/losing-money-withdrawal-history.module').then((m) => m.LosingMoneyWithdrawalHistoryModule),
  },

  {
    path: 'losing-money-history',
    loadChildren: () => import('./losing-money-history/losing-money-history.module').then((m) => m.LosingMoneyHistoryModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserDetailsRoutingModule {}
