import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CouponPointsExchangeComponent } from './coupon-points-exchange.component';

const routes: Routes = [
  {
    path: '',
    component: CouponPointsExchangeComponent,
    data: {
      title: 'COUPON_POINTS_EXCHANGE',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'TRANSACTIONS_REQUESTS' }, { title: 'COUPON_POINTS_EXCHANGE' }],
      permission: 'exchange_request.view.all|exchange_request.approve|exchange_request.reject',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CouponPointsExchangeRoutingModule {}
