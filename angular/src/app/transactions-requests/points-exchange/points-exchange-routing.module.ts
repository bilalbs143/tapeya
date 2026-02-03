import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PointsExchangeComponent } from './points-exchange.component';

const routes: Routes = [
  {
    path: '',
    component: PointsExchangeComponent,
    data: {
      title: 'POINTS_EXCHANGE',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'TRANSACTIONS_REQUESTS' }, { title: 'POINTS_EXCHANGE' }],
      permission: 'exchange_request.view.all|exchange_request.approve|exchange_request.reject',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PointsExchangeRoutingModule {}
