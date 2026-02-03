import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BasicInfoDetailedComponent } from './basic-info-detailed.component';

const routes: Routes = [
  {
    path: '',
    component: BasicInfoDetailedComponent,
    data: {
      title: 'BASIC_INFO',
      urls: [{ title: 'USER_DETAILS' }, { title: 'BASIC_INFO' }],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BasicInfoDetailedRoutingModule {}
