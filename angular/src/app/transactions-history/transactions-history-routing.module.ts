import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'money',
    loadChildren: () => import('./money/money.module').then((m) => m.MoneyModule),
  },

  {
    path: 'coupon-points',
    loadChildren: () => import('./coupon-points/coupon-points.module').then((m) => m.CouponPointsModule),
  },

  {
    path: 'points',
    loadChildren: () => import('./points/points.module').then((m) => m.PointsModule),
  },

  {
    path: 'rolling-money',
    loadChildren: () => import('./rolling-money/rolling-money.module').then((m) => m.RollingMoneyModule),
  },

  {
    path: 'losing-money',
    loadChildren: () => import('./losing-money/losing-money.module').then((m) => m.LosingMoneyModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransactionsHistoryRoutingModule {}
