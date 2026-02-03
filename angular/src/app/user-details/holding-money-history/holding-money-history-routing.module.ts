import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HoldingMoneyHistoryComponent } from './holding-money-history.component';

const routes: Routes = [
  {
    path: '',
    component: HoldingMoneyHistoryComponent,
    data: {
      title: 'HOLDING_MONEY_HISTORY',
      urls: [{ title: 'USER_DETAILS' }, { title: 'HOLDING_MONEY_HISTORY' }],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HoldingMoneyHistoryRoutingModule {}
