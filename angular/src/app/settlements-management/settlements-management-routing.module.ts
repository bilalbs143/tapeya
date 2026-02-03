import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'daily-settlements',
    loadChildren: () => import('./daily-settlements/daily-settlements.module').then((m) => m.DailySettlementsModule),
  },

  {
    path: 'daily-settlements-detailed',
    loadChildren: () => import('./daily-settlements-detailed/daily-settlements-detailed.module').then((m) => m.DailySettlementsDetailedModule),
  },

  {
    path: 'monthly-settlements',
    loadChildren: () => import('./monthly-settlements/monthly-settlements.module').then((m) => m.MonthlySettlementsModule),
  },

  {
    path: 'monthly-settlements-detailed',
    loadChildren: () => import('./monthly-settlements-detailed/monthly-settlements-detailed.module').then((m) => m.MonthlySettlementsDetailedModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettlementsManagementRoutingModule {}
