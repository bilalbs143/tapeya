import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FaqsManagementComponent } from './faqs-management.component';

const routes: Routes = [
  {
    path: '',
    component: FaqsManagementComponent,
    data: {
      title: 'FAQS_MANAGEMENT',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'SERVICE_CENTRE' }, { title: 'FAQS_MANAGEMENT' }],
      permission: 'faq.view.all',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FaqsManagementRoutingModule {}
