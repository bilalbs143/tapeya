import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdditionalBonusesComponent } from './additional-bonuses.component';

const routes: Routes = [
  {
    path: '',
    component: AdditionalBonusesComponent,
    data: {
      title: 'ADDITIONAL_BONUSES',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'SETTINGS' }, { title: 'ADDITIONAL_BONUSES' }],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdditionalBonusesRoutingModule {}
