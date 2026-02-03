import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PointsHistoryComponent } from './points-history.component';

const routes: Routes = [
  {
    path: '',
    component: PointsHistoryComponent,
    data: {
      title: 'POINTS_HISTORY',
      urls: [{ title: 'USER_DETAILS' }, { title: 'POINTS_HISTORY' }],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PointsHistoryRoutingModule {}
