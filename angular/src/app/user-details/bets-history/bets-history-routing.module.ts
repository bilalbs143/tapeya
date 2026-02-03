import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BetsHistoryComponent } from './bets-history.component';

const routes: Routes = [
  {
    path: '',
    component: BetsHistoryComponent,
    data: {
      title: 'BET_HISTORY',
      urls: [{ title: 'USER_DETAILS' }, { title: 'BET_HISTORY' }],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BetsHistoryRoutingModule {}
