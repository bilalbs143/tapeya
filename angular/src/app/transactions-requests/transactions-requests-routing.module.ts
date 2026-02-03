import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'money-recharge',
    loadChildren: () => import('./money-recharge/money-recharge.module').then((m) => m.MoneyRechargeModule),
  },

  {
    path: 'money-withdraw',
    loadChildren: () => import('./money-withdraw/money-withdraw.module').then((m) => m.MoneyWithdrawModule),
  },

  {
    path: 'points-exchange',
    loadChildren: () => import('./points-exchange/points-exchange.module').then((m) => m.PointsExchangeModule),
  },

  {
    path: 'coupon-points-exchange',
    loadChildren: () => import('./coupon-points-exchange/coupon-points-exchange.module').then((m) => m.CouponPointsExchangeModule),
  },

  {
    path: 'rolling-money-withdraw',
    loadChildren: () => import('./rolling-money-withdraw/rolling-money-withdraw.module').then((m) => m.RollingMoneyWithdrawModule),
  },

  {
    path: 'losing-money-withdraw',
    loadChildren: () => import('./losing-money-withdraw/losing-money-withdraw.module').then((m) => m.LosingMoneyWithdrawModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransactionsRequestsRoutingModule {}
