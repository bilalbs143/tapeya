import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BasicInfoComponent } from './basic-info.component';

const routes: Routes = [
  {
    path: '',
    component: BasicInfoComponent,
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
export class BasicInfoRoutingModule {}
