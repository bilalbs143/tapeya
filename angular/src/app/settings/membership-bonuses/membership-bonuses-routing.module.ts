import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MembershipBonusesComponent } from './membership-bonuses.component';

const routes: Routes = [
  {
    path: '',
    component: MembershipBonusesComponent,
    data: {
      title: 'MEMBERSHIP_BONUSES',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'SETTINGS' }, { title: 'MEMBERSHIP_BONUSES' }],
      permission: 'membership-level-commission-setting.view.all',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MembershipBonusesRoutingModule {}
