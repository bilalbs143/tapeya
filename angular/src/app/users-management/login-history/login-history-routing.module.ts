import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PermissionGuard } from '../../shared/auth/permission-guard.service';

import { LoginHistoryComponent } from './login-history.component';

const routes: Routes = [
  {
    path: '',
    component: LoginHistoryComponent,
    data: {
      title: 'LOGIN_HISTORY',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'USERS_MANAGEMENT' }, { title: 'LOGIN_HISTORY' }],
      permission: 'login.history.view',
    },
    canActivate: [PermissionGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginHistoryRoutingModule {}
