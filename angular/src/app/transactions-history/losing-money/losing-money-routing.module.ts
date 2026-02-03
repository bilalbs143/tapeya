import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LosingMoneyComponent } from './losing-money.component';

const routes: Routes = [
  {
    path: '',
    component: LosingMoneyComponent,
    data: {
      title: 'LOSING_MONEY',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'TRANSACTIONS_HISTORY' }, { title: 'LOSING_MONEY' }],
      permission: 'transaction.view.all',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LosingMoneyRoutingModule {}
