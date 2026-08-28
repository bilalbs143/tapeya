import { Routes } from '@angular/router';

import { StarterComponent } from './starter/starter.component';

export const PagesRoutes: Routes = [
  {
    path: '',
    component: StarterComponent,
    data: {
      title: 'Starter Page',
      hideBreadcrumb: true,
      urls: [{ title: 'Dashboard', url: '/dashboards/dashboard1' }, { title: 'Starter Page' }],
    },
  },
];
