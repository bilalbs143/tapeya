import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ReferralsComponent } from './referrals.component';

const routes: Routes = [
  {
    path: '',
    component: ReferralsComponent,
    data: {
      title: 'REFERRALS',
      urls: [{ title: 'USER_DETAILS' }, { title: 'REFERRALS' }],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReferralsRoutingModule {}
