import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WhitelistedIpsManagementComponent } from './whitelisted-ips-management.component';

const routes: Routes = [
  {
    path: '',
    component: WhitelistedIpsManagementComponent,
    data: {
      title: 'WHITELISTED_IPS_MANAGEMENT',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'SETTINGS' }, { title: 'WHITELISTED_IPS_MANAGEMENT' }],
      permission: 'whitelisted_ip.view.all',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WhitelistedIpsManagementRoutingModule {}
