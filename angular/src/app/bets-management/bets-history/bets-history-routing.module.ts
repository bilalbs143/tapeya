import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BetsHistoryComponent } from './bets-history.component';

const routes: Routes = [
  {
    path: '',
    component: BetsHistoryComponent,
    data: {
      title: 'BETS_HISTORY',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'BETS_MANAGEMENT' }, { title: 'BETS_HISTORY' }],
      permission: 'bets-history.view.all',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BetsHistoryRoutingModule {}
