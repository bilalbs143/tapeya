import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { QuickAccountInquiriesComponent } from './quick-account-inquiries.component';

const routes: Routes = [
  {
    path: '',
    component: QuickAccountInquiriesComponent,
    data: {
      title: 'QUICK_ACCOUNT_INQUIRIES',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'SERVICE_CENTRE' }, { title: 'QUICK_ACCOUNT_INQUIRIES' }],
      permission: 'quick_inquiry.view.all',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuickAccountInquiriesRoutingModule {}
