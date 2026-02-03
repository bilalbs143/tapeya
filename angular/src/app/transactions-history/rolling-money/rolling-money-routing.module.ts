import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RollingMoneyComponent } from './rolling-money.component';

const routes: Routes = [
  {
    path: '',
    component: RollingMoneyComponent,
    data: {
      title: 'ROLLING_MONEY',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'TRANSACTIONS_HISTORY' }, { title: 'ROLLING_MONEY' }],
      permission: 'transaction.view.all',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RollingMoneyRoutingModule {}
