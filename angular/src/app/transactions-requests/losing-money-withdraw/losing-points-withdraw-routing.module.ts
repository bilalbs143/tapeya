import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LosingMoneyWithdrawComponent } from './losing-money-withdraw.component';

const routes: Routes = [
  {
    path: '',
    component: LosingMoneyWithdrawComponent,
    data: {
      title: 'LOSING_MONEY_WITHDRAW',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'TRANSACTIONS_REQUESTS' }, { title: 'LOSING_MONEY_WITHDRAW' }],
      permission: 'exchange_request.view.all|exchange_request.approve|exchange_request.reject',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LosingPointsWithdrawRoutingModule {}
