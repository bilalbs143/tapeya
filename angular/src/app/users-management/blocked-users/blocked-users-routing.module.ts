import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BlockedUsersComponent } from './blocked-users.component';

const routes: Routes = [
  {
    path: '',
    component: BlockedUsersComponent,
    data: {
      title: 'BLOCKED_USERS',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'USERS_MANAGEMENT' }, { title: 'BLOCKED_USERS' }],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BlockedUsersRoutingModule {}
