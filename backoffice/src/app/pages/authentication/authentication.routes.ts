import { Routes } from '@angular/router';

import { AppErrorComponent } from './error/error.component';
import { AppLoginComponent } from './login/login.component';

export const AuthenticationRoutes: Routes = [
  {
    path: '',
    children: [
      {
        title: 'Error-404',
        path: 'error',
        component: AppErrorComponent,
      },
      {
        title: 'Login',
        path: 'login',
        component: AppLoginComponent,
      },
    ],
  },
];
