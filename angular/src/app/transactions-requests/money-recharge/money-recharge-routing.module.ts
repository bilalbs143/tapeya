import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MoneyRechargeComponent } from './money-recharge.component';

const routes: Routes = [
  {
    path: '',
    component: MoneyRechargeComponent,
    data: {
      title: 'MONEY_DEPOSIT',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'TRANSACTIONS_REQUESTS' }, { title: 'MONEY_DEPOSIT' }],
      permission: 'exchange_request.view.all|exchange_request.approve|exchange_request.reject',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MoneyRechargeRoutingModule {}
