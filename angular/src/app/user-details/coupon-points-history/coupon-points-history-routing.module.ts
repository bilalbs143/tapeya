import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CouponPointsHistoryComponent } from './coupon-points-history.component';

const routes: Routes = [
  {
    path: '',
    component: CouponPointsHistoryComponent,
    data: {
      title: 'COUPON_POINTS_HISTORY',
      urls: [{ title: 'USER_DETAILS' }, { title: 'COUPON_POINTS_HISTORY' }],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CouponPointsHistoryRoutingModule {}
