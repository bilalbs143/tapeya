import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PointsComponent } from './points.component';

const routes: Routes = [
  {
    path: '',
    component: PointsComponent,
    data: {
      title: 'POINTS',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'TRANSACTIONS_HISTORY' }, { title: 'POINTS' }],
      permission: 'transaction.view.all',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PointsRoutingModule {}
