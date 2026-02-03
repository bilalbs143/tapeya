import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RollingMoneyWithdrawComponent } from './rolling-money-withdraw.component';

const routes: Routes = [
  {
    path: '',
    component: RollingMoneyWithdrawComponent,
    data: {
      title: 'ROLLING_MONEY_WITHDRAW',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'TRANSACTIONS_REQUESTS' }, { title: 'ROLLING_MONEY_WITHDRAW' }],
      permission: 'exchange_request.view.all|exchange_request.approve|exchange_request.reject',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RollingMoneyWithdrawRoutingModule {}
