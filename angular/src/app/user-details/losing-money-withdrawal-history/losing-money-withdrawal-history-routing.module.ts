import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LosingMoneyWithdrawalHistoryComponent } from './losing-money-withdrawal-history.component';

const routes: Routes = [
  {
    path: '',
    component: LosingMoneyWithdrawalHistoryComponent,
    data: {
      title: 'LOSING_MONEY_WITHDRAWAL_HISTORY',
      urls: [{ title: 'USER_DETAILS' }, { title: 'LOSING_MONEY_WITHDRAWAL_HISTORY' }],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LosingMoneyWithdrawalHistoryRoutingModule {}
