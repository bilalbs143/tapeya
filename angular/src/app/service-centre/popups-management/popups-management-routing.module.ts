import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PopupsManagementComponent } from './popups-management.component';

const routes: Routes = [
  {
    path: '',
    component: PopupsManagementComponent,
    data: {
      title: 'POPUPS_MANAGEMENT',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'SERVICE_CENTRE' }, { title: 'POPUPS_MANAGEMENT' }],
      permission: 'popup.view.all',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PopupsManagementRoutingModule {}
