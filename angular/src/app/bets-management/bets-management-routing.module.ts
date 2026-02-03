import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'bets-history',
    loadChildren: () => import('./bets-history/bets-history.module').then((m) => m.BetsHistoryModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BetsManagementRoutingModule {}
