import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RollingMoneyWithdrawalHistoryComponent } from './rolling-money-withdrawal-history.component';

const routes: Routes = [
  {
    path: '',
    component: RollingMoneyWithdrawalHistoryComponent,
    data: {
      title: 'ROLLING_MONEY_WITHDRAWAL_HISTORY',
      urls: [{ title: 'USER_DETAILS' }, { title: 'ROLLING_MONEY_WITHDRAWAL_HISTORY' }],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RollingMoneyWithdrawalHistoryRoutingModule {}
