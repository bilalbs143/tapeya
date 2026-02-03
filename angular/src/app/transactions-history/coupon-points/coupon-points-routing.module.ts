import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CouponPointsComponent } from './coupon-points.component';

const routes: Routes = [
  {
    path: '',
    component: CouponPointsComponent,
    data: {
      title: 'COUPON_POINTS',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'TRANSACTIONS_HISTORY' }, { title: 'COUPON_POINTS' }],
      permission: 'transaction.view.all',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CouponPointsRoutingModule {}
