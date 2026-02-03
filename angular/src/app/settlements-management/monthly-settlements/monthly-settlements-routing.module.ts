import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MonthlySettlementsComponent } from './monthly-settlements.component';

const routes: Routes = [
  {
    path: '',
    component: MonthlySettlementsComponent,
    data: {
      title: 'MONTHLY_SETTLEMENTS',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'SETTLEMENTS_MANAGEMENT' }, { title: 'MONTHLY_SETTLEMENTS' }],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MonthlySettlementsRoutingModule {}
