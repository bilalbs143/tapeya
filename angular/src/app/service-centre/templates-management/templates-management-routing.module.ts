import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TemplatesManagementComponent } from './templates-management.component';

const routes: Routes = [
  {
    path: '',
    component: TemplatesManagementComponent,
    data: {
      title: 'TEMPLATES_MANAGEMENT',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'SERVICE_CENTRE' }, { title: 'TEMPLATES_MANAGEMENT' }],
      permission: 'template.view.all',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TemplatesManagementRoutingModule {}
