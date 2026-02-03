import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CurrentLoginSessionsComponent } from './current-login-sessions.component';

const routes: Routes = [
  {
    path: '',
    component: CurrentLoginSessionsComponent,
    data: {
      title: 'CURRENT_LOGIN_SESSIONS',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'USERS_MANAGEMENT' }, { title: 'CURRENT_LOGIN_SESSIONS' }],
      permission: 'login.current.view|login.current.kill',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CurrentLoginSessionsRoutingModule {}
