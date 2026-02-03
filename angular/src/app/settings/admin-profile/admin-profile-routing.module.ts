import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminProfileComponent } from './admin-profile.component';

const routes: Routes = [
  {
    path: '',
    component: AdminProfileComponent,
    data: {
      title: 'ADMIN_PROFILE',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'SETTINGS' }, { title: 'ADMIN_PROFILE' }],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminProfileRoutingModule {}
