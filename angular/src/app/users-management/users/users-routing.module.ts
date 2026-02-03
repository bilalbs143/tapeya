import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UsersComponent } from './users.component';

const routes: Routes = [
  {
    path: '',
    component: UsersComponent,
    data: {
      title: 'USERS',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'USERS_MANAGEMENT' }, { title: 'USERS' }],
      permission: 'member.view.all',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersRoutingModule {}
