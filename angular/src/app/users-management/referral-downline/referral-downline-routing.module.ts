import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ReferralDownlineComponent } from './referral-downline.component';

const routes: Routes = [
  {
    path: '',
    component: ReferralDownlineComponent,
    data: {
      title: 'REFERRAL_DOWNLINE',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'USERS_MANAGEMENT' }, { title: 'REFERRAL_DOWNLINE' }],
      permission: 'member.view.all',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReferralDownlineRoutingModule {}
