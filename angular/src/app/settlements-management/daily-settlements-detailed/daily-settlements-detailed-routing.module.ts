import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DailySettlementsDetailedComponent } from './daily-settlements-detailed.component';

const routes: Routes = [
  {
    path: '',
    component: DailySettlementsDetailedComponent,
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
export class DailySettlementsDetailedRoutingModule {}
