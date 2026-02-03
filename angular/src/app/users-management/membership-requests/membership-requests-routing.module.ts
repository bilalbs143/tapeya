import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MembershipRequestsComponent } from './membership-requests.component';

const routes: Routes = [
  {
    path: '',
    component: MembershipRequestsComponent,
    data: {
      title: 'MEMBERSHIP_REQUESTS',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'USERS_MANAGEMENT' }, { title: 'MEMBERSHIP_REQUESTS' }],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MembershipRequestsRoutingModule {}
