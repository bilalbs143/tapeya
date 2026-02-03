import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AnnouncementsManagementComponent } from './announcements-management.component';

const routes: Routes = [
  {
    path: '',
    component: AnnouncementsManagementComponent,
    data: {
      title: 'ANNOUNCEMENTS_MANAGEMENT',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'SERVICE_CENTRE' }, { title: 'ANNOUNCEMENTS_MANAGEMENT' }],
      permission: 'announcement.view.all',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnnouncementsManagementRoutingModule {}
