import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RollingMoneyHistoryComponent } from './rolling-money-history.component';

const routes: Routes = [
  {
    path: '',
    component: RollingMoneyHistoryComponent,
    data: {
      title: 'ROLLING_MONEY_HISTORY',
      urls: [{ title: 'USER_DETAILS' }, { title: 'ROLLING_MONEY_HISTORY' }],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RollingMoneyHistoryRoutingModule {}
