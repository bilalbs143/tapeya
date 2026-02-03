import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BanksComponent } from './banks.component';

const routes: Routes = [
  {
    path: '',
    component: BanksComponent,
    data: {
      title: 'BANKS',
      urls: [{ title: 'DASHBOARD', url: '/' }, { title: 'BANK_MANAGEMENT' }, { title: 'BANKS' }],
      permission: 'banks.view.all',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BanksRoutingModule {}
