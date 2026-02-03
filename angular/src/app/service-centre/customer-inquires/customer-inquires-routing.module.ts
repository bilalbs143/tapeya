import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CustomerInquiresComponent } from './customer-inquires.component';

const routes: Routes = [
  {
    path: '',
    component: CustomerInquiresComponent,
    data: {
      title: 'CUSTOMER_INQUIRES',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'SERVICE_CENTRE' }, { title: 'CUSTOMER_INQUIRES' }],
      permission: 'customer_inquiry.view.all',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerInquiresRoutingModule {}
