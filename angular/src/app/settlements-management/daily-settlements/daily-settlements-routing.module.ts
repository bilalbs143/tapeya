import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DailySettlementsComponent } from './daily-settlements.component';

const routes: Routes = [
  {
    path: '',
    component: DailySettlementsComponent,
    data: {
      title: 'DAILY_SETTLEMENTS',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'SETTLEMENTS_MANAGEMENT' }, { title: 'DAILY_SETTLEMENTS' }],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DailySettlementsRoutingModule {}
