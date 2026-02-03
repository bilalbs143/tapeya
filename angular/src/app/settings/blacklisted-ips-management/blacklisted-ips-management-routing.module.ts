import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BlacklistedIpsManagementComponent } from './blacklisted-ips-management.component';

const routes: Routes = [
  {
    path: '',
    component: BlacklistedIpsManagementComponent,
    data: {
      title: 'BLACKLISTED_IPS_MANAGEMENT',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'SETTINGS' }, { title: 'BLACKLISTED_IPS_MANAGEMENT' }],
      permission: 'blacklisted_ip.view.all',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BlacklistedIpsManagementRoutingModule {}
