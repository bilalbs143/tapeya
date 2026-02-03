import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LosingMoneyHistoryComponent } from './losing-money-history.component';

const routes: Routes = [
  {
    path: '',
    component: LosingMoneyHistoryComponent,
    data: {
      title: 'LOSING_MONEY_HISTORY',
      urls: [{ title: 'USER_DETAILS' }, { title: 'LOSING_MONEY_HISTORY' }],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LosingMoneyHistoryRoutingModule {}
