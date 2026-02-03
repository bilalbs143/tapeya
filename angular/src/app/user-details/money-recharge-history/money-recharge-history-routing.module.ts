import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MoneyRechargeHistoryComponent } from './money-recharge-history.component';

const routes: Routes = [
  {
    path: '',
    component: MoneyRechargeHistoryComponent,
    data: {
      title: 'MONEY_DEPOSIT_HISTORY',
      urls: [{ title: 'USER_DETAILS' }, { title: 'MONEY_DEPOSIT_HISTORY' }],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MoneyRechargeHistoryRoutingModule {}
