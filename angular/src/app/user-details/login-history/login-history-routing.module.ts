import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginHistoryComponent } from './login-history.component';

const routes: Routes = [
  {
    path: '',
    component: LoginHistoryComponent,
    data: {
      title: 'LOGIN_HISTORY',
      urls: [{ title: 'USER_DETAILS' }, { title: 'LOGIN_HISTORY' }],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginHistoryRoutingModule {}
